# feat(spec-03-01): Supabase Auth + Next.js 16 proxy 기반 인증 인프라 도입

## 📋 Summary

### 배경 및 목적
phase-02 검색·프롬프트 흐름은 익명 호출이 가능했지만, phase-03 의 `/qa` UI 와 LLM 호출 엔드포인트는 사용자 인증이 필수. 본 spec 은 phase-03 의 *기반 인프라* — Supabase Auth 도입, SSR 인식 클라이언트 헬퍼, Next.js 16 proxy 기반 세션 리프레시 + 보호 경로 redirect — 를 깐다. 실제 UI 와 흐름 검증은 spec-03-02 책임.

### 주요 변경 사항
- [x] `@supabase/ssr@0.10.3` 의존성 추가 (Next.js App Router SSR 지원 공식 패키지)
- [x] `src/lib/supabase/server.ts` / `client.ts` 에 SSR 인식 `createClient()` 추가 — 기존 `createServerSupabase`(service-key) / `createBrowserSupabase`(비-SSR) 와 공존
- [x] `src/lib/supabase/proxy.ts` — `updateSession(request)` 헬퍼 (Supabase 공식 가이드 직역)
- [x] `proxy.ts` (프로젝트 루트, Next.js 16 file convention) — matcher + updateSession 위임
- [x] `src/lib/supabase/protected-paths.ts` — `isProtectedPath` 순수 함수 + 7 케이스 단위 테스트
- [x] `docs/phase-03-arch.html` (DRAFT BLUEPRINT) — phase-03 전체 청사진

### Phase 컨텍스트
- **Phase**: `phase-03` (auth-ui-llm)
- **본 SPEC 의 역할**: phase-03 의 첫 spec. 후속 spec (auth-ui-pages, qa-api-route, qa-page-ui) 이 동작하기 위한 인증 인프라 제공.

## 🎯 Key Review Points

1. **Next.js 16 `proxy.ts` 명명**: Next.js 16 부터 `middleware.ts` → `proxy.ts` 로 리네임됨 (`proxy.md` §Migration). 본 PR 은 새 명명을 채택. 기존에 Next.js 13/14 패턴에 익숙한 리뷰어는 파일/함수명 변경에 주목.
2. **`@supabase/ssr` 의 신규 cookie adapter**: `getAll/setAll` API 사용 (구 `get/set/remove` 는 `CookieMethodsServerDeprecated`). context7 공식 예시와 일치.
3. **기존 헬퍼와 공존**: phase-01 의 `createServerSupabase` (service-key, ETL) 를 보존하고 신규 `createClient` (publishable + cookies, 사용자 권한) 를 같은 파일에 추가. JSDoc 으로 용도 분리. phase-02 검색 흐름 회귀 0.
4. **setAll 패턴**: `request.cookies.set` 와 `response.cookies.set` 동시 갱신 — Supabase 공식 가이드가 명시한 RSC 세션 동기화 요구사항.
5. **보호 경로 판정 분리**: matcher 는 정적 자원 제외 후 모든 경로 통과 (세션 리프레시), `isProtectedPath` 함수가 redirect 여부 판정. 테스트 가능 단위로 분리.

## 🧪 Verification

### 자동 테스트
```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
```

**결과 요약**:
- ✅ `protected-paths.test.ts`: 7/7 통과 (정확/prefix/중첩/비보호/phase-02 회귀 가드/root/substring false-positive)
- ✅ `template.test.ts` (phase-02 회귀): 3/3 통과
- ✅ `pnpm lint` — 0 warnings/errors
- ✅ `pnpm exec tsc --noEmit` — 0 errors

### 수동 검증 시나리오
1. **빌드**: `pnpm build` → ✅ Next.js 16.2.6 (Turbopack) 빌드 성공, `ƒ Proxy (Middleware)` 라우트 컴파일 확인
2. **Dev 서버 smoke (보호 경로 redirect)**: `pnpm dev` 후 `curl -I localhost:3000/qa` → ✅ **307 redirect → /login** (proxy + updateSession + isProtectedPath 전체 경로 동작 확인, 세션 쿠키 없는 상태)
3. **회귀 검증**: phase-02 의 `/api/search` 흐름은 `isProtectedPath` 가 false 처리하므로 영향 없음 (단위 테스트로 확인).

## 📦 Files Changed

### 🆕 New Files
- `proxy.ts`: Next.js 16 proxy 루트 파일 (matcher + updateSession 위임)
- `src/lib/supabase/proxy.ts`: `updateSession` 헬퍼 (Supabase 공식 middleware 예시 직역)
- `src/lib/supabase/protected-paths.ts`: `isProtectedPath` 순수 함수 + `PROTECTED_PREFIXES` 상수
- `src/lib/supabase/__tests__/protected-paths.test.ts`: 7 케이스 단위 테스트
- `backlog/phase-03.md`: phase-03 작업 지도 (5 spec)
- `docs/phase-03-arch.html`: phase-03 아키텍처 청사진 (DRAFT BLUEPRINT)
- `specs/spec-03-01-supabase-auth-setup/{spec,plan,task,walkthrough,pr_description}.md`: SDD 산출물

### 🛠 Modified Files
- `src/lib/supabase/server.ts` (+44, -2): `createClient` (SSR 인식, cookies) 추가. 기존 `createServerSupabase` 유지.
- `src/lib/supabase/client.ts` (+22, -2): `createClient` (`createBrowserClient` wrapper) 추가. 기존 `createBrowserSupabase` 유지.
- `package.json` / `pnpm-lock.yaml`: `@supabase/ssr@0.10.3` 추가
- `backlog/queue.md`: phase-02 done 이동 + 임베딩 진척 갱신 (3,011/31,102)

**Total**: 신규 7 + 수정 4 = 11 files (테스트/설정 제외 시 코드 변경 4 파일)

## ✅ Definition of Done

- [x] 모든 단위 테스트 통과 (10/10)
- [x] (해당 없음) 통합 테스트 — Integration Test Required = no
- [x] `walkthrough.md` ship commit 완료
- [x] `pr_description.md` ship commit 완료
- [x] lint / type check 통과
- [x] 빌드 PASS + dev 서버 smoke PASS
- [ ] 사용자 검토 요청 알림 완료 (PR 생성 후)

## 🔗 관련 자료

- Phase: `backlog/phase-03.md`
- Phase Arch Blueprint: `docs/phase-03-arch.html`
- Walkthrough: `specs/spec-03-01-supabase-auth-setup/walkthrough.md`
- ADR 후보 (작성 예정): `docs/decisions/ADR-001-auth-cookie-session.md`
