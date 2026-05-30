# 컴포넌트 인벤토리 · 개요

> **Design system 채택**: Supabase 디자인 언어 (`design.md`) 기반. 단일 emerald primary (`{colors.primary}` `#3ecf8e`) · white canvas · greyscale ladder · 6px button radius · shadcn/ui primitive 위에 design token layer.

## 0. Design System 모델 (3-tier)

```
shadcn/ui primitive  →  design.md primitive  →  components/ 도메인 wrapping
(React 베이스 컴포넌트)    (design token으로 styled)   (logos-rag 화면 전용)
```

- **Tier 1 (shadcn/ui)**: `<Button>`, `<Card>`, `<Input>` 등 — unstyled React base.
- **Tier 2 (design primitive)**: `button-primary`, `card-verse`, `text-input` 등 — `design.md` 가 토큰으로 스타일 정의. `{colors.primary}`, `{rounded.sm}`, `{typography.button-md}` 등 참조.
- **Tier 3 (도메인 wrapping)**: `QuestionInput`, `AnswerBlock`, `VerseCard` 등 — design primitive 를 조합하여 logos-rag 화면 전용 의미를 가진 컴포넌트.

### Single emerald / White canvas commitment

- `{colors.primary}` emerald (`#3ecf8e`) 는 한 viewport 당 filled CTA 최대 1개. 추가 brand color 도입 금지.
- 모든 9화면 기본 배경 `{colors.canvas}` (white). atmospheric gradient 금지.
- emerald 버튼 위 텍스트 = `{colors.on-primary}` (near-black `#171717`) — **white 금지**.
- 다크 모드: `prefers-color-scheme: dark` 자동 적용. canvas/ink 토큰 페어 swap, emerald/destructive 동일.

### shadcn ↔ design primitive ↔ 도메인 컴포넌트 매트릭스

| shadcn/ui primitive | design.md primitive | 도메인 컴포넌트 | 사용 화면 |
|---|---|---|---|
| `<Card>` + `<Textarea>` + `<Button>` | `card-feature` + `text-area` + `button-primary` | `QuestionInput` | SC-01 |
| `<Card>` | `card-answer` | `AnswerBlock` | SC-01 |
| `<Card>` | `card-verse` (Inter `{typography.body-verse}`) | `VerseCard` | SC-01 |
| `<Alert variant="destructive">` | `alert-destructive` | `QuotaExceededBanner` | SC-02 |
| `<Tabs>` | `tabs-list` + `tabs-trigger` | `AuthTabs` | SC-03 |
| `<Input>` + `<Button>` | `text-input` + `button-primary` | `EmailPasswordForm` | SC-03 |
| `<Button variant="outline">` | `button-secondary-outline` | `GoogleOAuthButton` | SC-03 |
| `<Skeleton>` | `skeleton` | `CallbackLoader` | SC-04 |
| `<Button>` + 카운트다운 | `button-primary` | `ResendEmailButton` | SC-05 |
| `<Input>` + `<Button>` | `text-input` + `button-primary` | `PasswordResetForm` | SC-06 |
| `<Badge>` | `badge-default` / `badge-destructive` | `QuotaBadge` | SC-07 |
| `<DropdownMenu>` | `dropdown-menu` | `UserMenu` | SC-07 |
| sticky nav container | `nav-bar` | `GlobalHeader` | 전역 |
| 푸터 container | `footer` | `GlobalFooter` | 전역 |
| 단순 page container | display typography | `FallbackPage` | SC-09 |
| `<p>` | `{typography.caption}` `{colors.destructive}` | `FormFieldError` | 모든 폼 |
| `<p>` | `{typography.caption}` `{colors.ink-mute}` | `DisclaimerNote` | SC-01, SC-05, SC-08 |

자세한 3-tier 매핑 → `docs/v1/INDEX.md` §5.

## 1. 카테고리 매트릭스

| 컴포넌트 | 파일 | 카테고리 | shadcn/ui 베이스 |
|---|---|---|---|
| GlobalHeader | GlobalHeader.md | layout | `DropdownMenu` · `Badge` · `Button` · `Skeleton` |
| GlobalFooter | GlobalFooter.md | layout | (네이티브 `footer`) |
| QuotaBadge | QuotaBadge.md | shared | `Badge` · `Skeleton` |
| UserMenu | UserMenu.md | shared | `DropdownMenu` · `Button` |
| QuestionInput | QuestionInput.md | qa | `Textarea` · `Button` |
| AnswerBlock | AnswerBlock.md | qa | `Card` · `Skeleton` · `Alert` |
| VerseCard | VerseCard.md | qa | `Card` · `Badge` |
| QuotaExceededBanner | QuotaExceededBanner.md | qa | `Alert` |
| AuthTabs | AuthTabs.md | auth | `Tabs` · `Card` |
| EmailPasswordForm | EmailPasswordForm.md | auth | `Input` · `Button` · `Alert` · `Checkbox` |
| GoogleOAuthButton | GoogleOAuthButton.md | auth | `Button` |
| PasswordResetLink | PasswordResetLink.md | auth | (네이티브 링크) |
| ResendEmailButton | ResendEmailButton.md | auth | `Button` |
| CallbackLoader | CallbackLoader.md | auth | `Alert` |
| PasswordResetForm | PasswordResetForm.md | auth | `Input` · `Button` · `Alert` · `Card` |
| FallbackPage | FallbackPage.md | shared | `Button` |
| FormFieldError | FormFieldError.md | shared | (네이티브 `p`) |
| DisclaimerNote | DisclaimerNote.md | shared | (네이티브 `p`) |

---

## 2. 화면 × 컴포넌트 Cross-reference

| 화면 ID | 화면명 | 사용 컴포넌트 |
|---|---|---|
| **SC-01** | QA 메인 | GlobalHeader, GlobalFooter, QuotaBadge, UserMenu, QuestionInput, AnswerBlock, VerseCard, DisclaimerNote |
| **SC-02** | QA · 일일 한도 초과 | GlobalHeader, GlobalFooter, QuotaBadge, UserMenu, QuestionInput(disabled), QuotaExceededBanner, AnswerBlock(empty), DisclaimerNote |
| **SC-03** | 로그인 / 회원가입 | GlobalHeader(minimal), GlobalFooter(minimal), AuthTabs, EmailPasswordForm, GoogleOAuthButton, PasswordResetLink, FormFieldError |
| **SC-04** | OAuth/매직링크 콜백 | GlobalHeader(minimal), GlobalFooter(minimal), CallbackLoader |
| **SC-05** | 이메일 인증 안내 | GlobalHeader(minimal), GlobalFooter(minimal), ResendEmailButton, DisclaimerNote |
| **SC-06** | 비밀번호 재설정 (2-step) | GlobalHeader(minimal), GlobalFooter(minimal), PasswordResetForm, ResendEmailButton, FormFieldError |
| **SC-07** | 전역 헤더 | GlobalHeader, QuotaBadge, UserMenu |
| **SC-08** | 전역 푸터 | GlobalFooter, DisclaimerNote |
| **SC-09** | 404 / 500 폴백 | GlobalHeader, GlobalFooter, FallbackPage |

---

## 3. 컴포넌트 방향성

- **모든 컴포넌트는 3-tier (shadcn → design primitive → 도메인)** 모델로 구축한다. 별도 디자인 시스템 혼용 금지.
- **시각 토큰** (color, radius, typography, spacing) 은 `docs/v1/design.md` 단일 진실 원천. 컴포넌트 파일은 토큰 참조만 (`{colors.primary}`, `{rounded.sm}` 등). inline hex 금지.
- **행동 규칙** (hover ms, sticky offset, CTA 사용 빈도, focus ring 두께 등) 은 `docs/v1/ui-rules.md` 참조.
- **화면 전체 레이아웃** (페이지 `max-w-2xl` 컨테이너, sticky 헤더 배치 등) 은 `docs/v1/structure.md` 참조.
- **비즈니스 로직 / 페르소나** 는 `docs/v1-paper-prd.md` 및 `docs/v1-design-prd.md` 참조.
- **사용자 여정 / 시퀀스** 는 `docs/v1-paper-prd.md §5` flows 참조.

---

## 4. 카테고리 정의

| 카테고리 | 설명 |
|---|---|
| `layout` | 모든 화면에 공통으로 렌더링되는 최상위 뼈대 컴포넌트 |
| `auth` | 인증 화면 (SC-03 ~ SC-06) 전용 컴포넌트 |
| `qa` | QA 화면 (SC-01, SC-02) 전용 컴포넌트 |
| `shared` | 2개 이상의 카테고리에 걸쳐 재사용되는 컴포넌트 |
