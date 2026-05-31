# GlobalFooter

## 1. Purpose

모든 페이지 하단에 AI 답변 면책 문구, GitHub 링크, 버전 표기를 한 줄(또는 2행)로 고정 노출한다.

## 2. Used in

SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, SC-07, SC-08, SC-09

## 3. Design system 매핑

| Tier | 내용 |
|---|---|
| shadcn/ui | 없음 (네이티브 `footer` + `p` + `a` + `span`) |
| design primitive | `footer` — `{colors.canvas}` bg, 1px `{colors.hairline}` top border, `{spacing.huge}` (64px) vertical padding |
| 도메인 wrapping | `GlobalFooter` — `footer` primitive + `DisclaimerNote` + GitHub link + version |

**핵심 토큰**:
- 배경: `{colors.canvas}` (`{colors.canvas-dark}` dark 페어 자동)
- 상단 border: 1px `{colors.hairline}` (`{colors.hairline-dark}` dark 페어)
- 면책/텍스트: `{typography.caption}` (13px/400) Pretendard, `{colors.ink-mute}` (`{colors.ink-mute-dark}` dark 페어)
- vertical padding: `{spacing.huge}` (64px), horizontal: `{spacing.xl}` (24px)
- 다크 모드: canvas/hairline/ink-mute 토큰 페어 자동 swap

## 4. Props (interface)

```typescript
interface GlobalFooterProps {
  /** GitHub 저장소 URL (빌드 타임 상수 또는 환경 변수) */
  githubUrl?: string;
  /** 버전 표기 */
  version?: string;
}
```

| 이름 | 타입 | 기본값 | 필수 |
|---|---|---|---|
| `githubUrl` | `string` | `"https://github.com/<owner>/logos-rag"` | 아니오 |
| `version` | `string` | `"v1"` | 아니오 |

## 5. Variants

상태 변화 없음. 항상 동일한 `default` 상태.

## 6. States

| 상태 | 시각 | 동작 |
|---|---|---|
| `default` | 면책 문구 + GitHub 링크 + 버전 표기, `{typography.caption}` `{colors.ink-mute}` | 정적 |

## 7. Composition

```
<footer> (border-t {colors.hairline}, py-[{spacing.huge}=64px] px-[{spacing.xl}=24px])
  {/* bg: {colors.canvas}; dark: {colors.canvas-dark} */}
  <div> (max-w-2xl, mx-auto, flex flex-wrap, items-center, justify-between, gap-x-4, gap-y-1)
    <DisclaimerNote />
    {/* {typography.caption} 13px/400 Pretendard, {colors.ink-mute} */}
    <div> (flex items-center gap-x-2)
      <a href={githubUrl} target="_blank" rel="noopener noreferrer">  "GitHub"
      {/* {typography.caption} {colors.ink-mute} */}
      <span>  "·"
      <span>  {version}
```

## 8. Responsive

- 모바일: flex-wrap 으로 면책 문구가 첫 행, GitHub + 버전이 두 번째 행으로 내려올 수 있음.
- 데스크탑: 단일 행, justify-between으로 좌측 면책 / 우측 GitHub·버전.
- 정확한 gap/padding 수치 → ui-rules.md 참조.

## 9. Accessibility

- `<footer>` 시맨틱 태그 사용.
- GitHub 링크: `aria-label="logos-rag GitHub 저장소 (새 탭에서 열림)"`, `target="_blank"` 시 `rel="noopener noreferrer"`.
- 면책 문구는 정보 전달 텍스트이므로 `role="contentinfo"` 상속(footer 자동).

## 10. Interaction events

| 이벤트 | 트리거 | 결과 |
|---|---|---|
| GitHub 링크 클릭 | `a` click | 새 탭에서 GitHub 저장소 열기 |

## 11. Edge cases

- `githubUrl`이 미정인 경우 (PRD §14 C-1) → GitHub 링크를 `href="#"` 또는 숨김 처리.
- 면책 문구는 SC-QA 답변 카드 하단의 `DisclaimerNote`와 동일한 문자열을 공유한다.
- 인증 페이지(SC-03~SC-06)에서도 동일하게 렌더링된다 (minimal 헤더에 대응하는 minimal 푸터는 선택 — PRD §14 B-1).

## 12. Example usage

```tsx
<GlobalFooter
  githubUrl="https://github.com/pgaey/logos-rag"
  version="v1"
/>
```

## 13. Cross-refs

- 화면 구조 → `docs/v1/structure.md` SC-08
- 면책 문구 컴포넌트 → `DisclaimerNote.md`
- GitHub URL 최종 결정 → `docs/v1-paper-prd.md §14 C-1`
