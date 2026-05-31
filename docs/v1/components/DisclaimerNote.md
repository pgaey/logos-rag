# DisclaimerNote

## 1. Purpose

AI 답변이 신학적 권위를 갖지 않음을 면책하는 문구를 표시하는 공통 컴포넌트. SC-QA 답변 카드 하단과 GlobalFooter 두 곳에 동일 문자열로 고정 노출된다.

## 2. Used in

SC-01 (AnswerBlock success 상태 하단), SC-08 (GlobalFooter 내부)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | 없음 (네이티브 `<p>`) |
| design primitive | `{typography.caption}` + `{colors.ink-mute}` — INDEX.md §5 도메인 `<p>` 매핑 |
| 도메인 wrapping | `DisclaimerNote` — 면책 문구 단일 역할, 시각 토큰 고정 |

**핵심 토큰**:
- 텍스트 (`size='xs'`, 푸터): `{typography.micro}` (12px/400) Pretendard, `{colors.ink-mute}`
- 텍스트 (`size='sm'`, 답변 카드): `{typography.caption}` (13px/400) Pretendard, `{colors.ink-mute}`
- 다크 모드: `{colors.ink-mute-dark}` (`#a3a3a3`) 자동

## 4. Props (interface)

```typescript
interface DisclaimerNoteProps {
  /** 표시 위치에 따른 텍스트 크기 변형 */
  size?: 'xs' | 'sm';
  /** 추가 클래스 (위치별 여백 조정용) */
  className?: string;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `size` | `'xs' \| 'sm'` | `'xs'` | 아니오 |
| `className` | `string` | `""` | 아니오 |

## 5. Variants

```typescript
type DisclaimerSize = 'xs' | 'sm';
// 'xs' → footer 및 소형 표기용 (text-xs)
// 'sm' → 답변 카드 내 표기용 (text-sm)
```

## 6. States

상태 변화 없음. 항상 동일한 정적 텍스트.

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` (size=xs) | `{typography.micro}` 12px/400 Pretendard, `{colors.ink-mute}` (`{colors.ink-mute-dark}` dark 페어) | 정적 |
| `default` (size=sm) | `{typography.caption}` 13px/400 Pretendard, `{colors.ink-mute}` (`{colors.ink-mute-dark}` dark 페어) | 정적 |

## 7. Composition

```
{/* size='xs': {typography.micro} 12px/400 Pretendard, {colors.ink-mute} */}
{/* size='sm': {typography.caption} 13px/400 Pretendard, {colors.ink-mute} */}
{/* dark: {colors.ink-mute-dark} 자동 */}
<p className={cn(size === 'xs' ? '/* {typography.micro} */' : '/* {typography.caption} */', className)}>
  "이 답변은 AI가 생성하며 신학적 권위를 갖지 않습니다."
```

면책 문구는 컴포넌트 내 하드코딩 상수. PRD 단일 진실 원천에 따라 문자열 변경 시 이 파일만 수정.

## 8. Responsive

별도 반응형 처리 없음. 부모 컨테이너 너비를 따름.

## 9. Accessibility

- 순수 정보 텍스트. `role` 불필요.
- 색만으로 정보 전달하지 않음 (텍스트 자체가 의미 전달).
- `aria-hidden`은 사용하지 않음 — 면책 정보는 스크린 리더에도 전달되어야 함.

## 10. Interaction events

이벤트 없음. 순수 표시 컴포넌트.

## 11. Edge cases

- GlobalFooter에서는 `size="xs"`로, AnswerBlock 내에서는 `size="sm"`으로 사용하여 정보 위계 구분.
- 면책 문구 자체는 변경 불가 (PRD 합격 기준 §9.8 준수). 단, 문자열 수정이 필요하다면 이 컴포넌트 한 곳만 변경.

## 12. Example usage

```tsx
// GlobalFooter 내부 (xs)
<DisclaimerNote size="xs" />

// AnswerBlock success 하단 (sm)
<DisclaimerNote size="sm" className="mt-4" />
```

## 13. Cross-refs

- GlobalFooter 내 배치 → `GlobalFooter.md`
- AnswerBlock 내 배치 → `AnswerBlock.md`
- 면책 표기 정책 → `docs/v1-design-prd.md §6.1`
- 디자인 합격 기준 → `docs/v1-design-prd.md §9.8`
