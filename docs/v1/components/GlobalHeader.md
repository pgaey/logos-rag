# GlobalHeader

## 1. Purpose

모든 페이지 최상단에 고정되어 앱 정체성(로고)과 인증 상태, 잔여 일일 한도를 항상 표시한다.

## 2. Used in

SC-01, SC-02, SC-03(minimal), SC-04(minimal), SC-05(minimal), SC-06(minimal), SC-07, SC-08, SC-09

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `DropdownMenu` · `Badge` · `Button` · `Skeleton` · `Separator` (DropdownMenu 내부) |
| design primitive | `nav-bar` · `badge-default` / `badge-destructive` · `button-secondary-outline` (`"로그인"`) · `button-ghost` (UserMenu trigger) · `skeleton` |
| 도메인 wrapping | `GlobalHeader` — `nav-bar` 위에 인증 상태 분기 추가 |

**핵심 토큰**:
- 배경: `{colors.canvas}` (white), `prefers-color-scheme: dark` 시 `{colors.canvas-dark}` 자동
- 하단 border: 1px `{colors.hairline}` (`{colors.hairline-dark}` dark 페어)
- height: 64px, `sticky top-0`, `z-50` (정확한 값 → ui-rules.md)
- 로고 워드마크: `{typography.display-md}` (28px/500) Pretendard
- "로그인" 버튼: `button-secondary-outline` — `{colors.hairline-strong}` border, `{rounded.sm}` (6px), size=sm
- QuotaBadge (healthy): `badge-default` + emerald dot `{colors.primary}` (`#3ecf8e`)
- QuotaBadge (zero): `badge-destructive` — `{colors.destructive}` border/text
- Skeleton (quota 로딩): `{colors.canvas-soft}` ↔ `{colors.hairline-cool}` pulse, `{rounded.sm}`
- 다크 모드: canvas/hairline/ink 토큰 페어 자동 swap; emerald dot 색 동일 유지

## 4. Props (interface)

```typescript
interface GlobalHeaderProps {
  /** 인증 상태에 따른 헤더 변형 */
  variant: 'unauthenticated' | 'authenticated' | 'minimal';
  /** 인증 사용자 정보 (variant=authenticated 시 필수) */
  user?: {
    email: string;
  };
  /** 잔여 일일 한도 (phase-04 전까지는 undefined 가능) */
  quotaRemaining?: number;
  /** 잔여 한도 로딩 여부 */
  quotaLoading?: boolean;
  /** 로그아웃 Server Action */
  onSignOut?: () => Promise<void>;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `variant` | `'unauthenticated' \| 'authenticated' \| 'minimal'` | — | ✅ |
| `user` | `{ email: string }` | `undefined` | 조건부 |
| `quotaRemaining` | `number` | `undefined` | 아니오 |
| `quotaLoading` | `boolean` | `false` | 아니오 |
| `onSignOut` | `() => Promise<void>` | — | 조건부 |

## 5. Variants

```typescript
type HeaderVariant =
  | 'unauthenticated'   // 로고 + "로그인" 버튼
  | 'authenticated'     // 로고 + QuotaBadge + UserMenu
  | 'minimal';          // 로고만 (인증 페이지 SC-03~SC-06)
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` (unauthenticated) | 로고 + "로그인" 버튼(default) | "로그인" 클릭 → `/login` |
| `default` (authenticated) | 로고 + QuotaBadge + UserMenu 아이콘 | DropdownMenu 클릭 가능 |
| `default` (minimal) | 로고만, 우측 컨트롤 없음 | 로고 클릭 → `/` |
| `loading` (quota) | Badge 자리에 `Skeleton` (w-12 h-5) | 데이터 대기 중 |
| `loading` (signout) | DropdownMenu 닫힘, UserMenu 버튼에 `Loader2` 스피너 | 클릭 차단 |
| `quota-zero` | Badge variant=destructive, 텍스트 "0 / 20" | SC-02 상태와 연동 |
| `error` (signout) | `Toast`(destructive) 노출 | 사용자에게 새로고침 안내 |

## 7. Composition

```
<header> (sticky top-0, z-50, h-[64px], border-b {colors.hairline}, bg-{colors.canvas}/95 backdrop-blur-sm)
  {/* dark: bg-{colors.canvas-dark}/95, border-{colors.hairline-dark} */}
  <div> (max-w-2xl, mx-auto, px-4, flex, items-center, justify-between)
    <!-- 좌측 -->
    <Link href="/qa" | "/login" aria-label="logos-rag 홈">
      <span> "logos-rag"    {/* {typography.display-md} 28px/500 Pretendard, {colors.ink} */}
      <span> "성경 AI 검색"  {/* {typography.micro} 12px/400, {colors.ink-mute}, hidden sm:block */}

    <!-- 우측: variant=unauthenticated -->
    {/* button-secondary-outline: {colors.canvas} bg, 1px {colors.hairline-strong} border, {rounded.sm}(6px) */}
    <Button variant="outline" size="sm"> "로그인"

    <!-- 우측: variant=authenticated -->
    <QuotaBadge remaining={quotaRemaining} loading={quotaLoading} />
    <UserMenu email={user.email} onSignOut={onSignOut} />

    <!-- 우측: variant=minimal -->
    (없음)
```

## 8. Responsive

- 모바일 (`sm` 미만): 태그라인 "성경 AI 검색" 숨김 (`hidden sm:block`). Badge 는 최소화(숫자만). UserMenu 아이콘 유지.
- 데스크탑 (`sm` 이상): 태그라인 표시. Badge 전체 텍스트 "N / 20" 표시.
- 정확한 breakpoint 수치 → ui-rules.md 참조.

## 9. Accessibility

- `<header>` 시맨틱 태그 사용.
- 로고 링크: `aria-label="logos-rag 홈으로"`.
- "로그인" 버튼: 의미 자명하므로 별도 aria-label 불필요.
- `DropdownMenu` Trigger에 `aria-label="사용자 메뉴"`.
- 키보드: Tab → 로고 링크 → 우측 컨트롤(버튼/메뉴). `Esc` → DropdownMenu 닫힘(shadcn 기본).

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| 로고 클릭 | `Link` click | variant=authenticated → `/qa`, 그 외 → `/login` |
| "로그인" 클릭 | `Button` click | `/login` 이동 |
| UserMenu 로그아웃 | `DropdownMenuItem` click | `onSignOut()` 호출 → 성공 시 `/login` + Toast |
| 로그아웃 성공 | `onSignOut` resolve | Toast(default) "로그아웃했습니다." + `/login` redirect |
| 로그아웃 실패 | `onSignOut` reject | Toast(destructive) + 새로고침 안내 |

## 11. Edge cases

- `quotaLoading=true` 상태에서 `quotaRemaining`이 undefined이면 Badge 대신 `Skeleton` 표시.
- `variant=minimal`인 인증 페이지에서 로고 href는 인증 상태 무관 `/`(또는 `/login`)로 설정한다.
- 서드파티 쿠키 차단 환경에서 세션 쿠키 손실 시 → `unauthenticated` variant로 폴백.
- phase-03에서 `quotaRemaining`이 미구현이면 Badge를 숨기거나 "20 / 20" 고정 표시 (PRD §14 C-4 결정 전).

## 12. Example usage

```tsx
// 인증된 사용자 헤더 (Server Component 래핑 예시)
<GlobalHeader
  variant="authenticated"
  user={{ email: "user@example.com" }}
  quotaRemaining={17}
  quotaLoading={false}
  onSignOut={signOutAction}
/>

// 인증 페이지 미니멀 헤더
<GlobalHeader variant="minimal" />
```

## 13. Cross-refs

- 화면 구조 → `docs/v1/structure.md` SC-07
- 잔여 한도 Badge 세부 → `QuotaBadge.md`
- DropdownMenu 상세 → `UserMenu.md`
- 로그아웃 flow → `docs/v1-paper-prd.md §5.2` (signOut 시퀀스)
