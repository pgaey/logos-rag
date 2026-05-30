# VerseCard

## 1. Purpose

영문 성경 구절 1건을 라벨(Book Chapter:Verse), 영문 본문(font-serif), 선택적 유사도 점수와 함께 카드 형태로 표시한다.

## 2. Used in

SC-01 (AnswerBlock 내부, verse × 5)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Card` · `Badge` |
| design primitive | `card-verse` · `badge-default` (라벨) |
| 도메인 wrapping | `VerseCard` — `card-verse` 위에 book:chapter:verse 라벨 + 영문 본문 + 유사도 조합 |

**핵심 토큰**:
- card: `{colors.canvas}` bg, padding `{spacing.xl}` (24px), `{rounded.lg}` (12px), 1px `{colors.hairline}` border, **shadow 없음** (hover 시에만 Level 1 `0 1px 3px rgba(0,0,0,0.06)` — hover transition ms → ui-rules.md)
- 다크 모드: `{colors.canvas-dark}` bg, `{colors.hairline-dark}` border — hairline이 dark에서 약해 보일 가능성 있음 → production 검수 필요
- 라벨 (`badge-default`): `{typography.caption}` (13px/400), `{colors.ink-mute}`, `{rounded.sm}` (6px), `{colors.canvas-soft}` bg — 예: "Genesis 1:1"
- **영문 verse 본문: `{typography.body-verse}` (17px/400/lh1.55/-0.1px) — Inter 강제** (`font-family: 'Inter', ...`). Pretendard 사용 금지. `{colors.ink}`
- 유사도 점수 (showSimilarity=true): `{typography.micro}` (12px/400), `{colors.ink-mute-2}` — default 숨김
- 다크 모드: `{colors.ink-dark}` (verse text), `{colors.ink-mute-dark}` (label), `{colors.ink-mute-2-dark}` (similarity) 자동

## 4. Props (interface)

```typescript
interface VerseCardProps {
  verse_id: string;
  /** 책 이름 (예: "Genesis") */
  book: string;
  chapter: number;
  verse_number: number;
  /** 완성된 라벨 (예: "Genesis 1:1") */
  label: string;
  /** 영문 verse 본문 */
  text: string;
  /** 코사인 유사도 점수 (0~1) */
  similarity: number;
  /** 유사도 점수 노출 여부 (default false, ?debug=1 시 true) */
  showSimilarity?: boolean;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `verse_id` | `string` | — | ✅ |
| `book` | `string` | — | ✅ |
| `chapter` | `number` | — | ✅ |
| `verse_number` | `number` | — | ✅ |
| `label` | `string` | — | ✅ |
| `text` | `string` | — | ✅ |
| `similarity` | `number` | — | ✅ |
| `showSimilarity` | `boolean` | `false` | 아니오 |

## 5. Variants

```typescript
type VerseCardVariant =
  | 'default'      // 유사도 숨김
  | 'debug';       // showSimilarity=true, 유사도 점수 표시
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` | `card-verse`: `{colors.canvas}` bg, `{spacing.xl}` padding, `{rounded.lg}` border, 1px `{colors.hairline}`, shadow 없음. 상단 `badge-default` + Inter 본문 `{typography.body-verse}`. 유사도 숨김 | 정적 |
| `debug` | 동일 + 유사도 `{typography.micro}` `{colors.ink-mute-2}` 표시 | 정적 |
| `hover` | Level 1 shadow (`0 1px 3px rgba(0,0,0,0.06)`) — hover transition ms → ui-rules.md | 시각 피드백만 |

## 7. Composition

```
{/* card-verse: {colors.canvas} bg, {spacing.xl}(24px) padding, {rounded.lg}(12px), 1px {colors.hairline} border */}
{/* hover: Level 1 shadow — transition ms → ui-rules.md */}
<Card lang="en" role="article" aria-label="{label} 구절">
  <!-- 상단 바 -->
  <div className="flex items-center justify-between mb-2">
    {/* badge-default: {colors.canvas-soft} bg, {typography.caption} 13px/400, {colors.ink-mute}, {rounded.sm}(6px) */}
    <Badge variant="secondary">
      {label}   {/* "Genesis 1:1" */}
    {showSimilarity &&
      {/* {typography.micro} 12px/400, {colors.ink-mute-2} */}
      <span aria-label="유사도 {similarity.toFixed(2)}">
        {similarity.toFixed(2)}
    }

  <!-- 본문: {typography.body-verse} 17px/400/lh1.55/-0.1px — Inter 강제 (Pretendard 금지) -->
  <!-- {colors.ink} ({colors.ink-dark} dark 페어 자동) -->
  <p style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
     className="leading-[1.55] tracking-[-0.1px] line-clamp-4">
    {text}
```

`line-clamp-4`: 본문이 4줄을 초과하면 말줄임 처리. (선택: hover 시 전체 표시 — PRD §14 B-8 v1.5 이후)

## 8. Responsive

- 모바일: `AnswerBlock` 내에서 세로 스택 배치.
- 데스크탑: `AnswerBlock`이 제공하는 2-column grid 셀 안에 배치.
- 카드 자체는 너비 100% fill.
- 정확한 card padding / font size → ui-rules.md 참조.

## 9. Accessibility

- `Card`에 `role="article"` + `aria-label="{label} 구절"`.
- `Badge`의 텍스트(label)가 의미 자명 → 별도 aria-label 불필요.
- 유사도 점수 `span`: `aria-label="유사도 {similarity.toFixed(2)}"` (스크린 리더 맥락 제공).
- 영문 텍스트 `lang="en"` 속성으로 스크린 리더 언어 전환 안내.

## 10. Interaction events

v1에서 클릭 이벤트 없음. (펼침/접힘 인터랙션은 PRD §14 B-8 v1.5 이후)

## 11. Edge cases

- `text`가 매우 긴 경우(160자 이상) → `line-clamp-4`로 잘림. v1에서 전체 보기 UI 없음.
- `label` 형식이 `"Book Chapter:Verse"` 컨벤션을 따르지 않는 데이터가 들어오면 그대로 표시(포맷 강제 없음).
- `similarity`가 0 또는 1을 벗어나는 이상 값이 오더라도 그대로 렌더링 (데이터 보정은 서버 책임).
- `showSimilarity`가 false이면 유사도 span 자체를 DOM에서 제거 (`&&` 조건부 렌더링).

## 12. Example usage

```tsx
<VerseCard
  verse_id="uuid-1234"
  book="Genesis"
  chapter={1}
  verse_number={1}
  label="Genesis 1:1"
  text="In the beginning God created the heavens and the earth."
  similarity={0.87}
  showSimilarity={false}
/>
```

## 13. Cross-refs

- 사용 컨텍스트 → `AnswerBlock.md` (success 상태 내부)
- 유사도 토글 트리거 방식 → `docs/v1-paper-prd.md §14 B-3` (`?debug=1` vs 설정 토글)
- verse 인용 표기 컨벤션 → `docs/v1-design-prd.md §6.5`
- 페르소나 c 요구 → `docs/v1-paper-prd.md §1.3`
