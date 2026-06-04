# Walkthrough: spec-04-02

> 프롬프트 인젝션 가드(포맷 위생 + system 방어) + AI 면책 표기.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| sanitize 의 역할 정의 | "인젝션 차단" / "포맷 무결성 위생" | **포맷 무결성 위생** | critique 반영. 정적 필터는 자연어 인젝션을 못 막음 — 실질 방어선은 SYSTEM_INSTRUCTION. sanitize 는 헤더 흉내로 인한 파싱 혼선만 정리. |
| 제어문자 범위 | 모호("일반 공백 외") / 명시 코드포인트 | **명시: `\x00-\x08 \x0B \x0C \x0E-\x1F \x7F`** (탭·개행 보존) | 구현자 해석 분기 제거(critique). |
| 헤더 중화 방식 | 대괄호 제거 / 치환 병기 | **대괄호만 제거(`[System]`→`System`)** 단일 규칙 | 테스트 가능한 단일 출력(critique). |
| 검색 쿼리 sanitize | 적용 / 미적용 | **미적용**(buildPrompt 안에서만) | 검색은 임베딩 유사도라 LLM 지시 통로 아님 — 인젝션 무관(의도). |
| 거절 경계 | 무조건 거절 / 정상 질문 예외 | **근거 빈약한 정상 질문은 "근거 부족" 정직히 답, 무관/악의만 거절** | 정상 질문 거절 회귀 방지(critique). |
| 구조적 채널 분리(대안 A) | 본 spec 포함 / 이연 | **이연(Icebox)** | `systemInstruction` 분리는 더 견고하나 buildPrompt/generateAnswer 시그니처 변경 → spec-02/03 회귀. MVP·회귀없음 제약과 충돌. |

### ADR 승격 가이드
- [x] ADR 승격 대상 있음(이연): `prompt-system-channel-separation`(type: decision) — 대안 A 채택 시 작성. 현재는 Icebox(`backlog/queue.md`) 기록만.
- [ ] 없음

## 💬 사용자 협의

- **주제**: critique(대안 B) 반영 범위
  - **합의**: 6건(제어문자 범위·중화 규칙·재명명·효능 한계·검색 미적용·거절 경계) 전부 반영, 7번(대안 A)은 Icebox 이연.
- **주제**: 면책 수동 확인
  - **합의**: 사용자가 `/qa` 입력란 하단 면책 문구 상시 표시 확인("2번 보인다"). PASS.
- **주제**: 인젝션 수동 시나리오(악성 질문 → 역할 유지)
  - **합의**: Gemini quota 소진으로 본 spec 에선 생략 — 가드는 단위 테스트로 검증, 모델 행동은 후속 확인(plan 대로).

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: `pnpm test`
- **결과**: ✅ Passed (54 tests, 6 files)
- 신규: `template.test.ts` — `sanitizeQuestion` 5건(헤더 중화/대소문자/제어문자·탭개행 보존/정상 질문 보존/trim) + buildPrompt 인젝션·방어문구 2건. 기존 3건 회귀 유지.

#### 타입 체크
- **명령**: `pnpm exec tsc --noEmit`
- **결과**: ✅ clean

### 2. 수동 검증

1. **Action**: (사용자) `pnpm dev` → `/qa` 입력란 하단 면책 노출 확인
   - **Result**: 면책 문구 상시 표시 PASS.
2. **Action**: 인젝션 수동(악성 질문 → 역할 유지)
   - **Result**: Gemini quota 소진으로 생략 — 후속 확인(가드는 단위 테스트로 검증됨).

## 🔍 발견 사항

- **critique 의 핵심 교훈**: 입력 sanitize 는 프롬프트 인젝션을 *막는* 수단이 아니라 *포맷 위생*일 뿐이다. 효능을 정직하게 서술하고(실질 방어 = system 지시 + best-effort), 단위 테스트가 검증하는 범위(문자열 변환 ≠ 모델 행동)를 명확히 했다.
- **대안 A(`systemInstruction` 구조 분리)** 가 OWASP 1순위 권고이나 회귀 비용으로 이연 — Icebox 기록.

## 🚧 이월 항목

- 프롬프트 system 채널 구조 분리(대안 A) → `backlog/queue.md` Icebox
- 인젝션 모델 행동 수동/통합 검증 → Gemini quota 회복 후 또는 후속 spec

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent + @pgaey |
| **작성 기간** | 2026-06-04 |
| **최종 commit** | (ship commit 시 기록) |
