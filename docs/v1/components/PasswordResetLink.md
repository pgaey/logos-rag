# PasswordResetLink

## 1. Purpose

SC-03 로그인 탭의 비밀번호 필드 옆(또는 아래)에 위치하여 사용자를 SC-06 비밀번호 재설정 화면으로 안내하는 작은 텍스트 링크다.

## 2. Used in

SC-03 (EmailPasswordForm 내부, mode="login" 시)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | 없음 (네이티브 `<a>` 또는 Next.js `<Link>`) |
| design primitive | `link-on-light` (`{colors.ink}` underline, hover `{colors.primary-deep}`) |
| 도메인 wrapping | `PasswordResetLink` — `link-on-light` 위에 비밀번호 잊음 라우팅 추가 |

**핵심 토큰**:
- 텍스트: `{typography.caption}` (13px/400) Pretendard, `{colors.ink-mute}` — hover: `{colors.primary-deep}` (`#24b47e`) — transition ms → ui-rules.md
- persistent underline
- disabled: opacity 감소, `pointer-events-none`
- focus ring: `focus-visible:ring-2` — 규칙 → ui-rules.md

## 4. Props (interface)

```typescript
interface PasswordResetLinkProps {
  /** 비밀번호 재설정 경로 */
  href?: string;
  /** 비활성화 (폼 로딩 중) */
  disabled?: boolean;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `href` | `string` | `"/auth/reset-password"` | 아니오 |
| `disabled` | `boolean` | `false` | 아니오 |

## 5. Variants

상태 변화 없음. `disabled` 시 시각 muted + pointer-events-none.

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` | `{typography.caption}` 13px/400 Pretendard, `{colors.ink-mute}`, persistent underline | 클릭 시 `/auth/reset-password` 이동 |
| `hover` | underline 유지 + `{colors.primary-deep}` text — transition ms → ui-rules.md | — |
| `disabled` | opacity 감소, `pointer-events-none` | 클릭 차단 (폼 로딩 중) |

## 7. Composition

```
{/* link-on-light: {colors.ink-mute} text, persistent underline */}
{/* hover: {colors.primary-deep}(#24b47e) text — transition ms → ui-rules.md */}
<Link
  href={href}
  className={cn(
    "underline",  /* {typography.caption} 13px/400 Pretendard, {colors.ink-mute} */
    disabled && "pointer-events-none opacity-50"
  )}
  tabIndex={disabled ? -1 : undefined}
>
  "비밀번호를 잊으셨나요?"
```

## 8. Responsive

- 모바일·데스크탑 동일. 작은 텍스트 링크로 필드 우측 상단 또는 아래에 배치.
- 정확한 위치 (우측 정렬 vs 왼쪽 정렬) → ui-rules.md 참조.

## 9. Accessibility

- 링크 텍스트 "비밀번호를 잊으셨나요?"가 의미 자명.
- `disabled` 시 `tabIndex={-1}`로 키보드 탐색에서 제외.
- focus ring 유지 (shadcn 기본 ring 스타일 상속).

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| 클릭 | Link click | `/auth/reset-password` 페이지 이동 (SC-06 step 1) |

## 11. Edge cases

- `disabled=true` (폼 로딩 중) 시 클릭해도 이동하지 않음.
- 회원가입 탭에서는 이 컴포넌트를 렌더링하지 않음 (`mode="signup"` 시 부모가 조건부 포함).

## 12. Example usage

```tsx
// 로그인 탭 비밀번호 필드 옆
<div className="flex items-center justify-between">
  <Label htmlFor="password">비밀번호</Label>
  <PasswordResetLink disabled={isLoading} />
</div>
```

## 13. Cross-refs

- 배치 컨텍스트 → `EmailPasswordForm.md`
- 이동 목적지 화면 → `PasswordResetForm.md`
- SC-06 상태 정의 → `docs/v1-paper-prd.md §7 SC-06 §6`
