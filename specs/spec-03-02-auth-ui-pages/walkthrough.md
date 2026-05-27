# Walkthrough: spec-03-02

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 로그인 폼 서버/클라이언트 처리 | `router.push` (클라이언트) / Server Action | **Server Action** | `revalidatePath` + 서버 redirect로 캐시 깜빡임 없음 |
| 로그인·회원가입 분리 | 별도 action 2개 / 단일 action + mode 분기 | **단일 `authAction` + hidden mode** | 같은 폼 공유 UI에서 분기가 더 단순, `useActionState` 훅 하나로 처리 |
| 입력 검증 위치 | 클라이언트 regex / 서버 zod | **서버 zod** | 단일 검증 소스, 클라이언트 regex 중복 제거 |
| 헤더 유저 상태 | `useEffect` + `getUser()` (클라이언트) / `getClaims()` (서버) | **서버 `getClaims()`** | SSR로 초기 렌더 시 깜빡임 없음 |
| 로그아웃 | `onClick` 클라이언트 / Server Action + form | **Server Action + form** | Next.js 표준, JS 없어도 동작, `redirect('/login')` 서버 제어 |
| Google OAuth | spec-03-02 포함 / 이월 | **Icebox 이월** | MVP 범위 우선, 이메일 인증만으로 성공 기준 충족 |

- [ ] 없음 (ADR 승격 대상)

## 💬 사용자 협의

- **주제**: 클라이언트 vs 서버 인증 처리 방식
  - **사용자 의견**: `router.push` + `router.refresh` 방식의 캐시 문제 인식, 표준 방식 요구
  - **합의**: Supabase 공식 문서 기준 Server Action 방식으로 전환 (context7 확인)

- **주제**: `useActionState` 조건부 함수 문제
  - **사용자 의견**: 탭에 따라 다른 action 을 넘기는 방식의 문제점 지적
  - **합의**: 단일 `authAction` + hidden `name="mode"` 필드로 통합

- **주제**: route.ts vs actions.ts 구분
  - **사용자 의견**: 두 개념의 차이가 불명확하다고 지적
  - **합의**: route.ts = 외부 HTTP 엔드포인트, actions.ts = 앱 내부 전용 서버 함수로 정리

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: `npx tsc --noEmit`
- **결과**: ✅ Passed (타입 에러 없음)

### 2. 수동 검증

1. **Action**: 회원가입 폼에서 이메일·비밀번호 입력 후 제출
   - **Result**: Supabase 이메일 발송 확인, info 메시지 표시
2. **Action**: 이메일 인증 링크 클릭
   - **Result**: `/auth/confirm` → `verifyOtp` → `/` redirect 정상
3. **Action**: 로그인 폼 제출
   - **Result**: `authAction` 실행 → `revalidatePath` → `redirect('/')` → 헤더에 이메일 표시
4. **Action**: 로그아웃 버튼 클릭
   - **Result**: Server Action `signOut` + `redirect('/login')` → 헤더 초기화

## 🔍 발견 사항

- `zod@4.x` 에서 `error.errors` → `error.issues` 로 API 변경됨 (수정 완료)
- `useActionState` 세 번째 반환값으로 `pending` 직접 제공 (최신 React 기능) — `useFormStatus` 를 `SubmitButton` 자식 컴포넌트에서만 쓰는 현재 방식도 유효

## 🚧 이월 항목

- Google OAuth (`signInWithOAuth`) → `backlog/queue.md` Icebox
- `/auth/callback` `exchangeCodeForSession` 실제 연결 → Icebox (OAuth 구현 시 함께)

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent + @pgaey |
| **작성 기간** | 2026-05-24 ~ 2026-05-27 |
| **최종 commit** | `8f9052f` |
