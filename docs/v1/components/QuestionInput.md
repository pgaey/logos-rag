# QuestionInput

## 1. Purpose

SC-01 메인 화면에서 한국어 질문을 입력받고, Submit 버튼 또는 Cmd/Ctrl+Enter 단축키로 제출하는 입력 블록 전체를 담당한다.

## 2. Used in

SC-01, SC-02(disabled 상태)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Textarea` · `Button` |
| design primitive | `text-area` + `button-primary` |
| 도메인 wrapping | `QuestionInput` — `text-area` + `button-primary` (emerald) + 글자수 카운터 조합 |

**핵심 토큰**:
- Textarea (`text-area`): `{colors.canvas}` bg, `{colors.ink}` text, `{typography.body-md}` (16px/400) Pretendard, padding `{spacing.sm} {spacing.md}` (8px 12px), `{rounded.sm}` (6px), 1px `{colors.hairline}` border
  - focus: 2px solid `{colors.primary}` ring + 2px offset
  - disabled: `{colors.canvas-soft}` bg, `{colors.ink-faint}` text
  - placeholder: `{colors.ink-faint}`
- Submit button (`button-primary` — **emerald CTA**): bg `{colors.primary}` (`#3ecf8e`), text `{colors.on-primary}` (near-black `#171717` — **white 금지**), `{typography.button-md}` (14px/500), padding `{spacing.sm} {spacing.lg}` (8px 16px), `{rounded.sm}` (6px)
  - 이 화면의 한 viewport 당 filled emerald 1개 원칙 적용
  - pressed: `{colors.primary-deep}` (`#24b47e`)
  - disabled: `{colors.hairline-cool}` bg, `{colors.ink-faint}` text
- 글자수 카운터 (정상): `{typography.micro}` (12px/400), `{colors.ink-mute}`
- 글자수 카운터 (over-limit): `{colors.destructive}`
- 키보드 힌트: `{typography.micro}`, `{colors.ink-mute}`
- 다크 모드: canvas/hairline/ink 토큰 페어 자동 swap; emerald 버튼 동일

## 4. Props (interface)

```typescript
interface QuestionInputProps {
  /** 현재 질문 텍스트 */
  value: string;
  /** 텍스트 변경 핸들러 */
  onChange: (value: string) => void;
  /** 제출 핸들러 */
  onSubmit: () => void;
  /** 제출 중(비동기 처리 중) 여부 */
  isSubmitting?: boolean;
  /** 전체 입력 비활성화 (SC-02 한도 초과 상태) */
  disabled?: boolean;
  /** 한도 초과 시 교체될 placeholder */
  disabledPlaceholder?: string;
  /** 글자수 최대 제한 */
  maxLength?: number;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `value` | `string` | — | ✅ |
| `onChange` | `(value: string) => void` | — | ✅ |
| `onSubmit` | `() => void` | — | ✅ |
| `isSubmitting` | `boolean` | `false` | 아니오 |
| `disabled` | `boolean` | `false` | 아니오 |
| `disabledPlaceholder` | `string` | `"오늘 사용 가능한 질문 횟수를 모두 사용했습니다."` | 아니오 |
| `maxLength` | `number` | `500` | 아니오 |

## 5. Variants

```typescript
type QuestionInputState =
  | 'empty'        // 텍스트 없음, Submit disabled
  | 'typing'       // 텍스트 있음, Submit 활성
  | 'over-limit'   // 500자 초과, 글자수 destructive, Submit disabled
  | 'submitting'   // 비동기 처리 중, 모두 disabled
  | 'disabled';    // 한도 초과(SC-02), 모두 disabled
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `empty` | `text-area` 기본, 글자수 "0 / 500" `{colors.ink-mute}`, `button-primary` `disabled` (`{colors.hairline-cool}` bg) | 입력 대기 |
| `typing` | 글자수 실시간 `{colors.ink-mute}`, `button-primary` 활성 (`{colors.primary}` bg, `{colors.on-primary}` text) | 제출 가능 |
| `over-limit` | 글자수 `{colors.destructive}` ("501 / 500"), `button-primary` `disabled` | 입력 차단(경고만) |
| `submitting` | `text-area` `disabled` (`{colors.canvas-soft}` bg), `button-primary` `disabled` + `Loader2` 스피너, 텍스트 유지 | 재제출 방어 |
| `disabled` | `text-area` `disabled` (`{colors.canvas-soft}` bg, `{colors.ink-faint}` text), placeholder 교체, `button-primary` `disabled` | 입력 불가 |

## 7. Composition

```
<div> (space-y-2)
  {/* text-area: {colors.canvas} bg, 1px {colors.hairline} border, {rounded.sm}(6px) */}
  {/* focus: 2px solid {colors.primary} ring, offset 2px */}
  <Textarea
    id="question"
    rows={3}
    placeholder="한국어로 자유롭게 질문해주세요 (예: 하나님이 세상을 만든 이야기 알려줘)"
    {/* placeholder: {colors.ink-faint} */}
    value={value}
    onChange={...}
    onKeyDown={handleKeyDown}   {/* Cmd/Ctrl+Enter 감지 */}
    disabled={isSubmitting || disabled}
    maxLength={maxLength}
    aria-label="질문 입력"
    aria-describedby="char-count kbd-hint"
  />

  <div> (flex items-center justify-between)
    <!-- 좌측 -->
    {/* {typography.micro} 12px/400 Pretendard */}
    <span id="char-count" className={isOverLimit ? "{colors.destructive}" : "{colors.ink-mute}"}>
      {value.length} / {maxLength}

    <!-- 우측: button-primary (emerald, SC-01 viewport 당 1개) -->
    {/* bg {colors.primary}(#3ecf8e), text {colors.on-primary}(#171717 near-black — NOT white) */}
    {/* {rounded.sm}(6px), {typography.button-md} 14px/500, padding {spacing.sm}{spacing.lg} */}
    <Button
      type="submit"
      disabled={isEmpty || isOverLimit || isSubmitting || disabled}
      onClick={onSubmit}
    >
      {isSubmitting ? <Loader2 className="animate-spin mr-2" aria-hidden="true" /> : <Send className="mr-2" aria-hidden="true" />}
      "질문하기"

  <!-- 키보드 힌트 -->
  {/* {typography.micro} {colors.ink-mute} */}
  <p id="kbd-hint">
    "⌘+Enter 로 제출"
```

## 8. Responsive

- 모바일: Textarea가 소프트 키보드로 올라갈 때 레이아웃 스크롤 가능하도록 `min-h-screen` 없이 처리.
- 데스크탑: 자동 높이 확장(rows=3~max-rows=10, `resize=none`, `overflow-y-auto`).
- 정확한 rows 기준 → ui-rules.md 참조.

## 9. Accessibility

- `<Textarea>` 에 `aria-label="질문 입력"`.
- 글자수 span에 `aria-live="polite"` (실시간 갱신 알림, 과도한 알림 방지를 위해 throttle 고려).
- `over-limit` 상태에서 `aria-invalid="true"`.
- Submit `Button`: 텍스트 "질문하기"가 의미 자명하므로 별도 aria-label 불필요.
- 키보드: `Cmd/Ctrl+Enter` 단축키 제출. `Tab`으로 Textarea → Submit 이동.

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| 텍스트 입력 | `onChange` | `value` 갱신, 글자수 실시간 업데이트 |
| Cmd/Ctrl+Enter | `onKeyDown` | `!disabled && !isSubmitting && !isEmpty && !isOverLimit` 조건 충족 시 `onSubmit()` |
| Submit 클릭 | `Button` click | 동일 조건 충족 시 `onSubmit()` |

## 11. Edge cases

- 500자 초과 상태에서 Submit 클릭 → disabled로 자동 방어, 별도 처리 불필요.
- `isSubmitting` 중 Cmd+Enter 재시도 → onKeyDown에서 `isSubmitting` 체크로 무시.
- 줄바꿈 다수 입력 시 max-rows=10 이후 `overflow-y-auto` 스크롤.
- `value`가 공백만 있는 경우 — `value.trim().length === 0`을 isEmpty 기준으로 사용.
- `disabled=true`(SC-02) + `disabledPlaceholder` 조합으로 한도 초과 상태 명시.

## 12. Example usage

```tsx
<QuestionInput
  value={question}
  onChange={setQuestion}
  onSubmit={handleSubmit}
  isSubmitting={isPending}
  disabled={quotaExceeded}
/>
```

## 13. Cross-refs

- 화면 구조 → `docs/v1/structure.md` SC-01, SC-02
- 한도 초과 배너 → `QuotaExceededBanner.md`
- 제출 결과 표시 → `AnswerBlock.md`
- 상태 정의 → `docs/v1-paper-prd.md §7 SC-01 §6`
