# Walkthrough: spec-03-01

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| Auth 토큰 저장 방식 | Cookie session / Bearer JWT header | **Cookie session (`@supabase/ssr`)** | Server Component / proxy 가 인증 상태를 알아야 하고 refresh 자동화 필요. JWT 자체는 stateless 라 Vercel 멀티 인스턴스에서도 sticky session 불필요. |
| Next.js file convention | `middleware.ts` (구) / `proxy.ts` (Next.js 16) | **`proxy.ts`** | Next.js 16.2.6 부터 middleware → proxy 로 리네임 (proxy.md §Migration). 함수도 `proxy()`. |
| Proxy 위치 | 프로젝트 루트 / `src/proxy.ts` | **`src/proxy.ts`** | src/app/ 마이그레이션 후 src/ 와 같은 레벨 (Next.js src-folder.md). 루트에 두면 Next.js 가 인식 못 함. |
| Cookie adapter API | `get/set/remove` (구) / `getAll/setAll` (신규) | **`getAll/setAll`** | 구 API 는 deprecated. 공식 예시 모두 신규 API 사용. |
| Auth 검증 API in proxy | `getUser()` / **`getClaims()`** | **`getClaims()`** | 공식 권장 — middleware/proxy 에서 JWT 서명 검증 (publish key 로 검증). `getSession()` 은 middleware 에서 trust 금지 명시. |
| `setAll` 두 번째 인자 | 무시 / cache-control headers 적용 | **`supabaseResponse.headers.set(key, value)` 적용** | Supabase 공식 docs: CDN/ISR 환경에서 세션 누수 방지. 누락 시 다른 사용자 응답에 세션 노출 가능. |
| 보호 경로 모델 | path-inclusion (`/qa`, `/api/qa` 만 보호) / path-exclusion (`/login`, `/auth` 외 전부 보호) | **path-exclusion** | default-deny. 사이트 전체가 인증 후 사용. 신규 경로 추가 시 보호 자동 적용. |
| `isProtectedPath` helper | 신규 함수 + 단위 테스트 | **미구현 (skip)** | path-exclusion 채택으로 helper 가 필요 없음. proxy.ts 가 한 줄로 처리. |
| service-key 클라이언트 | server.ts 에 공존 / 별도 파일 | **`src/lib/supabase/admin.ts` 분리** | server.ts 가 next/headers 를 import 하면 tsx 스크립트 (CLI) 에서 `cookies()` throw. cosine.ts 가 CLI 에서도 사용되므로 service-key 클라이언트는 next/headers 없는 별도 파일 필요. |
| app 디렉토리 위치 | 루트 `app/` 유지 / `src/app/` 이전 | **`src/app/` 이전** | `src/components`, `src/lib` 등 모든 application code 가 src/ 아래에 있음 → src-folder 컨벤션 일관성. proxy.ts 도 src/ 와 같은 레벨에 위치 가능. |

### ADR 승격 가이드

- [x] ADR 승격 대상 있음 → 후보: `docs/decisions/ADR-001-auth-cookie-session.md` (type: `decision`)
  - 사유: phase-03 전체가 본 결정에 의존 (spec-03-02 ~ 03-05). v1.5 SSO 앱 분리 시 재검토 트리거. 6개월 이상 유지 가능성 높음.
  - **본 spec 머지 차단 없음** (constitution §6.3 비강제). spec-03-02 시작 시점에 작성 추천.
- [ ] 없음

## 💬 사용자 협의

- **주제**: "왜 session 이라고 표현하지? Supabase auth session 은 사실 JWT 인데"
  - **사용자 의견**: 다중 서버 (Vercel) 환경에서 "session" 이 메모리 공유 문제를 일으키지 않냐는 우려, "session" 명명의 부정확성 지적.
  - **합의**: Supabase 의 "Session" 은 *추상 개념* (로그인 상태 + JWT 묶음). 전통적 서버사이드 메모리 세션과 무관. stateless JWT 라 sticky session 불필요. 본 결정을 상단 표에 기록.

- **주제**: "Supabase auth 는 공식 문서 표준에 맞게 직접 해봐야"
  - **사용자 의견**: 학습 데이터의 stale Supabase 패턴 추측을 거부. 본인이 공식 docs 보면서 직접 구현하겠다.
  - **합의**: 사용자가 직접 Supabase 공식 가이드 기준으로 `src/lib/supabase/{server,client,proxy}.ts` + `src/proxy.ts` 작성. Claude 가 발견 못 한 부분 (`getClaims()`, cache-control headers, path-exclusion) 을 사용자 구현이 정확히 채움.

- **주제**: "agent.md 의 Strict Loop 자동 진행" 으로 직전 세션에서 PR 까지 자동 완료된 건 → 롤백
  - **사용자 의견**: spec 까지만 자동으로 했어야 하는데 Plan Accept 옵션 자체를 제시한 게 학습 의도 박탈.
  - **합의**: PR + 브랜치 + 코드 전부 롤백. spec/plan/task/arch 산출물만 develop 에 보존. 본 PR 은 사용자 본인 구현분을 정식 commit.

- **주제**: AI 생성 UI 파일 (login/auth/qa/M3 컴포넌트) 의 출처
  - **사용자 의견**: PRD 를 다른 AI 도구에 주고 만든 결과물이 어떻게 이 디렉토리에 들어왔는지 의문.
  - **합의**: AI 생성 UI 일체를 `../logos-rag-ai-ui-backup-2026-05-21/` 로 백업 후 working tree 에서 제거. spec-03-02 부터 사용자가 Supabase 표준 그대로 직접 구현.

## 🧪 검증 결과

### 1. 자동화 테스트

#### TypeCheck / Build / Unit Test
- **명령**: `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm test`
- **결과**: ✅ 전부 PASS
- **build 출력 요약**:
```text
▲ Next.js 16.2.6 (Turbopack)

Route (app)
┌ ○ /
├ ○ /_not-found
└ ƒ /api/search

ƒ Proxy (Middleware)
```
- **test**: 2 files / 3 tests PASS (`src/lib/prompt/__tests__/template.test.ts`)

#### CLI 회귀 검증
- **명령**: `pnpm search:prompt "창세기"`
- **결과**: ✅ Genesis 5 verses 정상 반환 (admin.ts 분리로 회귀 해결)

### 2. 수동 검증

1. **Action**: `app/` → `src/app/` 마이그레이션 후 `pnpm build`
   - **Result**: `ƒ /api/search` 라우트 정상 (이전된 위치에서 인식)
2. **Action**: `src/proxy.ts` 작성 후 `pnpm build`
   - **Result**: `ƒ Proxy (Middleware)` 노드 출력 (Next.js 16 가 proxy 인식 OK)
3. **Action**: `pnpm dev` 후 `curl -I http://localhost:3000/qa`
   - **Result**: (별도 검증 — UI 없으므로 spec-03-02 에서 실측 예정. proxy redirect 로직 자체는 build PASS 로 정적 검증)
4. **Action**: AI 생성 UI 제거 후 `pnpm build`
   - **Result**: 3 routes (`/`, `/_not-found`, `/api/search`) + Proxy. 의도된 깨끗한 베이스라인.

## 🔍 발견 사항

- **Next.js 16 src-folder 정책**: `src/app/` AND root `app/` 동시 존재 시 root 가 우선, `src/app/` 무시. 본 프로젝트는 phase-02 까지 root `app/` 만 있었으나 phase-03 에서 `src/app/` 으로 이전. 두 디렉토리 공존 단계가 잠시 있었고 이때 `src/app/page.tsx` 가 무시되는 혼동이 있었음.
- **`getClaims()` vs `getUser()`**: 공식 docs §"Hook up proxy" 가 명시 — "Never trust `supabase.auth.getSession()` inside server code such as Proxy. It isn't guaranteed to revalidate the Auth token. It's safe to trust `getClaims()` because it validates the JWT signature against the project's published public keys every time." 이 부분이 Claude 의 학습 데이터에 stale 했음 — 사용자의 "공식 표준 직접 확인" 원칙이 정확히 이 함정을 막음.
- **`setAll` cache-control headers**: 공식 docs §"Advanced auth server-side rendering guide" — CDN/ISR 환경에서 세션이 다른 사용자에게 누수될 위험. 본 프로젝트가 Vercel 배포 계획이므로 필수.
- **AI 생성 UI 의 출처 불명**: 사용자가 PRD 를 다른 AI 도구에 입력한 결과물이 어떻게 본 디렉토리로 들어왔는지 추적 못 함 (Claude desktop + Filesystem MCP 가능성 추정). 동일 사고 방지 위해 향후 외부 AI 도구 사용 시 출력 디렉토리 명시 권장.

## 🚧 이월 항목

- **ADR-001-auth-cookie-session 작성**: spec-03-02 시작 전 또는 phase-03 머지 전 권장.
- **spec-03-02 (auth-ui-pages)**: `/login`, `/auth/callback` 페이지 구현. 사용자가 Supabase 표준대로 직접 진행 — Claude 는 UI 스캐폴딩만 제공.
- **수동 통합 시나리오 검증**: phase-03.md 시나리오 1 (인증 흐름 PASS) 은 spec-03-02 완료 시점에 가능. 본 spec 은 인프라까지.

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent (Claude Opus 4.7) + @pgaey |
| **구현 주체** | 인프라 (server/client/proxy/admin) 는 사용자 직접 구현. SDD 산출물 (spec/plan/task/walkthrough/pr_description) 및 admin 분리/cosine 회귀 수정은 agent. |
| **작성 기간** | 2026-05-19 (alignment) ~ 2026-05-21 (ship) |
| **최종 commit** | `079ed04` (push 시 ship commit 추가) |
