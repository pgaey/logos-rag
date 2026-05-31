# FormFieldError

## 1. Purpose

모든 폼(SC-03, SC-06)의 Input 필드 아래에 인라인 검증 에러 메시지를 표시하는 공통 컴포넌트다.

## 2. Used in

SC-03 (EmailPasswordForm 내부), SC-06 (PasswordResetForm 내부)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | 없음 (네이티브 `<p>`) |
| design primitive | `{typography.caption}` + `{colors.destructive}` — INDEX.md §5 도메인 `<p>` 매핑 |
| 도메인 wrapping | `FormFieldError` — 인라인 에러 텍스트 단일 역할, 시각 토큰 고정 |

**핵심 토큰**:
- 텍스트: `{typography.caption}` (13px/400) Pretendard, `{colors.destructive}` (`#dc2626`)
- 위치: Input 바로 아래, `{spacing.xs}` (4px) gap
- 다크 모드: `{colors.destructive}` light/dark 동일 (`#dc2626`) — dark canvas 에서 대비 검증 권장 (design.md Known Gaps)

## 4. Props (interface)

```typescript
interface FormFieldErrorProps {
  /** 에러 메시지 (null 또는 undefined이면 렌더링하지 않음) */
  message?: string | null;
  /** 에러 메시지를 연결할 Input의 id (aria-describedby용) */
  id?: string;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `message` | `string \| null` | `undefined` | 아니오 |
| `id` | `string` | 자동 생성 | 아니오 |

## 5. Variants

상태 변화 없음. `message`가 있으면 표시, 없으면 렌더링하지 않음.

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `visible` | `{typography.caption}` 13px/400 Pretendard, `{colors.destructive}` (`#dc2626`) — 에러 메시지 | 정적 |
| `hidden` | 렌더링 없음 (`null` 반환) | — |

## 7. Composition

```
{/* {typography.caption} 13px/400 Pretendard, {colors.destructive}(#dc2626) */}
{/* 위치: Input 바로 아래 {spacing.xs}(4px) gap */}
{message && (
  <p
    id={id}
    className="mt-1"  {/* mt-1 ≈ {spacing.xs} 4px */}
    role="alert"
    aria-live="polite"
  >
    {message}
  </p>
)}
```

`role="alert"` + `aria-live="polite"`: 에러 발생 시 스크린 리더 알림 (blur/submit 시점에 표시되므로 polite가 적합).

## 8. Responsive

별도 반응형 처리 없음. 부모 폼 필드 너비를 그대로 따름.

## 9. Accessibility

- `id`는 상위 Input의 `aria-describedby`에 연결. 예: `<Input aria-describedby="email-error" />` + `<FormFieldError id="email-error" message={emailError} />`.
- 에러 발생 시 Input에 `aria-invalid="true"` 추가는 상위 컴포넌트 책임.
- `role="alert"`: 표시될 때 즉시 스크린 리더가 읽음.

## 10. Interaction events

이벤트 없음. 순수 표시 컴포넌트.

## 11. Edge cases

- `message`가 빈 문자열(`""`)이면 `message` falsy로 처리하여 렌더링 안 함 (`message && ...`).
- `message`가 변경될 때 DOM에서 나타나므로 `aria-live="polite"`로 스크린 리더에 새 메시지 전달.
- 동일 필드에 여러 에러가 동시에 존재할 수 없음 — 우선순위는 부모 컴포넌트에서 결정하여 단일 `message`로 전달.

## 12. Example usage

```tsx
<div>
  <Label htmlFor="email">이메일</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!emailError}
    aria-describedby="email-error"
  />
  <FormFieldError id="email-error" message={emailError} />
</div>
```

## 13. Cross-refs

- SC-03 사용 컨텍스트 → `EmailPasswordForm.md`
- SC-06 사용 컨텍스트 → `PasswordResetForm.md`
- 인라인 에러 카피 목록 → `docs/v1-paper-prd.md §7 SC-03 §7.5`, `§7 SC-06 §7.5`
