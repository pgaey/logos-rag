# EmailPasswordForm

## 1. Purpose

SC-03 로그인·회원가입 탭 안에서 이메일과 비밀번호 입력 폼을 렌더링하고, `mode`에 따라 "로그인" 또는 "회원가입" 구성으로 분기한다.

## 2. Used in

SC-03 (AuthTabs 내부, loginContent / signupContent)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Input` · `Label` · `Button` · `Alert` · `AlertDescription` · `Checkbox` |
| design primitive | `text-input` · `button-primary` (Submit) · `alert-destructive` / `alert-default` (서버 에러) |
| 도메인 wrapping | `EmailPasswordForm` — `text-input` + `button-primary` (emerald) + 서버 에러 Alert + mode 분기 |

**핵심 토큰**:
- Input (`text-input`): `{colors.canvas}` bg, `{colors.ink}` text, `{typography.body-md}` (16px/400) Pretendard, padding `{spacing.sm} {spacing.md}` (8px 12px), `{rounded.sm}` (6px), 1px `{colors.hairline}` border
  - focus: 2px solid `{colors.primary}` ring, 2px offset
  - error state: 1px solid `{colors.destructive}` border
  - disabled: `{colors.canvas-soft}` bg, `{colors.ink-faint}` text
  - placeholder: `{colors.ink-faint}`
- Label: `{typography.body-md}` (16px/400) Pretendard, `{colors.ink}`
- Submit button (`button-primary` — **emerald CTA**, 탭당 1개 원칙): bg `{colors.primary}` (`#3ecf8e`), text `{colors.on-primary}` (near-black `#171717` — **white 금지**), `{typography.button-md}` (14px/500), `{rounded.sm}` (6px), `w-full`
- `alert-destructive`: `#fef2f2` bg (dark: `#3a1818`), `{colors.destructive}` title, 1px `{colors.destructive}` border, `{rounded.md}` (8px)
- `alert-default` (e.g. email-not-verified): `{colors.canvas-soft}` bg, 1px `{colors.hairline}` border, `{rounded.md}` (8px)
- field gap: `{spacing.xl}` (24px)
- 다크 모드: canvas/hairline/ink 토큰 페어 자동 swap

## 4. Props (interface)

```typescript
interface EmailPasswordFormProps {
  /** 폼 동작 모드 */
  mode: 'login' | 'signup';
  /** 서버 에러 상태 (Server Action 응답 결과) */
  serverError?: {
    type: 'invalid-credentials' | 'email-not-verified' | 'email-already-registered' | 'network' | null;
    message?: string;
  };
  /** 폼 제출 중 여부 */
  isLoading?: boolean;
  /** 이메일 초기값 (다른 탭에서 이동 시 이메일 유지) */
  defaultEmail?: string;
  /** 미인증 이메일 → 재전송 CTA 핸들러 */
  onResendVerification?: () => void;
  /** 중복 이메일 → 로그인 탭 이동 CTA 핸들러 */
  onSwitchToLogin?: () => void;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `mode` | `'login' \| 'signup'` | — | ✅ |
| `serverError` | `object` | `{ type: null }` | 아니오 |
| `isLoading` | `boolean` | `false` | 아니오 |
| `defaultEmail` | `string` | `""` | 아니오 |
| `onResendVerification` | `() => void` | — | 조건부 |
| `onSwitchToLogin` | `() => void` | — | 조건부 |

## 5. Variants

```typescript
type FormMode = 'login' | 'signup';

// 서버 에러 유형
type ServerErrorType =
  | 'invalid-credentials'
  | 'email-not-verified'
  | 'email-already-registered'
  | 'network'
  | null;
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` | 빈 폼, 버튼 활성 | 입력 대기 |
| `loading` (email) | 버튼 `Loader2` 스피너 + `disabled`, 폼 `pointer-events-none` | 제출 처리 중 |
| `error.invalid-credentials` | 폼 상단 `Alert`(destructive): "이메일 또는 비밀번호가 올바르지 않습니다." | — |
| `error.email-not-verified` | `Alert`(default, `MailWarning`): 미인증 안내 + "인증 메일 재전송" 버튼 | 재전송 클릭 시 `onResendVerification` |
| `error.email-already-registered` | `Alert`(default): "이미 가입된 이메일" + "로그인 탭으로 이동" 버튼 | 클릭 시 `onSwitchToLogin` |
| `error.network` | `Alert`(destructive): "일시적인 오류가 발생했습니다." | — |
| `field.email.error` | 이메일 Input 아래 `FormFieldError`: "유효한 이메일 주소를 입력해주세요." | — |
| `field.password.error` | 비밀번호 Input 아래 `FormFieldError`: "비밀번호는 8자 이상이어야 합니다." | — |
| `field.confirm.error` | 비밀번호 확인 Input 아래 `FormFieldError`: "비밀번호가 일치하지 않습니다." | — |
| `field.terms.error` | Checkbox 옆 `FormFieldError`: "이용약관에 동의해주세요." | — |

## 7. Composition

```
<!-- 서버 에러 Alert -->
{/* alert-destructive: #fef2f2 bg(dark:#3a1818), 1px {colors.destructive} border, {rounded.md}(8px) */}
{/* alert-default: {colors.canvas-soft} bg, 1px {colors.hairline} border */}
{serverError.type && <Alert variant={alertVariant}> ... }

<!-- 로그인 모드 (mode="login") -->
<form action={signInAction}>
  {/* field gap: {spacing.xl}(24px) */}
  <div className="space-y-[24px]">
    <div>
      {/* Label: {typography.body-md} 16px/400 Pretendard, {colors.ink} */}
      <Label htmlFor="email"> "이메일"
      {/* text-input: {colors.canvas} bg, 1px {colors.hairline}, {rounded.sm}(6px), focus ring {colors.primary} */}
      <Input id="email" type="email" name="email" placeholder="you@example.com"
             defaultValue={defaultEmail} required disabled={isLoading} />
      <FormFieldError message={fieldErrors.email} />

    <div>
      <div className="flex items-center justify-between">
        <Label htmlFor="password"> "비밀번호"
        <PasswordResetLink />
      <Input id="password" type="password" name="password" placeholder="비밀번호"
             required disabled={isLoading} />
      <FormFieldError message={fieldErrors.password} />

    {/* button-primary: {colors.primary}(#3ecf8e) bg, {colors.on-primary}(#171717) text — NOT white */}
    {/* {rounded.sm}(6px), {typography.button-md} 14px/500, w-full */}
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 animate-spin" aria-hidden="true" />}
      "로그인"

<!-- 회원가입 모드 (mode="signup") -->
<form action={signUpAction}>
  <div className="space-y-[24px]">
    <div>
      <Label htmlFor="signup-email"> "이메일"
      <Input id="signup-email" type="email" name="email" ... />
      <FormFieldError message={fieldErrors.email} />

    <div>
      <Label htmlFor="signup-password"> "비밀번호"
      <Input id="signup-password" type="password" name="password" placeholder="8자 이상" ... />
      <FormFieldError message={fieldErrors.password} />

    <div>
      <Label htmlFor="signup-confirm"> "비밀번호 확인"
      <Input id="signup-confirm" type="password" name="confirmPassword" placeholder="비밀번호 확인" ... />
      <FormFieldError message={fieldErrors.confirm} />

    <div className="flex items-start gap-2">
      <Checkbox id="terms" name="terms" disabled={isLoading} />
      {/* {typography.body-md} Pretendard */}
      <Label htmlFor="terms">
        "이용약관 및 개인정보 처리방침에 동의합니다"
        {/* link-on-light: {colors.ink} underline, hover {colors.primary-deep} */}
        <a href="#" className="underline"> "이용약관" </a>
        " 및 "
        <a href="#" className="underline"> "개인정보 처리방침" </a>
      <FormFieldError message={fieldErrors.terms} />

    {/* button-primary: emerald, {colors.on-primary}(near-black), w-full */}
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading && <Loader2 className="mr-2 animate-spin" aria-hidden="true" />}
      "계정 만들기"
```

## 8. Responsive

- 모바일·데스크탑 동일. `space-y-4`로 필드 간 여백 유지.
- 정확한 Input 높이 / 폰트 크기 → ui-rules.md 참조.

## 9. Accessibility

- 모든 Input에 연결된 `<Label htmlFor>`.
- 에러 시 Input에 `aria-invalid="true"` + `aria-describedby="field-error-id"`.
- Checkbox에 연결된 `<Label htmlFor="terms">`.
- 로딩 중 `Button`에 `aria-busy="true"`.
- 서버 `Alert`: `role="alert"` (shadcn 기본 내장).

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| 이메일 blur | Input `onBlur` | 이메일 형식 클라이언트 검증 |
| 비밀번호 blur (signup) | Input `onBlur` | 길이 클라이언트 검증 |
| 비밀번호 확인 blur (signup) | Input `onBlur` | 일치 클라이언트 검증 |
| 약관 토글 (signup) | Checkbox `onChange` | 상태 갱신 |
| 로그인 Submit | form submit / Enter | `signInAction` 호출 |
| 회원가입 Submit | form submit / Enter | `signUpAction` 호출 |
| "인증 메일 재전송" 클릭 | Button click | `onResendVerification()` |
| "로그인 탭으로 이동" 클릭 | Button click | `onSwitchToLogin()` |

## 11. Edge cases

- 로딩 중 탭 전환 → `AuthTabs`의 `disabled` prop으로 차단. 본 컴포넌트의 `isLoading`도 폼 필드를 비활성화.
- 중복 이메일 에러 시 `onSwitchToLogin()` 호출 후 로그인 탭에 이메일 값 전달 → `defaultEmail` prop으로 상위에서 관리.
- Server Action 호출 중 브라우저 뒤로 가기 → 미완료 상태 종료 (별도 처리 없음).
- 약관 링크는 v1에서 `href="#"` 더미 (PRD §14 A-4).

## 12. Example usage

```tsx
<EmailPasswordForm
  mode="login"
  serverError={actionResult?.error ?? { type: null }}
  isLoading={isPending}
  defaultEmail={pendingEmail}
  onResendVerification={() => router.push(`/auth/verify-email?email=${pendingEmail}`)}
/>
```

## 13. Cross-refs

- 탭 컨테이너 → `AuthTabs.md`
- 비밀번호 잊음 링크 → `PasswordResetLink.md`
- 인라인 에러 → `FormFieldError.md`
- SC-03 전체 상태 → `docs/v1-paper-prd.md §7 SC-03 §6`
- Server Action 스키마 → `docs/v1-paper-prd.md §7 SC-03 §11`
