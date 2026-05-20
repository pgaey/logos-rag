# Walkthrough: spec-03-01

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| Auth 토큰 저장 방식 | Cookie session / Bearer JWT header | **Cookie session (`@supabase/ssr`)** | Server Component / proxy 가 인증 상태를 알아야 하고, refresh 자동화 필요. JWT 자체는 stateless 라 Vercel 멀티 인스턴스에서도 sticky session 불필요. 사용자와 두 차례 논의 후 확정. |
| Next.js file convention | `middleware.ts` (구) / `proxy.ts` (Next.js 16) | **`proxy.ts`** | Next.js 16.2.6 부터 middleware → proxy 로 리네임 (proxy.md §Migration). 본 spec 은 새 명명을 따른다. Supabase 공식 가이드는 아직 middleware 표현이지만 구조는 동일. |
| Cookie adapter API | `get/set/remove` (구) / `getAll/setAll` (신규) | **`getAll/setAll`** | 구 API 는 `CookieMethodsServerDeprecated` 로 명명되어 deprecated. context7 의 모든 공식 예시가 신규 API 사용. |
| 기존 server.ts/client.ts 와 충돌 | 덮어쓰기 / 추가 export / 새 파일 | **추가 export (`createClient`)** | phase-01 의 `createServerSupabase`(service-key) / `createBrowserSupabase`(publishable) 가 phase-02 검색 흐름에서 사용 중. 신규 `createClient` 를 같은 파일에 공존시키고 JSDoc 으로 용도 분리 명시. |
| 보호 경로 판정 위치 | matcher 정규식 / `isProtectedPath` 함수 | **`isProtectedPath` 함수** | matcher 는 정적 자원 제외 후 모든 경로를 통과시켜 세션 리프레시. 보호 판정은 helper 내부에서 분리해 단위 테스트 가능. |

### ADR 승격 가이드

- [x] ADR 승격 대상 있음 → 후보: `docs/decisions/ADR-001-auth-cookie-session.md` (type: `decision`)
  - 사유: phase-03 전체가 본 결정에 의존 (spec-03-02 ~ 03-05), v1.5 SSO 앱 분리 시 재검토 트리거. 6개월 이상 유지 가능성 매우 높음.
  - **작성 시점**: 본 spec ship 직후 또는 spec-03-02 시작 시점 — phase-03 머지 전에는 작성 필수.
  - **본 spec 머지 차단 없음** (constitution §6.3 비강제).
- [ ] 없음

## 💬 사용자 협의

- **주제**: "왜 session 이라고 표현하지? Supabase auth session 은 사실 JWT 인데"
  - **사용자 의견**: 다중 서버 배포 (Vercel) 환경에서 "session" 이 메모리 공유 문제를 일으키지 않냐는 우려. 그리고 "session" 이라는 표현 자체가 부정확하지 않냐는 지적.
  - **합의**: Supabase 의 "Session" 은 *추상 개념* (= 로그인 상태 + JWT 묶음), 전통적 서버사이드 메모리 세션과 무관함을 확인. 본 spec 의 결정 기록에 명시. v1.5 SSO 분리 시 재검토 ADR 후보로 남김.

- **주제**: "Supabase auth 는 공식 문서 표준에 맞게 직접 해봐야 하는 거 아닌가"
  - **사용자 의견**: 학습 데이터의 stale Supabase 패턴을 추측하지 말 것.
  - **합의**: Task 1 의 첫 작업으로 context7 MCP 가 `@supabase/ssr` + Next.js 16 공식 문서를 조회하고, 그 결과로 plan 의 의사 코드 / 파일 경로를 사후 갱신. 발견 사항 3건 (Next.js 16 proxy 리네임, getAll/setAll API, 공식 setAll 패턴) 을 plan 에 즉시 반영.

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: `pnpm test`
- **결과**: ✅ Passed (10 tests in 105ms)
- **로그 요약**:
```text
 Test Files  2 passed (2)
      Tests  10 passed (10)
   Start at  17:48:42
   Duration  105ms

 ✓ src/lib/supabase/__tests__/protected-paths.test.ts  (7 tests)
 ✓ src/lib/prompt/__tests__/template.test.ts            (3 tests)
```

#### Lint / TypeCheck
- **명령**: `pnpm lint`, `pnpm exec tsc --noEmit`
- **결과**: ✅ Passed (출력 0 줄, 에러/경고 0)

#### 통합 테스트 (Integration Test Required = no)
- 본 spec 은 통합 테스트 미요구. 실제 로그인 흐름 검증은 spec-03-02 에 위임.

### 2. 수동 검증

1. **Action**: `pnpm build`
   - **Result**: ✅ Next.js 16.2.6 (Turbopack) 빌드 성공. `ƒ Proxy (Middleware)` 라우트 컴파일 OK.
2. **Action**: `pnpm dev` 후 `curl localhost:3000/`
   - **Result**: 404 — `app/page.tsx` 없음 (예상대로, spec-03-02 책임).
3. **Action**: `curl -I localhost:3000/qa`
   - **Result**: ✅ **307 redirect → http://localhost:3000/login** — proxy + updateSession + isProtectedPath 의 전체 경로 동작 확인. 세션 쿠키 없는 상태에서 보호 경로 차단 성공.

## 🔍 발견 사항

- **Next.js 16 의 file convention 변경**: `middleware.ts` → `proxy.ts` 리네임은 Next.js 16 의 broader 디자인 결정 (Express middleware 와의 혼동 방지, Edge Runtime "proxy" 성격 강조). 함수명도 `middleware(request)` → `proxy(request)`. Supabase 등 third-party 가이드 다수가 아직 따라잡지 못함 — context7 조회 시 출처 버전 주의.
- **`@supabase/ssr` 의 setAll 패턴**: Supabase 가이드가 명시적으로 `request.cookies.set` 와 `response.cookies.set` 양쪽을 갱신하는 패턴을 요구함. 한 쪽만 갱신하면 RSC 가 stale 세션을 보게 됨.
- **service-key vs publishable-key 분리 유지**: `createServerSupabase` (service-key, RLS bypass) 와 신규 `createClient` (publishable, 사용자 권한) 가 한 파일에 공존하지만 용도가 완전히 분리됨. JSDoc 으로 명시 — 후속 spec 작성자가 어느 함수를 써야 할지 헷갈리지 않도록.

## 🚧 이월 항목

- **ADR-001-auth-cookie-session 작성**: 본 spec ship 후 또는 spec-03-02 시작 시점. phase-03 머지 전 필수.
- **`/login` 페이지 작성**: spec-03-02 책임. 본 spec 의 proxy 가 이미 `/login` 으로 redirect 하고 있으므로 spec-03-02 의 진입점 명확.
- **Google OAuth provider Supabase Dashboard 활성화**: 코드 외 작업. spec-03-02 진행과 병행 가능.

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent (Claude Opus 4.7) + @pgaey |
| **작성 기간** | 2026-05-20 |
| **최종 commit** | `cd4cd58` (push 시 ship commit 추가) |
