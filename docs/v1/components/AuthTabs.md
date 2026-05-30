# AuthTabs

## 1. Purpose

SC-03 로그인/회원가입 화면에서 "로그인"과 "회원가입" 탭을 전환하는 컨테이너 역할을 한다. 탭 전환 시 URL `?tab=` 쿼리를 동기화한다.

## 2. Used in

SC-03

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Tabs` · `TabsList` · `TabsTrigger` · `TabsContent` · `Card` |
| design primitive | `tabs-list` · `tabs-trigger` · `card-feature` (카드 컨테이너) |
| 도메인 wrapping | `AuthTabs` — `tabs-list`/`tabs-trigger` 위에 로그인/회원가입 URL 쿼리 동기화 추가 |

**핵심 토큰**:
- card container (`card-feature`): `{colors.canvas}` bg, `{spacing.xxl}` (32px) padding, `{rounded.lg}` (12px), 1px `{colors.hairline}` border (max-w-md ~448px)
- `tabs-list`: `{colors.canvas-soft}` bg, `{spacing.xxs}` (2px) padding, `{rounded.sm}` (6px), inline-flex
- `tabs-trigger` active: `{colors.canvas}` bg, `{colors.ink}` text, Level 1 shadow; `{typography.heading-md}` (18px/500) Pretendard
- `tabs-trigger` inactive: transparent bg, `{colors.ink-mute}` text; `{typography.heading-md}`
- 워드마크: `{typography.display-md}` (28px/500) Pretendard, `{colors.ink}`
- 태그라인: `{typography.caption}` (13px/400) Pretendard, `{colors.ink-mute}`
- 구분선: 1px `{colors.hairline}`, 텍스트 "또는 이메일로" `{typography.caption}` `{colors.ink-mute}`
- 다크 모드: canvas/hairline/ink 토큰 페어 자동 swap

## 4. Props (interface)

```typescript
interface AuthTabsProps {
  /** 초기 활성 탭 (URL ?tab= 쿼리에서 결정) */
  defaultTab?: 'login' | 'signup';
  /** 탭 변경 핸들러 (URL 쿼리 동기화용) */
  onTabChange?: (tab: 'login' | 'signup') => void;
  /** 로딩 중 탭 전환 차단 여부 */
  disabled?: boolean;
  /** 로그인 탭 내부 콘텐츠 */
  loginContent: React.ReactNode;
  /** 회원가입 탭 내부 콘텐츠 */
  signupContent: React.ReactNode;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `defaultTab` | `'login' \| 'signup'` | `'login'` | 아니오 |
| `onTabChange` | `(tab: 'login' \| 'signup') => void` | — | 아니오 |
| `disabled` | `boolean` | `false` | 아니오 |
| `loginContent` | `React.ReactNode` | — | ✅ |
| `signupContent` | `React.ReactNode` | — | ✅ |

## 5. Variants

```typescript
type AuthTabValue = 'login' | 'signup';
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` (login) | "로그인" 탭 활성, 로그인 폼 표시 | 탭 전환 가능 |
| `default` (signup) | "회원가입" 탭 활성, 회원가입 폼 표시 | 탭 전환 가능 |
| `disabled` | 두 `TabsTrigger` 모두 `disabled=true`, pointer-events-none | 로딩 중 전환 차단 |

## 7. Composition

```
{/* card-feature: {colors.canvas} bg, {spacing.xxl}(32px) padding, {rounded.lg}(12px), 1px {colors.hairline} border */}
<Card className="max-w-md mx-auto">
  <!-- 카드 상단 워드마크 -->
  <div className="mb-6 text-center">
    {/* {typography.display-md} 28px/500 Pretendard, {colors.ink} */}
    <p> "logos-rag"
    {/* {typography.caption} 13px/400 Pretendard, {colors.ink-mute} */}
    <p> "성경 의미 검색 · AI 답변"

  <!-- Google OAuth 버튼 (탭 밖 배치) -->
  <GoogleOAuthButton />

  <!-- 구분선 -->
  <div className="relative my-4">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" /> {/* 1px {colors.hairline} */}
    {/* {typography.caption} {colors.ink-mute} */}
    <div className="relative flex justify-center">
      "또는 이메일로"

  <!-- 탭 -->
  {/* tabs-list: {colors.canvas-soft} bg, {spacing.xxs}(2px) padding, {rounded.sm}(6px) */}
  <Tabs defaultValue={defaultTab} onValueChange={onTabChange}>
    <TabsList className="w-full">
      {/* tabs-trigger active: {colors.canvas} bg, {colors.ink} text, Level 1 shadow */}
      {/* tabs-trigger inactive: transparent, {colors.ink-mute} text */}
      {/* {typography.heading-md} 18px/500 Pretendard */}
      <TabsTrigger value="login" disabled={disabled} className="flex-1"> "로그인"
      <TabsTrigger value="signup" disabled={disabled} className="flex-1"> "회원가입"

    <TabsContent value="login">
      {loginContent}

    <TabsContent value="signup">
      {signupContent}
```

## 8. Responsive

- `Card`가 `max-w-md`로 제한되어 모바일에서 가득 채움, 데스크탑에서 중앙 고정.
- `TabsList` 는 `w-full`로 두 탭을 균등 분할.
- 정확한 card padding → ui-rules.md 참조.

## 9. Accessibility

- `Tabs` 컴포넌트의 WAI-ARIA Tabs 패턴 자동 적용 (shadcn/ui Radix 기본).
- `TabsTrigger`: `role="tab"`, `aria-selected`, `aria-controls`.
- `TabsContent`: `role="tabpanel"`, `aria-labelledby`.
- 키보드: `Tab` → TabsList 진입 → 방향키로 탭 전환 → `Tab` → 내부 폼 이동.

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| 탭 전환 | `TabsTrigger` click | `onTabChange(tab)` 호출, URL `?tab=` 갱신 |
| `disabled=true` | 탭 클릭 시도 | 무시 (로딩 중 방어) |

## 11. Edge cases

- URL `?tab=signup`으로 직접 진입 시 `defaultTab='signup'`으로 회원가입 탭 초기 활성화.
- 잘못된 `?tab=` 값(예: `?tab=other`) → `'login'` 폴백.
- 로딩 중(`disabled=true`) 탭 전환 시도 → `TabsTrigger` disabled로 차단.
- 이미 로그인된 사용자가 `/login` 방문 → 서버(RSC)에서 `/qa` redirect, 탭 컴포넌트는 렌더링되지 않음.

## 12. Example usage

```tsx
<AuthTabs
  defaultTab={searchParams.tab === 'signup' ? 'signup' : 'login'}
  onTabChange={(tab) => router.push(`/login?tab=${tab}`, { scroll: false })}
  disabled={isLoading}
  loginContent={<EmailPasswordForm mode="login" />}
  signupContent={<EmailPasswordForm mode="signup" />}
/>
```

## 13. Cross-refs

- 탭 내부 폼 → `EmailPasswordForm.md`
- Google OAuth 버튼 → `GoogleOAuthButton.md`
- 화면 구조 → `docs/v1/structure.md` SC-03
- URL 탭 쿼리 동기화 → `docs/v1-paper-prd.md §7 SC-03 §6`
