# PasswordResetForm

## 1. Purpose

SC-06 비밀번호 재설정 화면에서 Step 1(이메일 입력 → 재설정 링크 발송)과 Step 2(새 비밀번호 설정)를 동일한 카드 컴포넌트 안에서 `step` prop으로 분기 렌더링한다.

## 2. Used in

SC-06

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Card` · `CardTitle` · `CardDescription` · `CardContent` · `Input` · `Label` · `Button` · `Alert` · `AlertDescription` |
| design primitive | `card-feature` (카드 컨테이너) · `text-input` · `button-primary` (Submit) · `alert-destructive` (토큰 에러/네트워크) |
| 도메인 wrapping | `PasswordResetForm` — step 1/2 분기 + emerald Submit + 재전송 버튼 조합 |

**핵심 토큰**:
- card (`card-feature`): `{colors.canvas}` bg, `{spacing.xxl}` (32px) padding, `{rounded.lg}` (12px), 1px `{colors.hairline}` border (max-w-md)
- CardTitle: `{typography.display-lg}` (36px/500) Pretendard, `{colors.ink}` (SC-06 페이지 타이틀)
- CardDescription: `{typography.body-md}` (16px/400) Pretendard, `{colors.ink-mute}`
- Input (`text-input`): `{colors.canvas}` bg, `{colors.ink}` text, `{typography.body-md}`, `{rounded.sm}` (6px), 1px `{colors.hairline}`, focus ring `{colors.primary}`
- Submit button (`button-primary` — **emerald CTA**, 화면당 1개 원칙): bg `{colors.primary}` (`#3ecf8e`), text `{colors.on-primary}` (near-black `#171717` — **white 금지**), `{rounded.sm}` (6px), `w-full`
- `alert-destructive`: `#fef2f2` bg (dark: `#3a1818`), 1px `{colors.destructive}` border, `{rounded.md}` (8px)
- MailCheck 아이콘 (step1.success): `{colors.primary}` (`#3ecf8e`) — emerald 아이콘으로 시각 확인
- "로그인 화면으로" link: `link-on-light` `{colors.ink-mute}` underline
- 다크 모드: canvas/hairline/ink 토큰 페어 자동 swap; emerald 아이콘/버튼 동일

## 4. Props (interface)

```typescript
interface PasswordResetFormProps {
  /** 현재 단계 */
  step: 1 | 2;
  /** 현재 폼 상태 */
  formState:
    | 'step1.default'
    | 'step1.loading'
    | 'step1.success'
    | 'step1.error.network'
    | 'step1.cooldown'
    | 'step2.default'
    | 'step2.loading'
    | 'step2.success'
    | 'step2.error.token-expired'
    | 'step2.error.token-invalid'
    | 'step2.error.password-mismatch'
    | 'step2.error.password-too-short'
    | 'step2.error.network';
  /** Step 1: 이메일 필드 에러 */
  emailError?: string | null;
  /** Step 2: 서버 에러 (토큰 만료/무효) */
  serverError?: string | null;
  /** 쿨다운 초 (step1.success 후 재전송 버튼) */
  cooldownSeconds?: number;
  /** Step 1 제출 핸들러 */
  onStep1Submit?: (email: string) => Promise<void>;
  /** Step 1 재전송 핸들러 */
  onStep1Resend?: () => Promise<void>;
  /** Step 2 제출 핸들러 */
  onStep2Submit?: (newPassword: string, confirmPassword: string) => Promise<void>;
  /** 로그인 화면으로 링크 경로 */
  loginHref?: string;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `step` | `1 \| 2` | — | ✅ |
| `formState` | `string` | `'step1.default'` | ✅ |
| `emailError` | `string \| null` | `null` | 아니오 |
| `serverError` | `string \| null` | `null` | 아니오 |
| `cooldownSeconds` | `number` | `0` | 아니오 |
| `onStep1Submit` | `function` | — | 조건부 |
| `onStep1Resend` | `function` | — | 조건부 |
| `onStep2Submit` | `function` | — | 조건부 |
| `loginHref` | `string` | `"/login"` | 아니오 |

## 5. Variants

```typescript
// step 1 폼 상태 + step 2 폼 상태 (총 10개 - Props §4 참조)
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `step1.default` | 이메일 Input + Submit 버튼 "재설정 링크 보내기" | 제출 대기 |
| `step1.loading` | Submit 버튼 `Loader2` + `disabled`, 폼 `pointer-events-none` | 처리 중 |
| `step1.success` | 폼 숨김 → `MailCheck` 아이콘 + 완료 메시지 + `ResendEmailButton` | 메일 확인 안내 |
| `step1.cooldown` | `ResendEmailButton` 쿨다운 상태 | 카운트다운 |
| `step1.error.network` | 폼 상단 `Alert`(destructive) | 재시도 가능 |
| `step2.default` | 새 비번 + 비번 확인 Input + Submit 버튼 "비밀번호 변경" | 제출 대기 |
| `step2.loading` | Submit 버튼 `Loader2` + `disabled` | 처리 중 |
| `step2.success` | Toast(default) + `/login` redirect (부모 처리) | — |
| `step2.error.token-expired` | 폼 숨김, `Alert`(destructive) + CTA "로그인 화면으로" | 클릭 → `/login` |
| `step2.error.token-invalid` | 동일 패턴, 카피만 변경 | — |
| `step2.error.password-mismatch` | 비번 확인 Input 아래 `FormFieldError` | 인라인 에러 |
| `step2.error.password-too-short` | 비번 Input 아래 `FormFieldError` | 인라인 에러 |
| `step2.error.network` | 폼 상단 `Alert`(destructive) | 재시도 가능 |

## 7. Composition

```
{/* card-feature: {colors.canvas} bg, {spacing.xxl}(32px) padding, {rounded.lg}(12px), 1px {colors.hairline} border */}
<Card className="max-w-md mx-auto">
  <CardContent>

    <!-- Step 1: 이메일 입력 -->
    {step === 1 && formState !== 'step1.success' && <>
      {/* {typography.display-lg} 36px/500 Pretendard, {colors.ink} */}
      <CardTitle> "비밀번호 재설정"
      {/* {typography.body-md} 16px/400 Pretendard, {colors.ink-mute} */}
      <CardDescription> "가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다."
      {/* alert-destructive: #fef2f2 bg(dark:#3a1818), 1px {colors.destructive} border, {rounded.md}(8px) */}
      {serverError && <Alert variant="destructive"><AlertDescription>{serverError}</AlertDescription></Alert>}
      <form onSubmit={handleStep1Submit}>
        {/* text-input: {colors.canvas} bg, 1px {colors.hairline}, {rounded.sm}(6px), focus ring {colors.primary} */}
        <Label htmlFor="reset-email"> "이메일"
        <Input id="reset-email" type="email" placeholder="you@example.com" disabled={isStep1Loading} />
        <FormFieldError message={emailError} />
        {/* button-primary: {colors.primary}(#3ecf8e) bg, {colors.on-primary}(#171717) text — NOT white */}
        {/* {rounded.sm}(6px), {typography.button-md} 14px/500, w-full */}
        <Button type="submit" className="w-full" disabled={isStep1Loading}>
          {isStep1Loading && <Loader2 className="animate-spin mr-2" aria-hidden="true" />}
          "재설정 링크 보내기"
      {/* link-on-light: {colors.ink-mute} underline */}
      <Link href={loginHref} className="underline">
        "로그인 화면으로"
    </>}

    <!-- Step 1: 완료 뷰 -->
    {step === 1 && formState === 'step1.success' && <>
      {/* MailCheck: {colors.primary}(#3ecf8e) — emerald 시각 확인 */}
      <MailCheck className="w-12 h-12 mx-auto mb-4" aria-hidden="true" /> {/* color: {colors.primary} */}
      {/* {typography.body-md} Pretendard, {colors.ink} */}
      <p> "재설정 링크를 이메일로 보냈습니다. 메일함을 확인해주세요."
      {/* {typography.caption} {colors.ink-mute} */}
      <p> "메일이 보이지 않으면 스팸 폴더를 확인해보세요."
      <ResendEmailButton
        onResend={onStep1Resend}
        cooldownSeconds={cooldownSeconds}
        activeLabel="재설정 링크 재전송"
      />
    </>}

    <!-- Step 2: 새 비밀번호 입력 -->
    {step === 2 && !isStep2TokenError && <>
      {/* {typography.display-lg} 36px/500 Pretendard, {colors.ink} */}
      <CardTitle> "새 비밀번호 설정"
      {serverError && <Alert variant="destructive">...</Alert>}
      <form onSubmit={handleStep2Submit}>
        <Label htmlFor="new-password"> "새 비밀번호"
        <Input id="new-password" type="password" placeholder="새 비밀번호 (8자 이상)" disabled={isStep2Loading} />
        <FormFieldError message={passwordError} />
        <Label htmlFor="confirm-password"> "비밀번호 확인"
        <Input id="confirm-password" type="password" placeholder="비밀번호 확인" disabled={isStep2Loading} />
        <FormFieldError message={confirmError} />
        {/* button-primary: emerald, {colors.on-primary}(near-black), w-full */}
        <Button type="submit" className="w-full" disabled={isStep2Loading}>
          "비밀번호 변경"
    </>}

    <!-- Step 2: 토큰 에러 뷰 -->
    {step === 2 && isStep2TokenError && <>
      {/* alert-destructive: #fef2f2 bg, 1px {colors.destructive} border */}
      <Alert variant="destructive">
        <AlertDescription>{serverError}</AlertDescription>
      {/* button-secondary-outline: 1px {colors.hairline-strong} border, {rounded.sm}(6px) */}
      <Button variant="outline" asChild>
        <Link href={loginHref}> "로그인 화면으로"
    </>}
```

## 8. Responsive

- `Card max-w-md` — 모바일 전체 너비, 데스크탑 중앙 고정.
- 정확한 card padding → ui-rules.md 참조.

## 9. Accessibility

- 각 Input에 `<Label htmlFor>`.
- 에러 시 Input에 `aria-invalid="true"` + `aria-describedby`.
- Step 전환 시 카드 제목(`CardTitle`)에 포커스 이동 권장 (`autoFocus` 또는 `useEffect`).
- `Alert`(destructive): `role="alert"` 기본 내장.

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| Step 1 Submit | form submit / Enter | `onStep1Submit(email)` |
| Step 1 재전송 | `ResendEmailButton` click | `onStep1Resend()` |
| Step 2 Submit | form submit / Enter | `onStep2Submit(newPassword, confirmPassword)` |
| "로그인 화면으로" 클릭 | Link/Button click | `/login` 이동 |

## 11. Edge cases

- Step 2 URL에 recovery 토큰 없이 직접 진입 → `step2.error.token-invalid` 상태 표시(폼 없음).
- Step 2 비밀번호 변경 성공 → Supabase가 기존 세션 자동 무효화. 별도 UI 처리 불필요.
- Step 1 이메일 미가입 여부 → 통일 응답 "메일 보냄" (PRD §14 B-5).
- Supabase 재설정 링크 기본 만료: 1시간 (PRD §14 B-4).

## 12. Example usage

```tsx
<PasswordResetForm
  step={step}
  formState={formState}
  cooldownSeconds={cooldown}
  emailError={fieldErrors.email}
  serverError={actionError}
  onStep1Submit={requestPasswordResetAction}
  onStep1Resend={requestPasswordResetAction}
  onStep2Submit={updatePasswordAction}
/>
```

## 13. Cross-refs

- 재전송 버튼 → `ResendEmailButton.md`
- 인라인 에러 → `FormFieldError.md`
- 화면 구조 → `docs/v1/structure.md` SC-06
- 상태 정의 → `docs/v1-paper-prd.md §7 SC-06 §6`
- Server Action 스키마 → `docs/v1-paper-prd.md §7 SC-06 §11`
