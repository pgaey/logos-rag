# CallbackLoader

## 1. Purpose

SC-04 `/auth/callback` 경로에서 Route Handler가 토큰을 교환하는 동안 표시되는 폴백 로딩 UI. 에러 발생 시 에러 상태로 전환하여 사용자에게 안내를 제공한다.

## 2. Used in

SC-04

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Alert` · `AlertDescription` · `Button` |
| design primitive | `skeleton` 또는 spinner (loading) · `alert-destructive` (error) · `button-secondary-outline` ("돌아가기") |
| 도메인 wrapping | `CallbackLoader` — OAuth/매직링크 콜백 처리 중 로딩 + 에러 상태 표시 |

**핵심 토큰**:
- loading: `Loader2` spinner `{colors.ink-mute}` (w-6 h-6), 텍스트 `{typography.body-md}` `{colors.ink-mute}` Pretendard
- 로고 워드마크: `{typography.display-md}` (28px/500) Pretendard, `{colors.ink}`
- `alert-destructive` (error): `#fef2f2` bg (dark: `#3a1818`), 1px `{colors.destructive}` border, `{rounded.md}` (8px), `AlertCircle` `{colors.destructive}`
- "돌아가기" button: `button-secondary-outline` — `{colors.hairline-strong}` border, `{rounded.sm}` (6px)
- 다크 모드: ink-mute/destructive 토큰 페어 자동 swap

## 4. Props (interface)

```typescript
interface CallbackLoaderProps {
  /** 현재 콜백 처리 상태 */
  state?: 'loading' | 'error.code-expired' | 'error.code-invalid' | 'error.network';
  /** 에러 발생 시 추가 안내 (예: 쿠키 차단 안내) */
  extraHint?: string;
  /** 로그인 화면으로 돌아가기 경로 */
  loginHref?: string;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `state` | `string` | `'loading'` | 아니오 |
| `extraHint` | `string` | `undefined` | 아니오 |
| `loginHref` | `string` | `"/login"` | 아니오 |

## 5. Variants

```typescript
type CallbackState =
  | 'loading'              // default — 토큰 교환 중
  | 'error.code-expired'   // 인증 링크 만료
  | 'error.code-invalid'   // 무효 인증 요청
  | 'error.network';       // 네트워크/Supabase 오류
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `loading` | 로고 `{typography.display-md}` `{colors.ink}` + `Loader2` `{colors.ink-mute}` (animate-spin) + "로그인 처리 중입니다..." `{typography.body-md}` `{colors.ink-mute}` | 자동 처리 (사용자 노출 0~1초) |
| `error.code-expired` | `alert-destructive`: `#fef2f2` bg, 1px `{colors.destructive}` border, `{rounded.md}` + `AlertCircle` `{colors.destructive}` + 카피 + `button-secondary-outline` | 버튼 클릭 → `/login` |
| `error.code-invalid` | 동일 (`alert-destructive`) + 카피만 다름 | 동일 |
| `error.network` | 동일 + `extraHint` `{typography.micro}` `{colors.ink-mute}` | 동일 |

## 7. Composition

```
<div className="flex flex-col items-center gap-4 py-20" role="status" aria-live="polite">
  <!-- loading -->
  {state === 'loading' && <>
    {/* {typography.display-md} 28px/500 Pretendard, {colors.ink} */}
    <p> "logos-rag"
    {/* Loader2: {colors.ink-mute} — spinner ms → ui-rules.md */}
    <Loader2 className="animate-spin w-6 h-6" aria-hidden="true" />
    {/* {typography.body-md} 16px/400 Pretendard, {colors.ink-mute} */}
    <p> "로그인 처리 중입니다..."
  </>}

  <!-- error 상태들 -->
  {state?.startsWith('error') && <>
    {/* alert-destructive: #fef2f2 bg (dark:#3a1818), 1px {colors.destructive} border, {rounded.md}(8px) */}
    <Alert variant="destructive" className="max-w-sm">
      <AlertCircle className="h-4 w-4" aria-hidden="true" />
      <AlertDescription>
        {errorMessages[state]}
        {/* {typography.micro} 12px/400, {colors.ink-mute} */}
        {extraHint && <p className="mt-1">{extraHint}</p>}
    {/* button-secondary-outline: 1px {colors.hairline-strong} border, {rounded.sm}(6px) */}
    <Button variant="outline" asChild>
      <Link href={loginHref}> "로그인 화면으로 돌아가기"
  </>}
```

에러 카피 맵:
- `error.code-expired`: "인증 링크가 만료되었습니다. 다시 시도해주세요."
- `error.code-invalid`: "유효하지 않은 인증 요청입니다."
- `error.network`: "인증 처리 중 오류가 발생했습니다."

## 8. Responsive

- 뷰포트 수직 중앙 정렬 (`min-h-[50vh]` + flex 부모 처리는 페이지 레이아웃 담당).
- 모바일·데스크탑 동일.

## 9. Accessibility

- `loading` 상태: `role="status"` + `aria-live="polite"`.
- `error` 상태: `Alert`의 `role="alert"` 기본 내장.
- "로그인 화면으로 돌아가기" 버튼: 의미 자명.

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| "로그인 화면으로 돌아가기" 클릭 | Button/Link click | `loginHref`(`/login`)로 페이지 이동 |

## 11. Edge cases

- URL에 `code`나 `token_hash` 없이 직접 접근 → Route Handler가 `/login` redirect (이 컴포넌트 렌더링 전 처리).
- 쿠키 차단 환경 → `error.network` + `extraHint="브라우저의 쿠키 설정을 확인해주세요."`.
- `code`와 `token_hash` 동시 존재 → `code` 우선 처리 (Route Handler 담당).
- Google OAuth 취소(`?error=access_denied`) → Route Handler가 `/login` redirect (이 컴포넌트 표시 없음).
- 이미 로그인된 상태로 도달 → Route Handler가 `/qa` redirect.

## 12. Example usage

```tsx
// 정상 로딩
<CallbackLoader state="loading" />

// 토큰 만료 에러
<CallbackLoader
  state="error.code-expired"
  loginHref="/login"
/>

// 쿠키 차단 에러
<CallbackLoader
  state="error.network"
  extraHint="브라우저의 쿠키 설정을 확인해주세요."
/>
```

## 13. Cross-refs

- 화면 구조 → `docs/v1/structure.md` SC-04
- Route Handler → `docs/v1-paper-prd.md §3.1` (`app/auth/callback/route.ts`)
- 상태 정의 → `docs/v1-paper-prd.md §7 SC-04 §6`
- 클라이언트 상태 스키마 → `docs/v1-paper-prd.md §7 SC-04 §11`
