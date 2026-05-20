# Task List: spec-03-01

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성 (`sdd spec new supabase-auth-setup`)
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (`backlog/phase-03.md` SPEC 표 자동 갱신)
- [ ] 사용자 Plan Accept

---

## Task 1: 공식 문서 조사 + 브랜치 생성

> Supabase 공식 가이드 (`@supabase/ssr` + Next.js App Router) 를 context7 로 조회하여, plan.md 의 파일 경로/시그니처가 최신 권장과 일치하는지 검증. 차이가 있으면 plan.md 를 먼저 갱신한 후 다음 task 진행.

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-03-01-supabase-auth-setup` (브랜치 이름 = spec 디렉토리 이름)
- [x] Commit: 없음 (브랜치 생성만)

### 1-2. context7 로 공식 문서 조회
- [x] context7 MCP: `@supabase/ssr` Next.js App Router 통합 가이드 조회 (`/supabase/ssr`)
- [x] Next.js 16 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` 직접 확인 (AGENTS.md 지침)
- [x] 결과를 본 task 1-3 의 spec.md / plan.md 갱신 입력으로 사용

### 1-3. 차이 발견 시 plan.md / spec.md 갱신
- [x] 공식 가이드와 plan.md 의 파일 경로/시그니처 비교. 차이 발견 시 plan.md 의 [NEW] 섹션 갱신.
- [x] (선택) spec.md 의 요구사항 6~7 항목도 함께 갱신.
- [ ] Commit: `docs(spec-03-01): align plan with latest @supabase/ssr and next.js 16 proxy`
  - 발견 사항: ① Next.js 16: `middleware.ts` → `proxy.ts` 리네임 ② Supabase: cookie adapter `get/set/remove` deprecated → `getAll/setAll` 사용 ③ Supabase 공식 middleware 예시 직역 (request.cookies.set + response.cookies.set 동시 갱신)

---

## Task 2: 의존성 추가 + 환경 변수 문서화

### 2-1. 패키지 설치
- [x] `pnpm add @supabase/ssr` → 0.10.3 설치
- [x] `package.json` / `pnpm-lock.yaml` 변경 확인

### 2-2. 환경 변수 확인
- [x] `.env.example` 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 이미 존재 — 변경 불필요 (key 이름이 신규 형식이라 spec/plan 만 정정함)
- [x] `.env.local` 은 개인 환경 — 사용자가 본인 값으로 채워둠
- [ ] Commit: `chore(spec-03-01): add @supabase/ssr dependency`

---

## Task 3: isProtectedPath 유틸 (TDD)

### 3-1. 테스트 작성 (TDD Red)
- [x] `src/lib/supabase/__tests__/protected-paths.test.ts` — 7 케이스 (정확 매칭 / prefix / 중첩 / 비보호 / phase-02 search 비보호 / root / prefix substring false)
- [x] `pnpm test` → Fail 확인 ("Cannot find module '../protected-paths'")
- [x] Commit: `test(spec-03-01): add failing tests for isProtectedPath`

### 3-2. 구현 (TDD Green)
- [x] `src/lib/supabase/protected-paths.ts` 작성 — `PROTECTED_PREFIXES` 상수 + `isProtectedPath` 함수
- [x] `pnpm test` → 10/10 PASS
- [x] Commit: `feat(spec-03-01): implement isProtectedPath utility`

---

## Task 4: Supabase server / client 헬퍼

> 발견: `src/lib/supabase/server.ts` / `client.ts` 가 phase-01 산출물로 이미 존재 (`createServerSupabase`, `createBrowserSupabase`). 덮어쓰면 phase-02 회귀 — 신규 `createClient` 를 추가 export 로 공존시킴 (plan 의 [NEW] 는 [MODIFY] 가 정확).

### 4-1. 서버 헬퍼
- [x] `src/lib/supabase/server.ts` — `createClient()` 추가 (cookie 기반, SSR 인식). 기존 `createServerSupabase` 는 service-key 용도로 유지.
- [x] Commit: `feat(spec-03-01): add SSR-aware createClient to supabase/server`

### 4-2. 브라우저 헬퍼
- [x] `src/lib/supabase/client.ts` — `createClient()` 추가 (@supabase/ssr createBrowserClient 사용). 기존 `createBrowserSupabase` 는 비-SSR 용도로 유지.
- [x] Commit: `feat(spec-03-01): add SSR-aware createClient to supabase/client`

> Task 4 는 SDK wrapper 라 단위 테스트 ROI 낮음 — TDD 면제 (constitution §9.1 framework wiring 으로 분류, walkthrough 에 사유 기록).

---

## Task 5: proxy (Next.js 16) + updateSession 통합

> Next.js 16 에서 `middleware.ts` → `proxy.ts` 로 리네임됨. 본 task 는 새 명명을 사용.

### 5-1. updateSession 헬퍼
- [x] `src/lib/supabase/proxy.ts` — `updateSession(request)` (Supabase 공식 가이드 직역 + `isProtectedPath` 분기)
- [x] Commit: `feat(spec-03-01): add updateSession helper for next.js 16 proxy`

### 5-2. proxy.ts 루트 파일
- [x] `proxy.ts` (프로젝트 루트) — `updateSession` 호출 + matcher 설정
- [x] `pnpm build` → 빌드 PASS, `ƒ Proxy (Middleware)` 라우트 정상 컴파일
- [x] `pnpm dev` → 서버 기동, smoke: `GET /` 404 (페이지 없음, 예상대로) / `GET /qa` 307 redirect → /login (proxy + updateSession + isProtectedPath 동작 확인)
- [ ] Commit: `feat(spec-03-01): wire proxy with session refresh and protected matcher`

---

## Task 6: Lint / TypeCheck 점검

- [x] `pnpm lint` → PASS (warning/error 0)
- [x] `pnpm exec tsc --noEmit` → PASS (에러 0)
- [x] 변경 없음 → commit 생략

---

## Task 7: Ship (필수)

> `/hk-ship` 절차를 따릅니다.

- [ ] `pnpm test` → 전체 PASS
- [ ] `pnpm lint`, `pnpm exec tsc --noEmit` → 모두 PASS
- [ ] **walkthrough.md 작성** (구현 결과, 공식 가이드와의 일치 여부, 결정 기록 "auth-cookie-session" ADR 후보 처리 등)
- [ ] **pr_description.md 작성** (템플릿 준수)
- [ ] **Ship Commit**: `docs(spec-03-01): ship walkthrough and pr description`
- [ ] **Push**: `git push -u origin spec-03-01-supabase-auth-setup`
- [ ] **PR 생성**: `/hk-pr-gh` 또는 `gh pr create` — base 는 `phase-03-auth-ui-llm` (sdd 가 ship 시 자동 생성)
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 7 |
| **예상 commit 수** | 8 (Task 1-3 선택, Task 4 분할, Task 6 선택 포함 기준 6~10) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-20 |
