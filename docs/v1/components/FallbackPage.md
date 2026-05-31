# FallbackPage

## 1. Purpose

SC-09에서 404(존재하지 않는 경로) 또는 500(서버/런타임 에러) 상황을 처리하여, 사용자가 앱으로 빠르게 복귀할 수 있도록 큰 숫자 + 안내 카피 + CTA를 중앙에 표시한다.

## 2. Used in

SC-09 (`app/not-found.tsx`, `app/error.tsx`)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Button` |
| design primitive | `button-primary` ("홈으로") · `button-secondary-outline` ("새로고침") · display typography |
| 도메인 wrapping | `FallbackPage` — 404/500 display 숫자 + 안내 카피 + CTA 버튼 조합 |

**핵심 토큰**:
- 큰 숫자 "404"/"500": `{typography.display-xl}` (48px/500) Pretendard, `{colors.ink-faint}` (장식용 muted)
- 제목 `<h1>`: `{typography.heading-lg}` (22px/500) Pretendard, `{colors.ink}`
- 메시지 `<p>`: `{typography.body-md}` (16px/400) Pretendard, `{colors.ink-mute}`
- "홈으로" (`button-primary` — **emerald CTA**, SC-09 viewport 당 1개): bg `{colors.primary}` (`#3ecf8e`), text `{colors.on-primary}` (near-black `#171717` — **white 금지**), `{rounded.sm}` (6px), `{typography.button-md}` (14px/500)
- "새로고침" (`button-secondary-outline`): `{colors.hairline-strong}` border, `{rounded.sm}` (6px), `{colors.ink}` text
- 오류 ID: `{typography.micro}` (12px/400), `{colors.ink-mute-2}`
- 다크 모드: ink/ink-mute/ink-faint 토큰 페어 자동 swap; emerald 버튼 동일

## 4. Props (interface)

```typescript
interface FallbackPageProps {
  /** 에러 유형 */
  type: 'not-found' | 'server-error';
  /** Next.js Error Boundary의 reset 함수 (type=server-error 시) */
  reset?: () => void;
  /** "홈으로" 버튼의 목적지 (인증 여부에 따라 /qa 또는 /login) */
  homeHref?: string;
  /** 개발 환경 또는 ?debug=1 시 오류 ID 표시 (선택) */
  errorDigest?: string;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `type` | `'not-found' \| 'server-error'` | — | ✅ |
| `reset` | `() => void` | `undefined` | 조건부 |
| `homeHref` | `string` | `"/qa"` | 아니오 |
| `errorDigest` | `string` | `undefined` | 아니오 |

## 5. Variants

```typescript
type FallbackType =
  | 'not-found'     // 404
  | 'server-error'; // 500
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `not-found` | "404" 큰 숫자, 제목, 메시지, "홈으로" 버튼 | "홈으로" → `homeHref` |
| `server-error` | "500" 큰 숫자, 제목, 메시지, "새로고침" + "홈으로" 버튼 | "새로고침" → `reset()`, "홈으로" → `homeHref` |
| `server-error.with-debug` | 동일 + 오류 ID 표시 (`?debug=1` 또는 개발 환경) | — |

## 7. Composition

```
<div className="flex flex-col items-center gap-4 text-center py-20 max-w-sm mx-auto">
  <!-- 큰 숫자: {typography.display-xl} 48px/500 Pretendard, {colors.ink-faint} (장식용) -->
  <p>
    {type === 'not-found' ? '404' : '500'}

  <!-- 제목: {typography.heading-lg} 22px/500 Pretendard, {colors.ink} -->
  <h1>
    {type === 'not-found' ? '페이지를 찾을 수 없습니다' : '서버 오류가 발생했습니다'}

  <!-- 메시지: {typography.body-md} 16px/400 Pretendard, {colors.ink-mute} -->
  <p>
    {type === 'not-found'
      ? '요청하신 페이지가 존재하지 않거나 이동되었습니다.'
      : '잠시 후 다시 시도해주세요.'}

  <!-- 버튼 그룹 -->
  <div className="flex gap-2">
    {type === 'server-error' && reset &&
      {/* button-secondary-outline: 1px {colors.hairline-strong} border, {rounded.sm}(6px), {colors.ink} text */}
      <Button variant="outline" onClick={reset}> "새로고침"
    }
    {/* button-primary: {colors.primary}(#3ecf8e) bg, {colors.on-primary}(#171717) text — NOT white */}
    {/* {rounded.sm}(6px), {typography.button-md} 14px/500 Pretendard */}
    <Button variant="default" asChild>
      <Link href={homeHref}> "홈으로"

  <!-- 오류 ID: {typography.micro} 12px/400, {colors.ink-mute-2} -->
  {errorDigest &&
    <p> "오류 ID: {errorDigest}"
  }
```

## 8. Responsive

- `max-w-sm`으로 중앙 정렬 컨테이너.
- 모바일에서 버튼이 세로로 쌓이지 않도록 `flex gap-2` 유지 (두 버튼 모두 짧으므로 가로 배치 가능).
- 정확한 텍스트 크기(`text-8xl`) → ui-rules.md 참조.

## 9. Accessibility

- `<h1>` 에러 제목으로 페이지 제목 역할.
- "홈으로" 버튼: `aria-label="홈으로 이동"`.
- "새로고침" 버튼: `aria-label="페이지 다시 시도"`.
- `app/error.tsx` 파일은 Next.js 요구에 따라 `"use client"` 필수.

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| "홈으로" 클릭 | Button/Link click | `homeHref`(`/qa` 또는 `/login`)로 이동 |
| "새로고침" 클릭 | Button click | `reset()` 호출 → 동일 경로 재시도 |

## 11. Edge cases

- 미인증 상태에서 404/500 발생 → `homeHref="/login"` 으로 전달 (부모에서 인증 상태 판단).
- `app/error.tsx`에서 상위 layout 에러 시 GlobalHeader가 렌더링되지 않을 수 있음 → 최소 헤더 포함 fallback UI 처리는 layout 레벨 책임.
- `errorDigest`는 PRD §14 A-6 결정 전까지 기본 숨김.
- `reset` prop이 없는 경우(예: `not-found.tsx`) "새로고침" 버튼 렌더링 안 함.

## 12. Example usage

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <FallbackPage
      type="not-found"
      homeHref="/login"
    />
  );
}

// app/error.tsx ("use client")
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <FallbackPage
      type="server-error"
      reset={reset}
      homeHref="/qa"
      errorDigest={process.env.NODE_ENV === 'development' ? error.digest : undefined}
    />
  );
}
```

## 13. Cross-refs

- 화면 구조 → `docs/v1/structure.md` SC-09
- Next.js Error Boundary → `docs/v1-paper-prd.md §12.4` (paper export 변환 체크리스트)
- 상태 정의 → `docs/v1-paper-prd.md §7 SC-09 §6`
