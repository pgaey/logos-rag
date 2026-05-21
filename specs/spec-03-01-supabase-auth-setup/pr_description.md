# feat(spec-03-01): Supabase Auth + Next.js 16 proxy 기반 인증 인프라 도입

## 📋 Summary

### 배경 및 목적
phase-02 검색·프롬프트 흐름은 익명 호출이 가능했지만, phase-03 의 `/qa` UI 와 LLM 호출 엔드포인트는 사용자 인증이 필수. 본 spec 은 phase-03 의 *기반 인프라* — Supabase Auth (`@supabase/ssr`) 도입, SSR 인식 클라이언트 헬퍼, Next.js 16 proxy 기반 세션 리프레시 + 보호 경로 redirect, app 디렉토리 src/ 이전 — 를 깐다. 실제 로그인 UI 와 흐름 검증은 spec-03-02 책임.

### 주요 변경 사항
- [x] `@supabase/ssr@0.10.3` 의존성 추가 (Next.js App Router SSR 공식 패키지)
- [x] `src/lib/supabase/server.ts` / `client.ts` 를 Supabase 공식 SSR 패턴으로 교체 (`createServerClient` + `createBrowserClient`, `getAll`/`setAll` 어댑터)
- [x] `src/lib/supabase/proxy.ts` — `updateSession(request)` 헬퍼. `supabase.auth.getClaims()` 로 JWT 서명 검증 + 세션 리프레시. cache-control headers 적용으로 CDN 세션 누수 방지.
- [x] `src/proxy.ts` — Next.js 16 신규 file convention (`middleware.ts` 가 아님). matcher + updateSession 위임.
- [x] `src/lib/supabase/admin.ts` — service-key (RLS bypass) 클라이언트 별도 파일로 분리. App Router 밖 (CLI 스크립트) 안전.
- [x] `src/lib/search/cosine.ts` 의 import 경로를 `@/lib/supabase/admin` 으로 갱신 — phase-02 의 search/eval 스크립트 회귀 해결.
- [x] `app/api/search/route.ts` → `src/app/api/search/route.ts` 이전 (Next.js src-folder 컨벤션, 코드 동일).
- [x] `docs/v1-design-prd.md` — phase-03 UI 기준 PRD.

### Phase 컨텍스트
- **Phase**: `phase-03` (auth-ui-llm)
- **본 SPEC 의 역할**: phase-03 의 첫 spec. 후속 spec (`auth-ui-pages`, `qa-api-route`, `qa-page-ui`) 이 동작하기 위한 인증 인프라 제공.

## 🎯 Key Review Points

1. **Next.js 16 `proxy.ts` 명명**: `middleware.ts` → `proxy.ts` 로 리네임됨 (`proxy.md` §Migration). 본 PR 은 새 명명을 채택. 위치는 `src/proxy.ts` — src/app/ canonical 구조와 같은 레벨.
2. **`supabase.auth.getClaims()` 사용**: 공식 docs §"Hook up proxy" 의 명시 권장. `getUser()` / `getSession()` 은 middleware 컨텍스트에서 신뢰 금지 (JWT 서명 검증 보장 없음). `getClaims()` 가 매 호출마다 publish key 로 서명 검증.
3. **`setAll` cache-control headers**: Supabase 공식 가이드의 advanced server-side rendering 섹션이 명시. CDN/ISR 환경에서 세션 누수 방지. `supabaseResponse.headers.set(key, value)` 라인.
4. **path-exclusion 보호 모델**: `/login`, `/auth` 외 전부 보호 (default-deny). `/qa`, `/api/qa` 만 보호하는 path-inclusion 보다 안전. 신규 경로 추가 시 보호 자동 적용.
5. **admin.ts 분리**: phase-02 의 `cosine.ts` 가 CLI 스크립트 (tsx) 에서 호출되는데 `next/headers` 의 `cookies()` 가 App Router 밖에서 throw. `next/headers` 미사용 별도 파일로 service-key 클라이언트 분리.
6. **app/ → src/app/ 마이그레이션**: root `app/` 과 `src/app/` 공존 시 root 우선 (Next.js src-folder.md §31). 본 PR 은 src/app/ 으로 일원화.

## 🧪 Verification

### 자동 테스트
```bash
pnpm exec tsc --noEmit   # 0 errors
pnpm build               # PASS — 3 routes + ƒ Proxy
pnpm test                # 3/3 PASS (phase-02 prompt template 회귀 0)
```

**결과 요약**:
- ✅ TypeCheck: 에러 0
- ✅ Build: `/`, `/_not-found`, `/api/search` + `ƒ Proxy (Middleware)` 정상
- ✅ phase-02 unit test 3/3 PASS

### 수동 검증 시나리오
1. **CLI 회귀 검증**: `pnpm search:prompt "창세기"` → ✅ Genesis 5 verses 반환 (admin.ts 분리로 `next/headers` 충돌 해결)
2. **빌드 라우트 검증**: `pnpm build` → ✅ `ƒ Proxy (Middleware)` 노드 출력
3. **app 이전 검증**: `app/api/search/route.ts` 삭제 + `src/app/api/search/route.ts` 신규 — git rename detection 으로 100% 동일 코드 확인

### 통합 테스트 (Integration Test Required = no)
본 spec 은 인프라까지. 실제 로그인 흐름 (회원가입 → 로그인 → 보호 경로 차단 → 로그아웃) 검증은 spec-03-02 의 통합 시나리오 1.

## 📦 Files Changed

### 🆕 New Files
- `src/lib/supabase/proxy.ts`: `updateSession` 헬퍼
- `src/lib/supabase/admin.ts`: service-key 클라이언트 (App Router 밖 안전)
- `src/proxy.ts`: Next.js 16 proxy 파일
- `src/app/api/search/route.ts`: phase-02 search route 이전 위치
- `docs/v1-design-prd.md`: v1 PRD

### 🛠 Modified Files
- `src/lib/supabase/server.ts` (+18, -16): `createClient` (cookies + ssr). 기존 `createServerSupabase` 는 `admin.ts` 로 이전됨.
- `src/lib/supabase/client.ts` (+8, -8): `createClient` (createBrowserClient). 기존 `createBrowserSupabase` 제거.
- `src/lib/search/cosine.ts` (+3, -3): import `@/lib/supabase/admin`, `await` 제거.
- `package.json` / `pnpm-lock.yaml`: `@supabase/ssr@^0.10.3` 추가.
- `pnpm-workspace.yaml`: sharp/unrs-resolver 빌드 정책 명시.

### 🗑 Deleted Files
- `app/api/search/route.ts`: `src/app/api/search/route.ts` 로 이전 (git rename detected).

**Total**: 신규 5 + 수정 5 + 이전 1 = 11 files

## ✅ Definition of Done

- [x] `@supabase/ssr` 설치 + `package.json`·`pnpm-lock.yaml` 반영
- [x] `.env.example` 의 Supabase 변수는 기존 그대로 (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 이미 존재)
- [x] `src/lib/supabase/server.ts`, `client.ts`, `proxy.ts`, `admin.ts` + `src/proxy.ts` 작성
- [x] phase-02 회귀 0 (`pnpm search:prompt` PASS, unit test 3/3 PASS)
- [x] `pnpm exec tsc --noEmit`, `pnpm build` 통과
- [x] `walkthrough.md` / `pr_description.md` 작성 후 ship commit
- [ ] `spec-03-01-supabase-auth-setup` 브랜치 push + PR 생성
- [ ] 사용자 검토 요청 알림 완료

## 🔗 관련 자료

- Phase: `backlog/phase-03.md`
- Phase Arch Blueprint: `docs/phase-03-arch.html`
- Spec / Plan / Task: `specs/spec-03-01-supabase-auth-setup/{spec,plan,task}.md`
- Walkthrough: `specs/spec-03-01-supabase-auth-setup/walkthrough.md`
- ADR 후보 (작성 예정): `docs/decisions/ADR-001-auth-cookie-session.md`
