# UserMenu

## 1. Purpose

헤더 우측에서 인증 사용자의 이메일을 표시하고, 로그아웃 액션을 드롭다운 메뉴로 제공한다.

## 2. Used in

SC-01, SC-02, SC-07

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `DropdownMenu` · `DropdownMenuTrigger` · `DropdownMenuContent` · `DropdownMenuLabel` · `DropdownMenuSeparator` · `DropdownMenuItem` · `Button` |
| design primitive | `dropdown-menu` · `button-ghost` (trigger) |
| 도메인 wrapping | `UserMenu` — `dropdown-menu` 위에 로그아웃 액션 + 이메일 라벨 추가 |

**핵심 토큰**:
- trigger button: `button-ghost` — transparent bg, `{colors.ink}` icon, `{rounded.sm}` (6px), size=icon (36×36, ui-rules.md 참조)
- dropdown container: `{colors.canvas}` bg, 1px `{colors.hairline}` border, `{rounded.md}` (8px), Level 2 shadow (`0 8px 24px rgba(0,0,0,0.08)`)
- menu label (이메일): `{typography.body-md}` (16px/400) Pretendard, `{colors.ink-mute}`
- menu item (로그아웃): `{typography.body-md}`, `{colors.ink}` — hover: `{colors.canvas-soft}` bg
- 아바타: `{rounded.full}` (9999px) — v1 User 아이콘 사용
- 다크 모드: dropdown bg `{colors.canvas-dark}`, border `{colors.hairline-dark}`, text `{colors.ink-dark}` 자동

## 4. Props (interface)

```typescript
interface UserMenuProps {
  /** 표시할 사용자 이메일 */
  email: string;
  /** 로그아웃 Server Action */
  onSignOut: () => Promise<void>;
  /** 로그아웃 진행 중 여부 (외부 상태 주입 방식) */
  signingOut?: boolean;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `email` | `string` | — | ✅ |
| `onSignOut` | `() => Promise<void>` | — | ✅ |
| `signingOut` | `boolean` | `false` | 아니오 |

## 5. Variants

```typescript
type UserMenuState =
  | 'default'      // DropdownMenu 닫힘
  | 'open'         // DropdownMenu 열림
  | 'signing-out'; // 로그아웃 처리 중
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` | `User` 아이콘 버튼(ghost, icon), DropdownMenu 닫힘 | Trigger 클릭 시 `open` |
| `open` | DropdownMenuContent 표시 (이메일 라벨 + Separator + "로그아웃") | 항목 클릭 가능 |
| `signing-out` | Trigger 버튼 내 `Loader2` 스피너, DropdownMenu 닫힘, `disabled=true` | 클릭 차단 |
| `error` | Toast(destructive) 표시, 버튼 다시 활성화 | 재시도 가능 |

## 7. Composition

```
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    {/* button-ghost: transparent bg, {colors.ink}, {rounded.sm}(6px), size=icon */}
    <Button variant="ghost" size="icon" aria-label="사용자 메뉴" disabled={signingOut}>
      {signingOut ? <Loader2 className="animate-spin" /> : <User />}

  {/* dropdown-menu: {colors.canvas} bg, 1px {colors.hairline} border, {rounded.md}(8px), Level 2 shadow */}
  <DropdownMenuContent align="end">
    {/* {typography.body-md} 16px/400 Pretendard, {colors.ink-mute} */}
    <DropdownMenuLabel className="font-normal">
      {email}
    <DropdownMenuSeparator /> {/* 1px {colors.hairline} */}
    {/* hover: {colors.canvas-soft} bg */}
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
      "로그아웃"
```

## 8. Responsive

- 모바일·데스크탑 모두 동일한 아이콘 버튼. DropdownMenuContent는 `align="end"`로 화면 우측 맞춤.
- 정확한 아이콘 크기 → ui-rules.md 참조.

## 9. Accessibility

- Trigger 버튼: `aria-label="사용자 메뉴"`, `aria-haspopup="menu"`, `aria-expanded={open}`.
- DropdownMenu 내 항목들: 키보드 방향키로 탐색 (shadcn/ui Radix 기본 동작).
- `Esc`: DropdownMenu 닫기.
- `LogOut` 아이콘에 `aria-hidden="true"` (텍스트 "로그아웃"이 의미 전달).

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| Trigger 클릭 | Button click | DropdownMenu `open` ↔ 닫힘 토글 |
| "로그아웃" 클릭 | `DropdownMenuItem` click | `onSignOut()` 호출, `signingOut=true` |
| 로그아웃 성공 | `onSignOut` resolve | Toast(default) "로그아웃했습니다." + `/login` redirect (부모 처리) |
| 로그아웃 실패 | `onSignOut` reject | Toast(destructive) + `signingOut=false` 복귀 |

## 11. Edge cases

- `email`이 매우 긴 경우 (예: 40자 이상) — DropdownMenuLabel에서 `truncate` + `max-w-[200px]` 처리.
- `signingOut` 중 Trigger를 재클릭하면 `disabled=true`이므로 무시.
- DropdownMenu 열린 상태에서 페이지 이동 시 자동으로 닫힘 (Radix 기본 동작).

## 12. Example usage

```tsx
<UserMenu
  email="user@example.com"
  onSignOut={signOutAction}
  signingOut={isPending}
/>
```

## 13. Cross-refs

- 헤더 내 배치 → `GlobalHeader.md`
- 로그아웃 Server Action → `docs/v1-paper-prd.md §8.1` (`signOut`)
- 헤더 전체 상태 → `docs/v1-paper-prd.md §7 SC-07 §6`
