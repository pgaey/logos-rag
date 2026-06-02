# Walkthrough: spec-03-05

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| action 호출 방식 | `useActionState(prevState, formData)` / `useState`+`useTransition` 직접 호출 | **`useState`+`useTransition` 직접 호출** | `askQuestion` 은 typed object 인자(`{ question, k? }`)라 `useActionState` 의 `(prevState, formData)` 시그니처와 안 맞음. 어댑터 없이 직접 호출이 자연스러움. (login 은 FormData라 useActionState 사용) |
| reason→메시지 위치 | 컴포넌트 인라인 / 순수 함수 분리 | **순수 함수 `messages.ts` 분리** | UI 에서 떼어내 vitest(node env)로 단위 테스트 가능. jsdom 불필요. |
| reason 집합의 진실 공급원 | spec 표 기재(4종) 신뢰 / 실제 코드 확인 | **실제 `actions.ts` 의 `AskResult` union(5종) 확인 후 일치** | phase 표 spec-03-04 항목엔 `timeout` 누락(4종)이었으나 실제 코드는 5종. `messages.ts` 의 `Record` 키를 `Extract<AskResult,{ok:false}>['reason']` 으로 타입에서 끌어와 향후 reason 변경 시 컴파일 에러로 누락 강제. |
| 인증 가드 | page 에서만 / proxy+action 다층 | **proxy(주) + page `requireUser()`(UX 유도) + action 자체 재검증(권위 게이트)** | spec-03-04 주석대로 server action 자체가 권위 있는 보안 게이트. page redirect 는 UX. guard.ts `requireUser` 재사용(DRY). |
| verse 0건 | 빈 영역 / 안내 문구 | **"관련 구절을 찾지 못했습니다." 표시** | 답변만 있고 근거 없는 상태를 사용자에게 명시. |

### ADR 승격 가이드

- [ ] ADR 승격 대상 있음
- [x] 없음 — UI 컴포넌트 추가 + 기존 패턴(useTransition, guard 재사용) 답습. 결정은 walkthrough 기록으로 충분.

## 💬 사용자 협의

- **주제**: PR #18(spec-03-06) 머지 후 다음 작업
  - **사용자 의견**: "1번 ㄱㄱ" — 머지 finalize 후 spec-03-05 착수.
  - **합의**: base 브랜치 `phase-03-auth-ui-llm` 를 #18 머지로 ff 갱신 → spec-03-05 브랜치 생성 → Plan Accept → 구현.
- **주제**: "RAG 깊이를 판다"(phase-05 retrieval-quality) 아이디어 반영
  - **사용자 의견**: 다른 패널(langchain)에서 정리된 지도를 이 프로젝트에 기록.
  - **합의**: langchain 패널에서 선택된 option 1(지도만 기록, 실행 보류)대로 `backlog/queue.md` 📋 대기 Phase 에 캡처. 실행은 미래 Phase.

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: `pnpm test`
- **결과**: ✅ Passed (34 tests, 5 files)
- **로그 요약**:
```text
 Test Files  5 passed (5)
      Tests  34 passed (34)
```
- spec-03-05 신규: `messages.test.ts` 7 tests (5종 reason 메시지 + 4종 구분 + fallback). 기존 `actions.test.ts` 등 회귀 없음.

#### 타입 체크
- **명령**: `pnpm exec tsc --noEmit`
- **결과**: ✅ Passed (no errors)

#### Lint
- eslint **미설치** — staged-lint hook 이 skip. (`npm install -g eslint` 필요) → 본 spec 에선 tsc 가 타입/임포트 검증 대체.

#### 통합 테스트
- Integration Test Required = **no**. 화면 동작은 phase 통합 시나리오 2(수동)로 검증 예정.

### 2. 수동 검증

> 로컬 dev 서버 수동 시나리오는 phase 통합 단계(시나리오 1·2)에서 사용자가 직접 수행. 본 spec 에선 코드/타입/단위 테스트까지 검증.

1. **Action**: `pnpm exec tsc --noEmit`
   - **Result**: 에러 없음 — RSC/client 경계, server action import, 타입 좁힘 모두 통과.

## 🔍 발견 사항

- phase-03.md 의 spec-03-04 `AskResult` 기재가 4종(timeout 누락)으로 실제 코드(5종)와 어긋나 있었음. 코드를 진실 공급원으로 삼아 `messages.ts` 를 타입 파생으로 작성 → 향후 동기화 강제.
- spec-03-06 이 spec-03-05 보다 먼저 진행·머지된 out-of-order 상태였음. phase.md 표의 spec-03-06 을 수동으로 Merged 로 정정(sdd 자동 갱신이 post-hoc 로는 안 됨).

## 🚧 이월 항목

- **phase-05 후보 — retrieval-quality** ("RAG 깊이를 판다") → `backlog/queue.md` 📋 대기 Phase 에 기록됨. 실행은 미래 Phase.
- 화면 렌더 통합 테스트(jsdom) → 테스트 환경 미설정으로 보류. 수동 검증 대체.

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent + @pgaey |
| **작성 기간** | 2026-05-31 ~ 2026-06-02 |
| **최종 commit** | (ship commit 후 기입) |
