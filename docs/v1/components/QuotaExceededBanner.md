# QuotaExceededBanner

## 1. Purpose

SC-02 상태에서 질문 입력 블록 위에 삽입되어, 당일 한도 초과 사실과 자정 KST 초기화 시각을 사용자에게 명확히 전달한다.

## 2. Used in

SC-02 (SC-01의 sub-state, `/api/qa` 429 응답 수신 후 인라인 전환)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Alert` · `AlertTitle` · `AlertDescription` |
| design primitive | `alert-destructive` 계열 (amber 톤 커스텀) |
| 도메인 wrapping | `QuotaExceededBanner` — `alert-destructive` 형태에 amber 배경 + Clock 아이콘 + 한도 초과 카피 |

**핵심 토큰**:
- 배경: amber soft (`#fef9c3` 또는 `bg-amber-50`) light, dark 시 `bg-amber-950/20` (design.md `alert-destructive` 패턴 참조)
- 아이콘: `{colors.destructive}` 계열 amber (`text-amber-600`)
- border: amber 계열 (`border-amber-300`)
- 타이틀: `{typography.heading-lg}` (22px/500) Pretendard, `{colors.ink}`
- 설명: `{typography.body-md}` (16px/400) Pretendard, `{colors.ink}`
- `{rounded.md}` (8px), padding `{spacing.lg}` (16px)
- 다크 모드: `bg-amber-950/20` 자동. amber 계열은 `prefers-color-scheme: dark` 에서 대비 검증 권장

## 4. Props (interface)

```typescript
interface QuotaExceededBannerProps {
  /** 자정 초기화 ISO8601 시각 (phase-04 구현 후 전달, 미전달 시 "한국 시각 자정(00:00 KST)" 문자열로 대체) */
  resetAt?: string;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `resetAt` | `string` (ISO8601) | `undefined` | 아니오 |

## 5. Variants

상태 변화 없음. 항상 동일한 `quota-exceeded` 상태로만 표시.

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `quota-exceeded` | `Alert` amber 톤 (border-amber-300, bg-amber-50/`{colors.canvas-soft}` light, bg-amber-950/20 dark), `Clock` 아이콘 `{colors.destructive}` 계열 amber, `AlertTitle` `{typography.heading-lg}` `{colors.ink}` + `AlertDescription` `{typography.body-md}` `{colors.ink}`, `{rounded.md}` | 정적 표시 |

## 7. Composition

```
<Alert
  variant="default"
  className="border-amber-300 bg-amber-50 dark:bg-amber-950/20"
>
  <Clock className="h-4 w-4 text-amber-600" />
  <AlertTitle>
    "오늘의 사용량을 모두 소진했습니다"
  <AlertDescription>
    "하루 20회 한도를 모두 사용했습니다. 한국 시각 자정(00:00 KST)에 초기화됩니다."
    {resetAt && <span> "({formattedResetAt} 이후)"</span>}
    <br />
    "내일 다시 질문해주세요. 더 많은 기능은 추후 업데이트될 예정입니다."
```

amber 색상은 PRD 명시 (§7 SC-02 §4). 시각 토큰 정의 → `design.md` `alert-destructive` 참조. 행동 규칙 → `ui-rules.md`.

## 8. Responsive

- 모바일·데스크탑 모두 전체 너비로 표시 (max-w-2xl 컨테이너 안).
- 줄바꿈은 자동 처리. 별도 breakpoint 대응 없음.

## 9. Accessibility

- `Alert` 컴포넌트의 `role="alert"` 기본 내장.
- `aria-live="assertive"` — 한도 초과는 즉시 주의를 끌어야 하므로 assertive.
- `Clock` 아이콘: `aria-hidden="true"` (텍스트가 의미 전달).

## 10. Interaction events

v1에서 클릭 이벤트 없음. (Badge 클릭 → 상세 모달은 PRD §5.7 v1 비목표)

## 11. Edge cases

- `resetAt`이 undefined이면 "한국 시각 자정(00:00 KST)" 고정 문구로 표시 (phase-03 임시).
- `resetAt`이 과거 시각이면 표시하지 않고 부모에서 SC-01 default 복귀 처리 (서버 quota 재확인).
- phase-03에서는 Gemini API 자체 429와 user_quota 429를 동일하게 처리 (PRD §14 C-4).

## 12. Example usage

```tsx
// phase-03 임시 (reset_at 없음)
<QuotaExceededBanner />

// phase-04 이후 (reset_at 포함)
<QuotaExceededBanner resetAt="2026-05-28T00:00:00+09:00" />
```

## 13. Cross-refs

- 화면 구조 → `docs/v1/structure.md` SC-02
- 한도 badge → `QuotaBadge.md` (variant=destructive 연동)
- 429 API 응답 스키마 → `docs/v1-paper-prd.md §7 SC-01 §11`
- 상태 정의 → `docs/v1-paper-prd.md §7 SC-02 §6`
