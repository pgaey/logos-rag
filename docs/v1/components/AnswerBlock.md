# AnswerBlock

## 1. Purpose

SC-01 에서 질문 제출 결과(empty / loading / success / error)를 담당하는 답변 영역 전체를 렌더링한다. 한국어 AI 답변 본문, 영문 근거 verse 카드 5건, 면책 표기를 포함한다.

## 2. Used in

SC-01, SC-02(empty 상태 전용)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Card` · `CardHeader` · `CardContent` · `Skeleton` · `Alert` |
| design primitive | `card-answer` (success) · `skeleton` (loading) · `alert-destructive` / `alert-default` (error) |
| 도메인 wrapping | `AnswerBlock` — 4가지 state(empty/loading/success/error) 분기 렌더링 |

**핵심 토큰**:
- answer card (`card-answer`): `{colors.canvas}` bg, padding `{spacing.xxl}` (32px), `{rounded.lg}` (12px), 1px `{colors.hairline}` border, shadow 없음
  - 다크 모드: `{colors.canvas-dark}` bg, `{colors.hairline-dark}` border (hairline이 dark에서 약해 보일 가능성 → 검수 필요)
- 답변 본문: `{typography.body-lg}` (18px/400/lh1.55) Pretendard, `{colors.ink}`
- 질문 재표시 (CardHeader): `{typography.caption}` (13px/400), `{colors.ink-mute}`
- "근거 구절 · N건" heading: `{typography.caption}` (13px/400), `{colors.ink-mute}`
- skeleton: `{colors.canvas-soft}` ↔ `{colors.hairline-cool}` 1.4s pulse, `{rounded.sm}` (6px)
- alert-destructive (error): `#fef2f2` bg (dark: `#3a1818`), 1px `{colors.destructive}` border, `{rounded.md}` (8px)
- alert-default (no-results): `{colors.canvas-soft}` bg, 1px `{colors.hairline}` border, `{rounded.md}` (8px)
- "다시 시도" button: `button-secondary-outline` — `{colors.hairline-strong}` border, `{rounded.sm}` (6px)

## 4. Props (interface)

```typescript
interface AnswerBlockProps {
  /** 현재 답변 상태 */
  state: 'empty' | 'loading' | 'success' | 'error';
  /** 에러 유형 (state=error 시 사용) */
  errorType?: 'gemini-429' | 'gemini-other' | 'no-results' | 'network' | '401';
  /** 에러 메시지 (state=error 시 사용) */
  errorMessage?: string;
  /** 질문 텍스트 (state=success 시 답변 카드 헤더에 표시) */
  question?: string;
  /** AI 답변 본문 (state=success 시 필수) */
  answer?: string;
  /** Verse 카드 목록 (state=success 시 필수) */
  verses?: VerseData[];
  /** 한도 초과 빈 상태 메시지 교체 */
  emptyMessage?: string;
  /** "다시 시도" 핸들러 (state=error 시 사용) */
  onRetry?: () => void;
}

interface VerseData {
  verse_id: string;
  book: string;
  chapter: number;
  verse_number: number;
  label: string;
  text: string;
  similarity: number;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `state` | `'empty' \| 'loading' \| 'success' \| 'error'` | — | ✅ |
| `errorType` | `string` | `undefined` | 조건부 |
| `errorMessage` | `string` | `undefined` | 조건부 |
| `question` | `string` | `undefined` | 아니오 |
| `answer` | `string` | `undefined` | 조건부 |
| `verses` | `VerseData[]` | `[]` | 조건부 |
| `emptyMessage` | `string` | `"질문을 입력하면 성경 구절을 찾아 답변드립니다."` | 아니오 |
| `onRetry` | `() => void` | `undefined` | 조건부 |

## 5. Variants

```typescript
type AnswerBlockState =
  | 'empty'       // 질문 전 안내
  | 'loading'     // Skeleton + 로딩 라벨
  | 'success'     // 답변 카드 + VerseCard × 5
  | 'error';      // Alert(destructive 또는 default) + 재시도 CTA
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `empty` | `BookOpen` 아이콘(muted/40) + `emptyMessage` 텍스트, 중앙 정렬 | 정적 |
| `loading` | `Skeleton` × 3줄 + `Loader2` + "답변 생성 중... (5~15초 소요)", verse 영역 `Skeleton` × 5 | 최소 300ms 노출 |
| `success` | 답변 `Card` + "근거 구절 · 5건" 섹션 제목 + `VerseCard` × N + `DisclaimerNote` | 정적 |
| `error.gemini-429` | `Alert`(destructive) + "AI 서비스가 일시적으로 혼잡합니다..." + "다시 시도" `Button` | 클릭 재제출 |
| `error.gemini-other` | `Alert`(destructive) + "답변 생성 중 오류가 발생했습니다..." + "다시 시도" | 클릭 재제출 |
| `error.no-results` | `Alert`(default, `Search` 아이콘) + "관련 성경 구절을 찾지 못했습니다..." | "다시 시도" 없음 |
| `error.network` | `Alert`(destructive) + "네트워크 연결을 확인해주세요." + "다시 시도" | 클릭 재제출 |
| `error.401` | (자동 처리) Toast(destructive) + `/login` redirect — 이 컴포넌트는 렌더링되지 않음 | 부모 처리 |

## 7. Composition

```
<!-- empty -->
{/* ui-rules.md §Empty State: 아이콘 lucide {colors.ink-faint} + 텍스트만 */}
<div> (flex flex-col items-center justify-center gap-2, py-12, text-center)
  <BookOpen className="w-10 h-10" /> {/* color: {colors.ink-faint} */}
  <p> {emptyMessage}  {/* {typography.body-md} 16px/400 Pretendard, {colors.ink-mute} */}

<!-- loading -->
{/* skeleton: {colors.canvas-soft} ↔ {colors.hairline-cool} pulse, {rounded.sm} */}
<div> (space-y-4, aria-busy="true", aria-label="로딩 중")
  <div> (space-y-2)
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-[90%]" />
    <Skeleton className="h-4 w-[75%]" />
  <div> (flex items-center gap-2)
    <Loader2 aria-hidden="true" className="animate-spin w-4 h-4" /> {/* {colors.ink-mute} */}
    <p> "답변 생성 중... (5~15초 소요)"  {/* {typography.body-md} {colors.ink-mute} */}
  <div> (space-y-2)
    {[1,2,3,4,5].map(() => <Skeleton className="h-16 w-full" />)}

<!-- success -->
{/* card-answer: {colors.canvas} bg, {spacing.xxl}(32px) padding, {rounded.lg}(12px), 1px {colors.hairline} border, shadow 없음 */}
<div> (space-y-4)
  <Card>
    <CardHeader>
      {/* {typography.caption} 13px/400 Pretendard, {colors.ink-mute} */}
      <p> "Q: {question}"
    <CardContent>
      {/* {typography.body-lg} 18px/400/lh1.55 Pretendard, {colors.ink} */}
      <p className="whitespace-pre-wrap"> {answer}
  {/* {typography.caption} {colors.ink-mute} */}
  <h3> "근거 구절 · {verses.length}건"
  <div className="space-y-2">
    {verses.map(v => <VerseCard key={v.verse_id} {...v} />)}
  <DisclaimerNote />

<!-- error -->
{/* alert-destructive: #fef2f2 bg (dark: #3a1818), 1px {colors.destructive} border, {rounded.md}(8px) */}
{/* alert-default (no-results): {colors.canvas-soft} bg, 1px {colors.hairline} border */}
<Alert variant={errorType === 'no-results' ? 'default' : 'destructive'}>
  <AlertCircle | Search className="h-4 w-4" aria-hidden="true" />
  <AlertDescription> {errorMessage}
  {onRetry && errorType !== 'no-results' &&
    {/* button-secondary-outline: {colors.hairline-strong} border, {rounded.sm}(6px) */}
    <Button variant="outline" size="sm" onClick={onRetry}> "다시 시도"
  }
```

## 8. Responsive

- `loading` Skeleton 너비: 100% / 90% / 75% 순서로 시각적 자연스러움 연출.
- verse 카드 영역: 모바일 세로 스택(`space-y-2`), 데스크탑 2-column grid 옵션 (`grid-cols-2`). 정확한 breakpoint → ui-rules.md.
- 답변 카드 본문 `whitespace-pre-wrap` 으로 줄바꿈 보존.

## 9. Accessibility

- `loading` 상태: `role="status"` + `aria-live="polite"` on 로딩 컨테이너.
- `error` 상태: `Alert`의 `role="alert"`.
- `success` 상태: 답변 카드가 렌더링되면 포커스를 첫 번째 카드로 이동 (`autoFocus` 또는 `useEffect`).
- "다시 시도" 버튼: `aria-label="답변 다시 시도"`.

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| "다시 시도" 클릭 | `Button` click | `onRetry()` 호출 → 부모에서 재제출 |
| `state` 변화 | 부모 상태 갱신 | empty → loading 시 fade-out → fade-in (300ms 최소) |

## 11. Edge cases

- `answer`가 빈 문자열이면 `success` 상태여도 본문 없이 verse 카드만 표시.
- `verses.length === 0`이면 "근거 구절" 섹션 숨김.
- 응답 15초 초과 시 부모에서 `state='error'` + `errorType='gemini-other'` 로 강제 전환 (타임아웃 처리는 부모 책임).
- verse 텍스트가 매우 길 경우 `VerseCard` 내에서 `line-clamp-4` 처리 (VerseCard.md 참조).

## 12. Example usage

```tsx
// 로딩 중
<AnswerBlock state="loading" />

// 성공
<AnswerBlock
  state="success"
  question="하나님이 세상을 만든 이야기 알려줘"
  answer="창세기 1장 1절은..."
  verses={[{ verse_id: '...', label: 'Genesis 1:1', text: 'In the beginning...', similarity: 0.87, ... }]}
/>

// 에러
<AnswerBlock
  state="error"
  errorType="gemini-other"
  errorMessage="답변 생성 중 오류가 발생했습니다."
  onRetry={handleRetry}
/>
```

## 13. Cross-refs

- Verse 카드 → `VerseCard.md`
- 면책 표기 → `DisclaimerNote.md`
- 한도 초과 빈 상태 → `QuotaExceededBanner.md` (배너) + 본 컴포넌트의 `emptyMessage` prop
- 상태 정의 → `docs/v1-paper-prd.md §7 SC-01 §6`
- API 응답 스키마 → `docs/v1-paper-prd.md §7 SC-01 §11`
