# feat(spec-03-04): QA 통합 Server Action askQuestion 추가

> 첫 줄 = commit subject 와 일치.

## 📋 Summary

### 배경 및 목적

phase-03까지 인증·검색·프롬프트·LLM 부품이 준비됐으나 이를 묶는 진입점이 없었다. `askQuestion(input)` Server Action으로 인증 게이트 → 입력 검증 → 검색 → 프롬프트 조립 → LLM 호출을 한 곳에 묶고, 화면(spec-03-05)이 분기할 단일 `AskResult` typed result로 정규화한다.

### 주요 변경 사항

- [x] `src/lib/auth/guard.ts` 신규 — `requireUser()` getClaims 기반 공통 인증 가드
- [x] `src/app/qa/actions.ts` 신규 — `askQuestion` + `AskResult`(`'use server'`)
- [x] `src/lib/llm/gemini.ts` — `classifyError` export(재사용, 동작 불변)

### Phase 컨텍스트

- **Phase**: `phase-03`
- **본 SPEC의 역할**: 검색·프롬프트·LLM·인증 부품을 하나의 호출 가능한 mutation으로 통합. 화면(03-05)의 직접 의존 대상.

## 🎯 Key Review Points

1. **인증 방침**: proxy 주 게이트 + `requireUser()` 보조 가드(getClaims). "다층 방어" 과장 없이 로그인 게이트로 정당화. RLS·데이터 격리는 비목표(검색 service-role 전역).
2. **에러 매핑(6종→5종)**: `classifyError` 재사용으로 search throw도 일관 분류. rate-limit/timeout 보존, 나머지 unknown+서버 로그. 시크릿/프롬프트 본문 미누설.
3. **이중 가드 금지**: question 1000자만 가드, 최종 30k는 generateAnswer 위임.
4. **typed object + zod**: k 1~10 클램프(`/api/search`와 동일).

## 🧪 Verification

```bash
pnpm test                 # 27 passed (template 3 + gemini 10 + guard 3 + qa 11)
pnpm exec tsc --noEmit    # clean
pnpm exec eslint src/app/qa src/lib/auth  # 무경고
```

- 라이브 호출 없음 — guard/search/llm mock. 라이브 검증은 phase 통합 시나리오 3으로 이월.

## 📦 Files Changed

### 🆕 New Files
- `src/lib/auth/guard.ts`, `src/lib/auth/__tests__/guard.test.ts`
- `src/app/qa/actions.ts`, `src/app/qa/__tests__/actions.test.ts`

### 🛠 Modified Files
- `src/lib/llm/gemini.ts` (+5, -2): `classifyError` export

## ✅ Definition of Done

- [x] 모든 단위 테스트 통과 (27/27)
- [x] (Integration Test Required = no) N/A
- [x] `walkthrough.md` / `pr_description.md` ship commit
- [x] lint / type check 통과
- [x] 사용자 검토 요청 알림 완료

## 🔗 관련 자료

- Phase: `backlog/phase-03.md` / Base: `phase-03-auth-ui-llm`(머지 대상, main/develop 직접 머지 금지)
- 선행: spec-03-01·02·03 / 후속: spec-03-05(qa-page-ui, 첫 사용처)
