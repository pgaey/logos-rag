# ResendEmailButton

## 1. Purpose

SC-05(이메일 인증 안내)와 SC-06(비밀번호 재설정 완료 뷰)에서 인증/재설정 메일을 재전송하고, 전송 후 60초 쿨다운 카운트다운을 표시한다.

## 2. Used in

SC-05, SC-06 (step 1 완료 뷰)

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | `Button` |
| design primitive | `button-primary` (active) · `button-ghost` (cooldown disabled 처리) |
| 도메인 wrapping | `ResendEmailButton` — `button-primary` (emerald) + 60초 쿨다운 카운트다운 |

**핵심 토큰**:
- active (`button-primary` — **emerald CTA**, 화면당 1개 원칙): bg `{colors.primary}` (`#3ecf8e`), text `{colors.on-primary}` (near-black `#171717` — **white 금지**), `{typography.button-md}` (14px/500) Pretendard, `{rounded.sm}` (6px), `w-full`
  - pressed: `{colors.primary-deep}` (`#24b47e`)
- loading: `Loader2` spinner + `{colors.on-primary}` text, `disabled=true` — transition ms → ui-rules.md
- cooldown disabled: `{colors.hairline-cool}` bg, `{colors.ink-faint}` text, `cursor-not-allowed`
- 다크 모드: cooldown disabled bg `{colors.hairline-cool-dark}`, ink-faint `{colors.ink-faint-dark}` 자동; emerald 버튼 동일

## 4. Props (interface)

```typescript
interface ResendEmailButtonProps {
  /** 재전송 핸들러 (Server Action 호출) */
  onResend: () => Promise<void>;
  /** 쿨다운 초 (0이면 활성, 1~60이면 비활성) */
  cooldownSeconds?: number;
  /** 재전송 중 로딩 여부 */
  isLoading?: boolean;
  /** 활성 상태 버튼 텍스트 */
  activeLabel?: string;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `onResend` | `() => Promise<void>` | — | ✅ |
| `cooldownSeconds` | `number` | `0` | 아니오 |
| `isLoading` | `boolean` | `false` | 아니오 |
| `activeLabel` | `string` | `"인증 메일 재전송"` | 아니오 |

## 5. Variants

```typescript
type ResendButtonState =
  | 'active'    // 클릭 가능
  | 'loading'   // 재전송 API 호출 중
  | 'cooldown'; // 60초 대기 중
```

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `active` | `button-primary`: `{colors.primary}` bg, `{colors.on-primary}` (#171717 near-black — NOT white) text, `{rounded.sm}`, `{typography.button-md}`, `w-full` | 클릭 가능 |
| `loading` | `Loader2` (`aria-hidden="true"`) + 텍스트 유지, `disabled=true` | 클릭 차단 |
| `cooldown` | `disabled=true`, `{colors.hairline-cool}` bg, `{colors.ink-faint}` text, `cursor-not-allowed`, "재전송 가능 ({cooldownSeconds}초)" | 클릭 차단, 초 단위 카운트다운 |

## 7. Composition

```
{/* active: button-primary {colors.primary}(#3ecf8e) bg, {colors.on-primary}(#171717) text — NOT white */}
{/* cooldown: disabled → {colors.hairline-cool} bg, {colors.ink-faint} text */}
{/* {rounded.sm}(6px), {typography.button-md} 14px/500 Pretendard, w-full */}
<Button
  className="w-full"
  disabled={isLoading || cooldownSeconds > 0}
  onClick={handleResend}
  aria-live="polite"
>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
  {cooldownSeconds > 0
    ? `재전송 가능 (${cooldownSeconds}초)`
    : activeLabel
  }
```

쿨다운 카운트다운은 부모 컴포넌트(또는 내부 `useEffect`)에서 `setInterval`로 관리.

## 8. Responsive

- `w-full`로 카드 너비 전체를 채움.
- 모바일·데스크탑 동일.

## 9. Accessibility

- `disabled` 시에도 `aria-live="polite"` + 텍스트 변경으로 스크린 리더에 카운트다운 알림.
- 과도한 알림 방지: 카운트다운 초 변경마다 알림 대신 5초 단위 또는 0초 도달 시만 알림 고려.
- `isLoading` 시 `aria-busy="true"`.

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| 클릭 (`active` 상태) | Button click | `onResend()` 호출, `loading` 상태 전환 |
| 재전송 성공 | `onResend` resolve | `Toast`(default) "인증 메일을 재전송했습니다." + 쿨다운 60초 재시작 |
| 재전송 실패 | `onResend` reject | `Toast`(destructive) "메일 재전송에 실패했습니다." + `active` 복귀 |
| 쿨다운 0초 도달 | `setInterval` tick | 버튼 `active` 상태로 복귀, 텍스트 원복 |

## 11. Edge cases

- 페이지 새로고침 시 쿨다운 초기화 (v1 한정 — localStorage 저장은 PRD §14 B-7).
- `cooldownSeconds`가 음수이면 0으로 처리.
- 이미 인증된 이메일에 재전송 시 Supabase가 동일 응답을 반환하므로 UI에서는 성공으로 처리.
- SC-05와 SC-06에서 `activeLabel` prop만 다르게 전달하여 재사용.

## 12. Example usage

```tsx
// SC-05 이메일 인증 안내
<ResendEmailButton
  onResend={() => resendVerificationAction(email)}
  cooldownSeconds={cooldown}
  activeLabel="인증 메일 재전송"
/>

// SC-06 비밀번호 재설정 완료 뷰
<ResendEmailButton
  onResend={() => requestPasswordResetAction(email)}
  cooldownSeconds={cooldown}
  activeLabel="재설정 링크 재전송"
/>
```

## 13. Cross-refs

- SC-05 화면 → `docs/v1/structure.md` SC-05
- SC-06 step 1 완료 뷰 → `PasswordResetForm.md`
- 쿨다운 상태 정의 → `docs/v1-paper-prd.md §7 SC-05 §6`, `§7 SC-06 §6`
- Toast 컴포넌트 → shadcn/ui `Toast` (전역 Toaster에서 관리)
