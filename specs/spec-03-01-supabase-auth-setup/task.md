# Task List: spec-03-01

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.
>
> **실행 기록 메모**: 본 task.md 는 plan 작성 시 의도된 분해입니다. 실제 실행은 사용자가 공식 가이드 기준으로 진행했고, plan 과 다른 부분은 ✏️ 표시 + walkthrough.md 에 사유 기록.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성 (`sdd spec new supabase-auth-setup`)
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (`backlog/phase-03.md` SPEC 표 자동 갱신)
- [x] 사용자 Plan Accept

---

## Task 1: 공식 문서 조사 + 브랜치 생성

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-03-01-supabase-auth-setup`
- [x] Commit: 없음 (브랜치 생성만)

### 1-2. context7 로 공식 문서 조회
- [x] context7 MCP: `@supabase/ssr` Next.js App Router 통합 가이드 조회
- [x] Next.js 16 `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` 직접 확인

### 1-3. 차이 발견 시 plan.md / spec.md 갱신 (이전 세션 develop 에 반영됨)
- [x] develop 의 두 docs commit (0783a3d, 452226e) 으로 반영 완료. 본 spec 브랜치에서는 별도 commit 없음.
  - ① Next.js 16: `middleware.ts` → `proxy.ts` 리네임
  - ② Supabase: cookie adapter `get/set/remove` deprecated → `getAll/setAll`
  - ③ Env 변수명 `ANON_KEY` → `PUBLISHABLE_KEY` (프로젝트 실제 컨벤션)
  - ✏️ 사용자가 추가 발견 (walkthrough 참고):
    - `supabase.auth.getUser()` 보다 **`getClaims()`** 가 middleware/proxy 용도로 더 안전 (JWT 서명 검증)
    - `setAll` 두 번째 인자 `headers` (cache-control) 를 `supabaseResponse.headers` 에 적용 필수 (CDN 세션 누수 방지)

---

## Task 2: 의존성 추가 + 환경 변수 문서화

### 2-1. 패키지 설치
- [x] `pnpm add @supabase/ssr` → `^0.10.3`
- [x] `package.json` / `pnpm-lock.yaml` 변경 확인

### 2-2. 환경 변수 확인
- [x] `.env.example` 에 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 이미 존재 — 추가 변경 불필요
- [x] Commit: `chore(spec-03-01): add @supabase/ssr and migrate app/ → src/app/` (의존성 + 디렉토리 이전 통합)

### 2-3. ✏️ Plan 외 추가: app/ → src/app/ 마이그레이션
- [x] `app/api/search/route.ts` → `src/app/api/search/route.ts` 이전 (Next.js src-folder 컨벤션)
- [x] root `app/` 디렉토리 제거. 이유: phase-03 UI 페이지를 src/app/ 아래에 구성하기 위함

---

## Task 3: isProtectedPath 유틸 [-] Passed

- [-] **Skipped** — 사용자가 path-exclusion 모델 (`/login`, `/auth` 외 전부 보호) 채택, plan 의 path-inclusion (`/qa`, `/api/qa` 만 보호) 보다 default-deny 가 더 안전. proxy.ts 내부에서 직접 분기하므로 별도 helper 불필요.
- [-] 단위 테스트도 함께 skip (helper 가 존재하지 않음)

> 향후 보호 경로 규칙이 복잡해지면 helper + 테스트 재도입 검토 (queue.md Icebox 후보).

---

## Task 4: Supabase server / client 헬퍼

### 4-1. 서버 헬퍼
- [x] `src/lib/supabase/server.ts` — `createClient()` (Supabase 공식 가이드 직역, getAll/setAll + try/catch)
- [x] (4-2 와 함께) Commit: `feat(spec-03-01): replace supabase clients with SSR official pattern`

### 4-2. 브라우저 헬퍼
- [x] `src/lib/supabase/client.ts` — `createClient()` (createBrowserClient wrapper)
- [x] Commit: 위 commit 에 포함

> Plan 의 "[NEW]" 표기는 사실 [MODIFY] — 기존 phase-01 의 `createServerSupabase` / `createBrowserSupabase` 가 같은 파일에 있어 *교체* 가 발생. 호환성 처리는 Task 5-2 (admin.ts) 에서.

---

## Task 5: proxy (Next.js 16) + updateSession 통합

### 5-1. updateSession 헬퍼
- [x] `src/lib/supabase/proxy.ts` — `updateSession(request)` (공식 가이드 직역)
  - ✏️ `getClaims()` 사용, cache-control headers 적용, path-exclusion 분기 (`/login`, `/auth` 제외 전부 보호)
- [x] (5-2 와 함께) Commit: `feat(spec-03-01): add updateSession helper and Next.js 16 proxy`

### 5-2. proxy.ts 위치
- [x] ✏️ `src/proxy.ts` (NOT 프로젝트 루트). 이유: src/app/ canonical 구조에서는 src/ 와 같은 레벨이 옳음 (Next.js src-folder.md)
- [x] `pnpm build` → 9 routes 정상 (`/`, `/_not-found`, `/api/search` + `ƒ Proxy`)
- [x] Commit: 위 commit 에 포함

### 5-3. ✏️ Plan 외 추가: admin client 분리
- [x] `src/lib/supabase/admin.ts` 신규 — 기존 `createServerSupabase` (service-key, RLS bypass) 보존. App Router 밖 (tsx 스크립트) 안전.
- [x] `src/lib/search/cosine.ts` import 경로 갱신 → `@/lib/supabase/admin`
- [x] Commit: `refactor(spec-03-01): split admin (service-key) client into dedicated file`
- [x] `pnpm search:prompt "창세기"` 회귀 검증 → PASS (Genesis 5 verses 반환)

---

## Task 6: Lint / TypeCheck 점검

- [x] `pnpm exec tsc --noEmit` → PASS (에러 0)
- [x] `pnpm build` → PASS (9 routes + Proxy)
- [x] `pnpm test` → 3/3 PASS (phase-02 회귀 0)
- [x] 변경 없음 → commit 생략

---

## Task 7: Ship

- [x] 전체 검증 통과 (Task 6)
- [x] **walkthrough.md 작성**
- [x] **pr_description.md 작성**
- [ ] **Ship Commit**: `docs(spec-03-01): mark execution complete and ship`
- [ ] **phase base branch `phase-03-auth-ui-llm` 생성 + push** (develop 기준)
- [ ] **Push**: `git push -u origin spec-03-01-supabase-auth-setup`
- [ ] **PR 생성**: base 는 `phase-03-auth-ui-llm`
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 7 (Task 3 skip, 5-3 plan 외 추가) |
| **실제 commit 수** | 5 (코드) + 1 (PRD) + 1 (ship) = 7 |
| **현재 단계** | Ship |
| **마지막 업데이트** | 2026-05-21 |

## Plan 대비 주요 deviation 요약

| 영역 | Plan | 실제 | 사유 |
|---|---|---|---|
| Proxy 위치 | `proxy.ts` (root) | `src/proxy.ts` | src/app/ 마이그레이션과 일관 (src-folder.md) |
| Auth 검증 API | `getUser()` | `getClaims()` | Supabase 공식 권장. middleware 에서 JWT 서명 검증으로 안전 |
| setAll headers | 미고려 | cache-control 적용 | CDN 세션 누수 방지 (Supabase 공식 docs 명시) |
| 보호 경로 모델 | path-inclusion (`/qa`, `/api/qa`) | path-exclusion (`/login`, `/auth` 외 전부) | default-deny 가 더 안전 |
| isProtectedPath helper | 신규 + 단위 테스트 | 미구현 (skip) | path-exclusion 채택으로 helper 불필요 |
| service-key 호환성 | 별도 처리 미정 | `src/lib/supabase/admin.ts` 분리 | cosine.ts 회귀 해결 + 역할 명확 분리 |
| app 디렉토리 | 미언급 | `app/` → `src/app/` 이전 | spec-03-02 부터의 UI 작성을 src/ 컨벤션에 맞춤 |
