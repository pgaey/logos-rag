# QuotaBadge

## 1. Purpose

헤더 우측에 인증 사용자의 잔여 일일 한도를 "N / 20" 형태로 표시하고, 한도 소진 시 destructive variant로 시각 경고를 전달한다.

## 2. Used in

SC-01, SC-02, SC-07

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Badge` · `Skeleton` |
| design primitive | `badge-default` (healthy) / `badge-destructive` (zero) / `skeleton` (loading) |
| 도메인 wrapping | `QuotaBadge` — 잔여 한도 상태에 따라 design primitive 분기 |

**핵심 토큰**:
- normal/near: `badge-default` — `{colors.canvas-soft}` bg, `{colors.ink}` text, `{typography.micro}` (12px/400), `{rounded.sm}` (6px)
- healthy (≥ 4): emerald dot `{colors.primary}` (`#3ecf8e`) 옵션 포함
- zero/exceeded: `badge-destructive` — `#fef2f2` bg (dark: `#3a1818`), `{colors.destructive}` text
- loading: `skeleton` — `{colors.canvas-soft}` ↔ `{colors.hairline-cool}` 1.4s pulse, `{rounded.sm}`
- 다크 모드: badge 배경/text 토큰 페어 자동 swap; emerald dot `{colors.primary}` 동일

## 4. Props (interface)

```typescript
interface QuotaBadgeProps {
  /** 잔여 사용 횟수 (phase-04 구현 전 undefined 가능) */
  remaining?: number;
  /** 전체 일일 한도 */
  total?: number;
  /** 데이터 로딩 중 여부 */
  loading?: boolean;
  /** phase-04 한도 초과 여부 (remaining === 0 과 별도 명시 가능) */
  exceeded?: boolean;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `remaining` | `number` | `undefined` | 아니오 |
| `total` | `number` | `20` | 아니오 |
| `loading` | `boolean` | `false` | 아니오 |
| `exceeded` | `boolean` | `false` | 아니오 |

## 5. Variants

```typescript
type QuotaBadgeState =
  | 'loading'      // Skeleton 표시
  | 'normal'       // secondary variant, 잔여 > 임계값
  | 'near'         // 잔여 3 이하 — amber 커스텀 (PRD §14 B-2 결정 전 secondary 폴백)
  | 'zero';        // destructive variant, "0 / 20"
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `loading` | `skeleton` `{rounded.sm}` (w-12 h-5, `{colors.canvas-soft}` ↔ `{colors.hairline-cool}` pulse) | — |
| `normal` | `badge-default`, `{colors.canvas-soft}` bg + emerald dot `{colors.primary}`, `{typography.micro}` "N / 20" | 정적 표시 |
| `near` | `badge-default` (dot 없음), `{typography.micro}` "N / 20" | 정적 표시 |
| `zero` / `exceeded` | `badge-destructive`, `{colors.destructive}` text, `{typography.micro}` "0 / 20" | 정적 표시 (SC-02 연동) |

## 7. Composition

```
<!-- loading 상태 -->
<Skeleton className="w-12 h-5 rounded-full" />

<!-- 그 외 상태 -->
<Badge variant={badgeVariant}>
  {remaining} / {total}
</Badge>
```

내부 로직: `remaining === undefined || loading` → `loading` 상태. `remaining === 0 || exceeded` → `zero`. `remaining <= 3` → `near`. 그 외 → `normal`.

## 8. Responsive

- 모바일(`sm` 미만): Badge 텍스트 표시 유지. 필요 시 아이콘(`Zap` 또는 `Flame`) + 숫자만으로 압축 — PRD §5.7(v1-design-prd) 참조. 정확한 기준 → ui-rules.md.
- 데스크탑: "N / 20" 전체 텍스트 표시.

## 9. Accessibility

- 색만으로 정보 전달 금지 — 반드시 숫자 병기 (PRD §6.7 준수).
- `aria-label="일일 사용량 {remaining} / {total}"` 으로 스크린 리더에 수치 전달.
- `loading` 상태에서 `aria-busy="true"`.

## 10. Interaction events

v1에서 클릭 이벤트 없음(PRD §5.7 "Badge 클릭 → 상세 모달 v1 비목표").

## 11. Edge cases

- `remaining`이 `undefined`이면 `Skeleton` 표시 (phase-03 한도 미구현 기간 대응).
- `total`이 20이 아닌 값으로 바뀌는 경우 (플랜 확장) prop으로 대응 가능.
- `/api/qa` 200 응답 후 `remaining` 값이 갱신되지 않으면 stale 상태 유지 — 부모 컴포넌트 책임으로 갱신.
- `exceeded=true`이면 `remaining`과 무관하게 destructive 표시.

## 12. Example usage

```tsx
// 정상 상태
<QuotaBadge remaining={17} total={20} />

// 로딩 중
<QuotaBadge loading={true} />

// 한도 초과
<QuotaBadge remaining={0} exceeded={true} />
```

## 13. Cross-refs

- 헤더 내 배치 → `GlobalHeader.md`
- 한도 초과 배너 → `QuotaExceededBanner.md`
- 잔여 한도 API → `docs/v1-paper-prd.md §8.2` (phase-04 GET `/api/quota`)
- 한도 상태 정의 → `docs/v1-paper-prd.md §9.3`
