# feat(spec-03-02): 로그인·회원가입 페이지 및 헤더 인증 상태 UI

## 📋 Summary

### 배경 및 목적
spec-03-01 에서 Supabase Auth 인프라가 완성됐으나 사용자가 실제로 로그인·회원가입할 수 있는 UI 가 없었음. 본 spec 에서 전체 인증 UI 플로우를 구현해 phase-03 성공 기준 1·2번을 충족한다.

### 주요 변경 사항
- [x] `/login` 페이지 — 이메일/비밀번호 로그인·회원가입 탭 통합 UI (`useActionState` + `useFormStatus`)
- [x] `authAction` Server Action — zod 검증 + `signInWithPassword` / `signUp` + `revalidatePath` + `redirect`
- [x] `/auth/confirm` — 이메일 OTP 인증 콜백 라우트 (`verifyOtp`)
- [x] `/auth/auth-code-error` — 인증 링크 오류 안내 페이지
- [x] `layout.tsx` 헤더 — `getClaims()` SSR 유저 이메일 + 로그아웃 Server Action

### Phase 컨텍스트
- **Phase**: `phase-03` (인증·UI·LLM 통합)
- **본 SPEC 의 역할**: 사용자 인증 UI 플로우 완성 — 다음 spec (llm-gemini-client, qa-api-route, qa-page-ui) 의 전제 조건

## 🎯 Key Review Points

1. **`authAction` 단일 action 분기**: hidden `name="mode"` 필드로 login/signup 분기. `useActionState` 에 조건부 함수 불필요.
2. **헤더 SSR 인증 상태**: `getClaims()` 서버 렌더링 → 초기 로드 시 깜빡임 없음. `getSession()` 미사용 (보안상 서버 검증 불가).
3. **로그아웃 Server Action**: `layout.tsx` 인라인 `"use server"` 함수 → form submit → `signOut` + `redirect('/login')`.

## 🧪 Verification

### 자동 테스트
```bash
npx tsc --noEmit
```
**결과**: ✅ 타입 에러 없음

### 수동 검증 시나리오
1. **회원가입** → 이메일 인증 → `/auth/confirm` → `/` redirect ✅
2. **로그인** → 헤더 이메일 표시 ✅
3. **로그아웃** → 헤더 초기화 → `/login` redirect ✅
4. **미인증 `/qa` 접근** → `/login` redirect (proxy.ts, spec-03-01) ✅

## 📦 Files Changed

### 🆕 New Files
- `src/app/login/page.tsx`: 로그인·회원가입 탭 UI
- `src/app/login/actions.ts`: `authAction` Server Action
- `src/app/auth/confirm/route.ts`: 이메일 OTP 콜백
- `src/app/auth/callback/route.ts`: OAuth 콜백 scaffold (미연결)
- `src/app/auth/auth-code-error/page.tsx`: 인증 오류 안내

### 🛠 Modified Files
- `src/app/layout.tsx` (+47, -12): 헤더 인증 상태 + 로그아웃 Action
- `package.json`: zod 의존성 추가

**Total**: 7 files changed

## ✅ Definition of Done

- [x] 타입 체크 통과
- [x] 수동 인증 플로우 검증 PASS
- [x] `walkthrough.md` ship commit 완료
- [x] `pr_description.md` ship commit 완료
- [x] 사용자 검토 요청 알림 완료

## 🔗 관련 자료

- Phase: `backlog/phase-03.md`
- Walkthrough: `specs/spec-03-02-auth-ui-pages/walkthrough.md`
