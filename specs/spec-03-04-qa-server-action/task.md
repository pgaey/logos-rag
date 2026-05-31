# Task List: spec-03-04

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성 (sdd spec new)
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (phase-03.md SPEC 표 sdd 자동 갱신)
- [ ] 사용자 Plan Accept

---

## Task 1: 브랜치 생성 + 사전 확인

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-03-04-qa-server-action` (현재 위치: `phase-03-auth-ui-llm`)
- [x] Commit: 없음 (브랜치 생성만)

### 1-2. `'use server'` 타입 export 제약 확인 (docs)
- [x] `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-server.md` 확인
- [x] 결정: **`AskResult`를 actions.ts 동일 파일 export.** docs는 타입 export 금지 안 함(제약은 함수 async + 직렬화 가능한 인자/반환값 = 런타임 값 한정. type은 컴파일 타임 소거되어 무관). 기존 login/actions.ts도 `type AuthState` 동일 파일 export 중 → types.ts 분리 불필요.
- [x] Commit: 없음 (조사만)

---

## Task 2: requireUser 가드 TDD

### 2-1. 테스트 작성 (TDD Red)
- [x] `src/lib/auth/__tests__/guard.test.ts` — `createClient` mock. getClaims→claims면 claims 반환, 없으면 null (3 시나리오)
- [x] `pnpm test src/lib/auth` → Fail 확인 (Failed to load ../guard)
- [x] Commit: `test(spec-03-04): add requireUser guard tests`

### 2-2. 구현 (TDD Green)
- [x] `src/lib/auth/guard.ts` — `requireUser()` (createClient → getClaims → data?.claims ?? null)
- [x] `pnpm test src/lib/auth` → PASS (3/3)
- [x] Commit: `feat(spec-03-04): add requireUser auth guard helper`

---

## Task 3: classifyError export

### 3-1. gemini.ts에서 classifyError 노출
- [ ] `src/lib/llm/gemini.ts` 의 `classifyError` 에 `export` 추가
- [ ] `pnpm test src/lib/llm` → 회귀 없음(기존 10 PASS 유지)
- [ ] Commit: `refactor(spec-03-04): export classifyError for reuse in askQuestion`

---

## Task 4: askQuestion 인증·입력검증 TDD

### 4-1. 테스트 작성 (TDD Red)
- [ ] `src/app/qa/__tests__/actions.test.ts` — guard/search/llm 모듈 mock 셋업
- [ ] 시나리오 1(정상), 2(미인증), 3(빈 질문), 4(과길이), 5(k 클램프) 작성
- [ ] `pnpm test src/app/qa` → Fail 확인
- [ ] Commit: `test(spec-03-04): add askQuestion auth and input-validation tests`

### 4-2. 구현 (TDD Green)
- [ ] `src/app/qa/actions.ts` (+ 필요시 `types.ts`) — requireUser → zod parse → searchVerses → buildPrompt → generateAnswer 골격 + 정상/unauthorized/invalid-input/k클램프 경로
- [ ] `pnpm test src/app/qa` → 1~5 PASS
- [ ] Commit: `feat(spec-03-04): implement askQuestion happy path with auth and zod`

---

## Task 5: 에러 매핑 TDD

### 5-1. 테스트 작성 (TDD Red)
- [ ] 시나리오 6~11 추가: search throw(429/기타), generate rate-limit/timeout/auth, verses 0건
- [ ] `pnpm test src/app/qa` → Fail 확인
- [ ] Commit: `test(spec-03-04): add error mapping and empty-result tests`

### 5-2. 구현 (TDD Green)
- [ ] searchVerses try/catch에 `classifyError` 적용, generateAnswer reason 매핑(timeout 별도, auth/network/invalid-input/unknown→unknown + detail 로그)
- [ ] `pnpm test src/app/qa` → 전체 PASS, 회귀 없음
- [ ] Commit: `feat(spec-03-04): map search and llm errors to AskResult`

---

## Task 6: Ship

> `/hk-ship` 절차.

- [ ] 코드 품질: `pnpm exec tsc --noEmit`, `eslint src/app/qa src/lib/auth`
- [ ] 전체 테스트: `pnpm test` → 모두 PASS
- [ ] (Integration Test Required = no) 통합 테스트 N/A
- [ ] **walkthrough.md 작성** — 결정 기록(인증 방침, classifyError 재사용, 에러 매핑, 타입 export 위치), 발견, 이월(라이브 검증은 phase 통합)
- [ ] **pr_description.md 작성** — 템플릿 준수
- [ ] **Ship Commit**: `docs(spec-03-04): ship walkthrough and pr description`
- [ ] **Push**: `git push -u origin spec-03-04-qa-server-action`
- [ ] **PR 생성**: `gh pr create` (대상: `phase-03-auth-ui-llm`)
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 6 (Pre-flight + 5 작업 + 1 Ship) |
| **예상 commit 수** | 9 (guard red/green 2 + classifyError 1 + askQuestion red/green 2 + 에러매핑 red/green 2 + Ship 1, Task1 commit 없음) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-31 |
