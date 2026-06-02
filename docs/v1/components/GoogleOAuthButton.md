# GoogleOAuthButton

## 1. Purpose

SC-03에서 Google 계정으로 로그인/회원가입을 시작하는 단일 버튼. 탭(로그인/회원가입)과 무관하게 항상 Tabs 상단에 배치된다.

## 2. Used in

SC-03

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Button` |
| design primitive | `button-secondary-outline` (variant=outline, full-width) |
| 도메인 wrapping | `GoogleOAuthButton` — `button-secondary-outline` + Google G SVG 아이콘 + 로딩 분기 |

**핵심 토큰**:
- `button-secondary-outline`: `{colors.canvas}` bg, `{colors.ink}` text, 1px solid `{colors.hairline-strong}` border, `{rounded.sm}` (6px), `{typography.button-md}` (14px/500) Pretendard, padding `{spacing.sm} {spacing.lg}` (8px 16px)
  - hover: `{colors.canvas-soft}` bg — transition ms → ui-rules.md
  - disabled: opacity 감소, `cursor-not-allowed`
- `w-full` (카드 너비 전체)
- Google G 아이콘: SVG 직접 삽입 (lucide-react 없음), `aria-hidden="true"`
- 다크 모드: bg `{colors.canvas-dark}`, border `{colors.hairline-strong-dark}`, text `{colors.ink-dark}` 자동

## 4. Props (interface)

```typescript
interface GoogleOAuthButtonProps {
  /** 버튼 비활성화 (이메일 폼 로딩 중 차단) */
  disabled?: boolean;
  /** OAuth 시작 핸들러 */
  onClick: () => void | Promise<void>;
  /** OAuth 진행 중 로딩 상태 */
  isLoading?: boolean;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `disabled` | `boolean` | `false` | 아니오 |
| `onClick` | `() => void \| Promise<void>` | — | ✅ |
| `isLoading` | `boolean` | `false` | 아니오 |

## 5. Variants

```typescript
type GoogleOAuthButtonState =
  | 'default'    // 정상 활성
  | 'loading'    // Google OAuth 리디렉션 대기 중
  | 'disabled';  // 이메일 폼 로딩 중 차단
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` | `button-secondary-outline` w-full: `{colors.canvas}` bg, 1px `{colors.hairline-strong}` border, `{rounded.sm}`, `{colors.ink}` text. Google G SVG + "Google 계정으로 계속하기" | 클릭 가능 |
| `loading` | `Loader2` 스피너 (`aria-hidden="true"`) + 텍스트 유지, `disabled=true`, opacity 감소 | 리디렉션 대기 |
| `disabled` | `disabled=true`, `cursor-not-allowed`, opacity 감소 (`{colors.ink-faint}` 계열) | 클릭 차단 |

## 7. Composition

```
<Button
  variant="outline"
  className="w-full"
  type="button"
  disabled={disabled || isLoading}
  onClick={onClick}
>
  {isLoading
    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    : <GoogleIcon className="mr-2 h-4 w-4" />   ← lucide-react 없음, SVG 직접 삽입
  }
  "Google 계정으로 계속하기"
```

Google 'G' 아이콘은 `lucide-react`에 포함되지 않으므로 SVG를 직접 삽입하거나 별도 asset을 사용한다.

## 8. Responsive

- `w-full`로 카드 너비 전체를 채움.
- 모바일·데스크탑 동일.

## 9. Accessibility

- `type="button"` 명시 (form submit 방지).
- `aria-label="Google 계정으로 계속하기"` (아이콘이 있으므로 명시적으로 추가).
- `isLoading` 시 `aria-busy="true"`.
- Google 아이콘: `aria-hidden="true"` (텍스트가 의미 전달).

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| 클릭 | Button click | `onClick()` 호출 → `supabase.auth.signInWithOAuth({ provider: 'google' })` → 외부 redirect |
| OAuth 팝업 취소 | 외부 이벤트 | `loading` 해제, default 복귀 (에러 표시 없음 — PRD §7 SC-03 §7.5) |

## 11. Edge cases

- Google OAuth 흐름 시작 후 사용자가 브라우저 뒤로 가기를 누르면 `loading` 상태가 남을 수 있음 → `isLoading` 상태는 부모에서 관리하며, visibility 이벤트 등으로 초기화 처리.
- 이메일 폼 제출 중(`disabled=true`)에 Google 버튼 클릭 시도 → `disabled`로 자동 차단.
- Google OAuth provider가 미활성화된 경우 → Supabase Client SDK 에러 → Toast(destructive) 처리는 부모 책임.

## 12. Example usage

```tsx
<GoogleOAuthButton
  onClick={handleGoogleSignIn}
  isLoading={googleLoading}
  disabled={emailLoading}
/>
```

## 13. Cross-refs

- 배치 컨텍스트 → `AuthTabs.md`
- OAuth flow → `docs/v1-paper-prd.md §5.2` (2-C Google OAuth 분기)
- SC-04 연동 → `CallbackLoader.md`
