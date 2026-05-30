# Task List: spec-03-03

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (phase-03.md SPEC 표 sdd 자동 갱신)
- [x] 사용자 Plan Accept

---

## Task 1: 브랜치 생성 + 환경변수 셋업

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-03-03-llm-gemini-client` (현재 위치: `phase-03-auth-ui-llm`)
- [x] Commit: 없음 (브랜치 생성만) — 별도로 spec 산출물 commit `22518cd` 선행

### 1-2. `.env.example` 에 Gemini 변수 4 개 추가
- [x] `.env.example` 에 `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS`, `GEMINI_MAX_RETRIES`, `GEMINI_MAX_INPUT_CHARS` 추가 (기본값 포함)
- [-] `.env.local` 도 동일하게 보강 (gitignore 대상, 로컬만) — Pass: 4 변수 모두 코드 기본값 존재로 불필요 + 시크릿 파일이 redacted 되어 안전 편집 불가. 비기본값 필요 시 사용자가 직접 추가.
- [x] Commit: `chore(spec-03-03): add Gemini wrapper env vars to .env.example`

---

## Task 2: Happy Path TDD

### 2-1. 테스트 작성 (TDD Red)
- [x] `src/lib/llm/__tests__/gemini.test.ts` 생성 — `vi.mock('@google/genai', ...)` 셋업
- [x] 시나리오 1 (happy): mock 이 `{ text: '한국어 답변' }` 반환 시 `{ ok: true, answer: '한국어 답변' }` 기대
- [x] `pnpm test src/lib/llm` → import 실패로 Fail 확인 (`Failed to load url ../gemini`)
- [x] Commit: `test(spec-03-03): add gemini wrapper happy path test`

### 2-2. 구현 (TDD Green)
- [x] `src/lib/llm/gemini.ts` 생성 — `GenerateAnswerResult` 타입 + 기본 happy path 만 (env 읽기 + SDK 호출 + 결과 반환)
- [x] `pnpm test src/lib/llm` → 시나리오 1 PASS
- [x] Commit: `feat(spec-03-03): implement generateAnswer happy path`

---

## Task 3: 입력 가드 + 인증 분기 TDD

### 3-1. 테스트 작성 (TDD Red)
- [x] 시나리오 2, 3, 4 추가: 빈 입력 / 한도 초과 / API key 누락 → 각각 `'invalid-input'` / `'invalid-input'` / `'auth'`
- [x] 실행 → Fail 확인 (3 failed | 1 passed)
- [x] Commit: `test(spec-03-03): add input guard and auth-missing tests`

### 3-2. 구현 (TDD Green)
- [x] `generateAnswer` 진입부에 길이 가드 + `GEMINI_API_KEY` 존재 검사 추가
- [x] 실행 → 2/3/4 PASS, 1 회귀 없음 확인 (4/4)
- [x] Commit: `feat(spec-03-03): add input guard and missing-api-key handling`

---

## Task 4: 에러 분류 (auth/network/unknown) TDD

### 4-1. 테스트 작성 (TDD Red)
- [x] 시나리오 8, 9, 10 추가: mock 이 401 / `fetch failed` / 임의 Error throw → 각각 `'auth'` / `'network'` / `'unknown'`
- [x] 실행 → Fail 확인 (3 failed | 4 passed)
- [x] Commit: `test(spec-03-03): add error classification tests`

### 4-2. 구현 (TDD Green)
- [x] `generateAnswer` 의 catch 블록에 에러 message / status 패턴 매칭 분류 로직 추가 (시크릿 누설 가드 포함)
- [x] 실행 → 8/9/10 PASS, 회귀 없음 (7/7)
- [x] Commit: `feat(spec-03-03): classify gemini errors into typed result`

---

## Task 5: 429 백오프 + Timeout TDD

### 5-1. 테스트 작성 (TDD Red)
- [x] 시나리오 5, 6, 7 추가: 429 1회→성공 / 429 N+1회 / timeout (vitest fake timers)
- [x] 실행 → Fail 확인 (3 failed | 7 passed)
- [x] Commit: `test(spec-03-03): add 429 backoff and timeout tests`

### 5-2. 구현 (TDD Green)
- [x] 재시도 루프 (`for attempt in 0..maxRetries`) + 지수 backoff
- [x] `AbortController` + `setTimeout(timeoutMs)` + `Promise.race` 로 timeout 처리
- [x] 실행 → 5/6/7 PASS, 회귀 없음 (전체 10/10 PASS)
- [x] Commit: `feat(spec-03-03): add 429 retry/timeout impl and fix SDK mock` (383e857)

> ⚠ 기록: 앞선 TDD green 커밋(3015854/57cb1c9/f1676f4)은 테스트 mock 의
> `GoogleGenAI` 가 화살표 함수여서 `new` 호출 시 "not a constructor" 로
> 실제로는 통과하지 못했음. 본 커밋(383e857)에서 mock 을 일반 함수로 고쳐
> 비로소 10/10 PASS 확인. 5-2 구현과 mock 수정을 한 커밋에 묶었다.

---

## Task 6: Ship

> `/hk-ship` 절차.

- [x] 코드 품질 점검: `tsc --noEmit` 통과(EXIT 0), `eslint src/lib/llm` 무경고(EXIT 0)
- [x] 전체 테스트 실행: `vitest run src/lib/llm` → 10/10 PASS (EXIT 0)
- [-] (Integration Test Required = no) 통합 테스트 N/A
- [x] **walkthrough.md 작성** — 결정 기록 (typed result, systemInstruction 미사용, 재시도 정책), 발견 사항, 이월 항목 (라이브 검증은 03-04 로)
- [x] **pr_description.md 작성** — 템플릿 준수
- [x] **Ship Commit**: `docs(spec-03-03): ship walkthrough and pr description`
- [x] **Push**: `git push -u origin spec-03-03-llm-gemini-client`
- [x] **PR 생성**: `gh pr create` (대상 브랜치: `phase-03-auth-ui-llm` — phase base, develop 직접 머지 금지)
- [x] **사용자 알림**: 푸시 완료 + PR URL 보고

> ⚠ Task 1-2 의 `.env.example` 변경은 **에이전트 권한 차단**으로 미반영.
> 사용자가 직접 4 줄(GEMINI_MODEL/TIMEOUT_MS/MAX_RETRIES/MAX_INPUT_CHARS) 추가 필요.
> 단, 모두 코드 기본값 존재로 동작에는 영향 없음(문서화 목적).

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 6 (Pre-flight + 5 작업 + 1 Ship) |
| **예상 commit 수** | 10 (env 1 + TDD red/green 4 쌍 = 8 + Ship 1, 브랜치 생성은 commit 없음) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-30 |
