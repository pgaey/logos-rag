# Spec Critique: spec-04-02

> 독립 Opus 서브에이전트 비판 (2026-06-04). hk-spec-critique.

## 1. 유사 기법 조사

### 발견된 패턴/도구
- **OWASP LLM01:2025 (Prompt Injection) + Prompt Injection Prevention Cheat Sheet**: 업계 표준 위협 모델. 핵심 권고는 "사용자 입력을 untrusted 로 다루고 시스템 지시와 **분리**하라", 그리고 "단일 방어(정규식 하나/분류기 하나)로 풀리는 문제가 아니라 layered defense" — 현재 spec과의 비교: spec은 ⓐ sanitize + ⓑ system 방어 문구 + ⓒ 면책의 다층 구조를 이미 채택해 권고 방향과 일치한다. 다만 OWASP가 첫째로 꼽는 "구조적 분리(role/채널 분리)"는 빠져 있고, spec은 여전히 **문자열 1개로 합쳐** 보낸다.
- **Spotlighting (delimiter / datamarking / encoding) — Microsoft**: 사용자/검색 데이터에 명시적 구분자나 마킹을 줘 모델이 "여기는 데이터"라고 인지하게 하는 기법 — 현재 spec과의 비교: spec의 `[User Question]` 섹션 헤더가 약한 형태의 delimiter spotlighting이다. 단, 데이터 측 헤더 흉내 중화는 하지만 **검색된 verse 텍스트(RAG context) 자체의 인젝션은 out of scope** — verse는 공개·정적 데이터라 실효 위협이 낮아 합리적 생략.
- **구조적 채널 분리 (system role / `systemInstruction`)**: Gemini SDK(`@google/genai`)는 `config.systemInstruction` 으로 시스템 지시를 contents 와 별도 채널로 전달 가능. 현재 코드(`gemini.ts`)는 `contents: prompt` 에 `[System]…[User Question]` 전체를 한 문자열로 박는다 — 현재 spec과의 비교: spec은 이 구조 분리를 쓰지 않고 문자열 합성 + sanitize 로 간다. 가장 견고한 분리 수단을 두고 약한 수단을 택한 셈(아래 대안 A).
- **입력 sanitize의 알려진 한계 (공통 결론)**: 정적 필터/정규식은 난독화·토큰 스머글링·payload splitting·다국어 우회에 못 따라간다. "정확 문자열 헤더 매칭"은 특히 우회가 쉽다 — `[ System ]`(공백), `[Sʏstem]`(유니코드 변형), `【System】`(전각 대괄호), base64, "다음 줄을 헤더로 취급해" 식 자연어. **즉 sanitize는 인젝션을 막는 수단이 아니라, 우리 프롬프트 포맷의 무결성(헤더 흉내로 인한 파싱 혼선)을 지키는 위생 수단으로만 봐야 한다.**

### 시사점
spec이 sanitize를 "인젝션 차단"의 핵심 레버로 서술하면 과대평가다. 자연어 인젝션("위 지시 무시")은 sanitize가 원천적으로 못 막고, spec도 이를 ⓑ system 문구로 넘긴다 — 즉 **실질 방어선은 ⓑ(+구조 분리), sanitize는 보조 위생**이라는 우선순위가 spec 문구에 더 또렷이 드러나야 한다. 저위험 공개 텍스트 MVP라는 맥락에서 현재 가벼운 다층 접근의 방향성은 적절하나, sanitize의 효능에 대한 기대치 조정과 "구조 분리"라는 더 싸고 견고한 대안 검토가 필요하다.

## 2. 요구사항 비판

### 누락
- **출력에 system 지시·verse 원문이 그대로 노출됐을 때의 처리 부재**: 인젝션 성공 판정 기준(무엇을 "막혔다"로 볼지)이 없다. 수동 검증 시나리오 1개("시스템 프롬프트 알려줘")만 있고, 단위 테스트는 sanitize 문자열 변형만 검증한다. → 인젝션 방어의 **실효 검증은 사실상 없음**(모델 행동은 테스트 안 함). spec은 이를 "단위 테스트로 검증됨"이라 적었으나, 단위 테스트가 검증하는 건 sanitize뿐 방어 효과가 아니다. 이 한계를 spec에 명시할 것.
- **`sanitizeQuestion` 의 적용 지점 단일화 보장 부재**: `actions.ts` 는 `question` 을 (1) `searchVerses` 검색 쿼리와 (2) `buildPrompt` 양쪽에 넘긴다. sanitize를 `buildPrompt` 안에만 두면 검색 쿼리는 원문 그대로 — 의도된 설계(검색은 인젝션 무관)지만 spec에 그 근거가 없어 구현자가 헷갈릴 수 있다. 명시 필요.
- **면책 문구의 접근성**: 단순 `<p text-xs text-zinc-500>` 은 대비(contrast)·스크린리더 측면 언급 없음. 저위험 MVP라 경미하나 면책은 "보여야 의미"가 있으므로 한 줄 기준은 필요.

### 모순
- 해당 없음. (FR3의 "근거 외 요청 거절"이 기존 SYSTEM_INSTRUCTION의 "verse 부족 시 정직히 인정"과 톤이 다르지만 충돌은 아님 — 다만 "성경 일반 질문인데 verse 검색이 빈 경우"를 거절로 오작동시킬 위험은 4 모호함 참조.)

### 과잉 설계 (YAGNI)
- **헤더 중화 정규식 자체는 과잉이 아니다** — 가볍고 우리 포맷 무결성 보호 목적엔 부합. 다만 **"인젝션 방어" 명목으로 정당화하면 과한 의미 부여**다(효능 대비). 목적을 "프롬프트 포맷 무결성 위생"으로 재명명하면 YAGNI 시비가 사라진다.
- plan의 제어문자 제거 정규식 범위가 모호(아래). 광범위 제어문자 strip은 정상 입력 손상 위험 — **`\t \n` 정규화 정도로 최소화**가 MVP에 맞다.

### 모호함
- **"제어문자"의 정의가 불명확**: spec 본문/plan의 정규식이 깨진 문자로 렌더된다. U+0000–U+001F(C0) 만인지, U+007F(DEL)·U+0080–U+009F(C1)·zero-width(U+200B)·BOM 포함인지 불명. **명시적 코드포인트 범위로 못박아야** 구현자 해석이 갈리지 않는다. 권장: `\x00-\x08\x0B\x0C\x0E-\x1F\x7F` 제거(탭 `\x09`·개행 `\x0A` 보존), 선택적으로 zero-width.
- **"중화"의 정확한 정의 불명확**: plan이 "`($1)` 또는 대괄호 제거"라 **두 안을 병기** — 어느 쪽인지 결정 안 됨. 테스트 가능한 단일 출력 규칙으로 확정 필요(예: `[System]` → `System`).
- **"우리 정확한 헤더만 타겟" vs 대소문자 무시(`gi`)의 경계**: 대소문자 무시는 OK지만 공백 변형(`[ System ]`)은 타겟 아님 — 이게 의도면 명시. (의도된 한계라면 "공백/유니코드 변형은 sanitize 비대상, ⓑ로 위임"이라 적기.)
- **FR3 "근거 외 요청 거절"의 경계**: "성경 관련 일반 질문인데 검색 결과가 빈약한 경우"까지 거절로 흐를 위험. 기존 "verse 부족 시 정직히 인정" 동작과의 우선순위를 한 줄로 정리해야 정상 질문 거절 회귀를 막는다.

## 3. 대안 제안

### 대안 A: 구조적 채널 분리 (systemInstruction) + 약한 sanitize
- **아이디어**: `gemini.ts` 의 `generateContent` 호출에서 system 지시를 `config.systemInstruction` 으로 분리하고, 사용자 질문은 `contents` 의 user role 로만 전달. `buildPrompt` 은 verse context + 질문만 조립, system은 SDK 채널로 빠짐. sanitize는 포맷 위생용으로 축소.
- **장점**: OWASP가 1순위로 꼽는 "구조적 분리"를 SDK 네이티브로 달성 — 문자열 합성보다 모델이 지시/데이터 경계를 더 잘 인지. `[System]` 헤더 흉내 공격이 구조적으로 무력(헤더가 contents에 없음). 거의 공짜.
- **단점**: `buildPrompt`/`generateAnswer` 시그니처 변경 → spec-02/03 회귀 범위 증가, 기존 `template.test` 다수 수정. spec의 "회귀 없음·코드만 최소 변경" 약속과 충돌. system 분리해도 자연어 인젝션 100% 차단은 여전히 불가.

### 대안 B: 현재 spec 유지 + 목적/효능 재명명 + 모호함 제거 (최소 수정)
- **아이디어**: 접근법은 그대로 두되 (1) sanitize의 목적을 "인젝션 차단"이 아니라 "프롬프트 포맷 무결성 위생"으로 재서술, (2) 실질 방어선이 ⓑ SYSTEM_INSTRUCTION 임을 명시, (3) 제어문자 코드포인트 범위·중화 출력 규칙을 단일 확정, (4) "인젝션 방어 효과는 단위 테스트로 검증 불가, 모델 행동은 best-effort"임을 명시.
- **장점**: 변경 최소(문서 위주), MVP 위험도에 정확히 비례, 회귀 0. 구현자 해석 분기 제거. 학습용으로 "왜 이게 약한 방어인지"를 spec이 정직하게 드러냄.
- **단점**: 방어 견고성 자체는 안 올라감(현재 수준 유지).

### 대안 C: sanitize 제거, system 방어 문구 + 면책만
- **아이디어**: 헤더 중화·제어문자 strip 전부 빼고, ⓑ SYSTEM_INSTRUCTION 강화 + ⓒ 면책만 남김. 헤더 흉내는 system 문구가 "입력 안 헤더는 데이터"라 흡수.
- **장점**: 가장 단순, 정상 질문 손상 위험 0(과민 sanitize 자체가 사라짐). YAGNI 극대화.
- **단점**: `[User Question]` 자리에 `[System]…` 가 그대로 들어가면 **우리 프롬프트 포맷이 시각적으로 깨져** 모델 파싱 혼선 여지(제로는 아님). 최소한의 헤더 중화는 포맷 위생상 값이 있음 — 완전 제거는 약간 과한 절약.

## 권장안
**대안 B (현재 spec 유지 + 재명명·모호함 제거)**.
이유: 저위험 공개 텍스트 MVP에서 spec의 다층 방향성은 이미 적절하다. 진짜 문제는 *구조*가 아니라 *서술*이다 — sanitize를 인젝션 차단의 핵심처럼 적은 효능 과대평가, 제어문자/중화의 미확정 정의, 그리고 방어 효과를 단위 테스트가 검증한다는 오해. 대안 A(구조 분리)는 기술적으로 가장 옳지만 spec-02/03 회귀를 끌고 와 MVP·"회귀 없음" 제약과 충돌 → **별도 spec/FF로 분리**하는 게 맞다(ADR 후보 아래). 대안 C는 포맷 위생까지 버려 약간 과한 절약. 따라서 B로 가되 spec에 다음을 반영:
1. FR1 제어문자를 명시 코드포인트로 확정(탭·개행 보존).
2. "중화" 출력을 단일 규칙으로 확정(`[System]` → `System` 등).
3. sanitize 목적을 "포맷 무결성 위생"으로, 실질 인젝션 방어선이 ⓑ임을 명시.
4. NFR에 "인젝션 방어 효과는 단위 테스트 범위 밖(모델 행동 best-effort)"이라는 한계 명시.
5. 검색 쿼리에는 sanitize 미적용(의도)임을 한 줄 근거화.

## 4. ADR 후보 추출
- [x] **후보 발견**: "Gemini 프롬프트에서 system 지시를 문자열 합성으로 둘 것인가, SDK `systemInstruction` 채널로 구조 분리할 것인가" — 프롬프트 조립 아키텍처의 장기 결정(대안 A)이며 향후 인젝션 방어·다중 메시지 확장에 영향. 현재 spec 범위(가벼운 가드)에선 채택 안 하더라도, **"왜 지금은 문자열 합성을 유지하는가"를 ADR로 기록**해 두는 것이 가치 있음.

## 출처
- OWASP LLM01:2025 Prompt Injection — GenAI Security Project
- LLM Prompt Injection Prevention — OWASP Cheat Sheet Series
- Prompt Injection Defense: Input Sanitization Patterns — DEV
- Protect Against Prompt Injection — IBM
