# logos-rag · v1 문서 시스템

> paper.design MCP / Claude Code / 디자이너 / 백엔드 협업을 위한 v1 단일 진실 원천.

| 항목 | 값 |
|---|---|
| **버전** | v1 (phase-03 auth UI + phase-04 quota UI) |
| **재구성 시점** | 2026-05-27 |
| **소스 문서** | `docs/v1-paper-prd.md` (2572줄), `docs/v1-design-prd.md` (1067줄) — 보존 (legacy 원본) |
| **출력** | `docs/v1/**` — 7 영역 41 파일 (7607줄) |
| **1차 소비자** | Claude Code (paper.design MCP 클라이언트), 본인 |
| **2차 소비자** | 향후 디자이너 / 협업 개발자 |

---

## 1. 문서 지도

```
docs/v1/
├── INDEX.md                          ← (현재 문서) 진입점
├── prd.md                            ← 비즈니스 로직 only
├── structure.md                      ← 9 화면 구조 (11블록 일관 형식)
├── design.md                         ← 시각 시스템 철학
├── ui-rules.md                       ← 정량 규칙 enum
├── flows/                            ← 사용자 여정 10건
│   ├── 00-overview.md
│   ├── signup-email.md
│   ├── login-email.md
│   ├── login-google.md
│   ├── password-reset.md
│   ├── verify-email-resend.md
│   ├── ask-question.md
│   ├── quota-exceeded.md
│   ├── sign-out.md
│   └── unauthenticated-access.md
├── components/                       ← 재사용 컴포넌트 18 + index
│   ├── 00-overview.md
│   ├── GlobalHeader.md / GlobalFooter.md
│   ├── QuotaBadge.md / UserMenu.md
│   ├── QuestionInput.md / AnswerBlock.md / VerseCard.md
│   ├── QuotaExceededBanner.md
│   ├── AuthTabs.md / EmailPasswordForm.md / GoogleOAuthButton.md
│   ├── PasswordResetLink.md / PasswordResetForm.md
│   ├── ResendEmailButton.md / CallbackLoader.md
│   ├── FallbackPage.md
│   └── FormFieldError.md / DisclaimerNote.md
└── database/
    └── draft-schema.md               ← Supabase 테이블 / RPC / RLS / API 스키마
```

---

## 2. 책임 분리 매트릭스 (중복 방지 규약)

| 영역 | 담당 문서 | 절대 다루지 않는 것 |
|---|---|---|
| 비즈니스 목표 · 페르소나 · JTBD · 스코프 · role · Open Questions | `prd.md` | UI · 시각 · DB |
| 9 화면의 페이지 계층 · 섹션 순서 · 컴포넌트 구성 · 반응형 · 상태 | `structure.md` | 시각 토큰 hex / px / ms · 컴포넌트 props (참조만) |
| **Design system 토큰 + primitive 컴포넌트** (color hex · radius px · typography scale · spacing · elevation · shadcn 매핑 · Do/Don't) | `design.md` | 사용 빈도 / 행동 규칙 |
| **행동 규칙 enum** (motion ms · CTA 사용 빈도 · sticky behavior · form interaction · modal · mobile · a11y · toast · loading · empty state 톤) | `ui-rules.md` | 시각 토큰 정의 (참조만) · 컴포넌트 정의 |
| 화면 간 흐름 시퀀스 (entry → action → API → state) | `flows/**` | 화면 내부 구조 · 컴포넌트 props |
| 도메인 컴포넌트 interface (props · variants · states · a11y) — design token 을 조합 | `components/**` | 화면 전체 레이아웃 · 시각 토큰 정의 |
| Supabase 테이블 · RPC · RLS · API 응답 schema · 에러 코드 · 환경 변수 | `database/draft-schema.md` | UI · 비즈니스 우선순위 |

각 문서는 다른 문서의 정보가 필요할 때 *참조*만 한다. 복붙 금지.

### design.md ↔ ui-rules.md 경계 (Supabase 디자인 채택 이후)

- `design.md` 가 **단일 진실 원천** — color hex / radius px / typography size / spacing 토큰 / elevation / primitive 컴포넌트 (button-primary, card-feature, text-input 등) 모두 여기서 정의.
- `ui-rules.md` 는 정량 *행동 규칙* 만 — `{component.button-primary}` 의 hover transition ms / sticky offset / CTA 사용 빈도 등 *어떻게 행동시킬지*.
- 시각 토큰 정의 (`{colors.primary}` = `#3ecf8e`) 는 design.md 에만, ui-rules.md 는 *참조*만.

---

## 3. 작업별 진입점

| 작업 | 1차 문서 | 2차 문서 |
|---|---|---|
| paper.design 캔버스에서 화면 그리기 | `structure.md` (해당 SC 섹션) | `design.md`, `ui-rules.md`, `components/`(해당 컴포넌트) |
| Claude Code 로 Next.js 16 컴포넌트 구현 | `components/<Name>.md` | `structure.md`(사용처), `flows/`(사용자 액션), `ui-rules.md` |
| 사용자 여정 / 상태 머신 디버깅 | `flows/<flow>.md` | `database/draft-schema.md`(API), `structure.md`(화면) |
| API / DB 스키마 설계 | `database/draft-schema.md` | `flows/`(호출 맥락), `prd.md`(비즈니스 규칙) |
| 디자이너 핸드오프 | `design.md` + `ui-rules.md` | `structure.md`(전체 화면 컨텍스트), `components/00-overview.md` |
| 신규 화면 추가 시 | `prd.md`(스코프 결정) → `structure.md` → `components/` → `flows/` → `database/` 순서로 갱신 | — |
| Open Questions / 결정 사항 추적 | `prd.md` §11 | — |

---

## 4. 화면 ↔ 문서 cross-ref

| 화면 ID | 화면명 | structure.md | components/ (주요) | flows/ | database/ |
|---|---|---|---|---|---|
| **SC-01** | QA 메인 | §SC-01 | QuestionInput, AnswerBlock, VerseCard, DisclaimerNote | `ask-question.md` | `POST /api/qa` |
| **SC-02** | QA · 일일 한도 초과 | §SC-02 | QuotaExceededBanner | `quota-exceeded.md` | `user_quota` (phase-04) |
| **SC-03** | 로그인 / 회원가입 | §SC-03 | AuthTabs, EmailPasswordForm, GoogleOAuthButton, PasswordResetLink | `signup-email.md`, `login-email.md`, `login-google.md` | Server Action signup/login |
| **SC-04** | OAuth / 매직링크 콜백 | §SC-04 | CallbackLoader | `login-google.md`, `signup-email.md` | `GET /auth/callback` |
| **SC-05** | 이메일 인증 안내 | §SC-05 | ResendEmailButton, DisclaimerNote | `verify-email-resend.md`, `signup-email.md` | Server Action resend |
| **SC-06** | 비밀번호 재설정 (2-step) | §SC-06 | PasswordResetForm, FormFieldError | `password-reset.md` | Server Action reset-* |
| **SC-07** | 전역 헤더 | §SC-07 | GlobalHeader, QuotaBadge, UserMenu | `sign-out.md`, `unauthenticated-access.md` | session, user_quota |
| **SC-08** | 전역 푸터 | §SC-08 | GlobalFooter, DisclaimerNote | — | — |
| **SC-09** | 404 / 500 폴백 | §SC-09 | FallbackPage | — | — |

---

## 5. 3-tier 컴포넌트 매핑 (shadcn primitive → design primitive → 도메인 wrapping)

| shadcn/ui primitive | design.md primitive | 도메인 wrapping (components/) | 사용 화면 |
|---|---|---|---|
| `<Card>` + `<Textarea>` + `<Button>` | `card-feature` + `text-area` + `button-primary` | `QuestionInput` | SC-01 |
| `<Card>` | `card-answer` (header/content/footer) | `AnswerBlock` | SC-01 |
| `<Card>` | `card-verse` | `VerseCard` | SC-01 |
| `<Alert variant="destructive">` | `alert-destructive` | `QuotaExceededBanner` | SC-02 |
| `<Tabs>` | `tabs-list` + `tabs-trigger` | `AuthTabs` | SC-03 |
| `<Input>` + `<Button>` | `text-input` + `button-primary` | `EmailPasswordForm` | SC-03 (signup/login 모드 분기) |
| `<Button variant="outline">` + SVG | `button-secondary-outline` | `GoogleOAuthButton` | SC-03 |
| `<Skeleton>` 또는 spinner | `skeleton` | `CallbackLoader` | SC-04 |
| `<Button>` + 카운트다운 | `button-primary` + `button-ghost` | `ResendEmailButton` | SC-05 |
| `<Input>` + `<Button>` (2-step) | `text-input` + `button-primary` | `PasswordResetForm` | SC-06 |
| `<Badge>` | `badge-default` / `badge-destructive` | `QuotaBadge` | SC-07 |
| `<DropdownMenu>` | `dropdown-menu` | `UserMenu` | SC-07 |
| sticky nav container | `nav-bar` | `GlobalHeader` | 전역 |
| 푸터 container | `footer` | `GlobalFooter` | 전역 |
| 단순 page container | display typography | `FallbackPage` | SC-09 |
| `<p>` | `{typography.caption}` `{colors.destructive}` | `FormFieldError` | 모든 폼 |
| `<p>` | `{typography.caption}` `{colors.ink-mute}` | `DisclaimerNote` | SC-01, SC-05, SC-08 |

**3-tier 책임 분리**:

1. **shadcn/ui primitive** (좌측) — React 컴포넌트 베이스. unstyled.
2. **design.md primitive** (가운데) — design token 으로 styled. 일반 (button-primary, card-feature, text-input). 도메인 무관.
3. **components/ 도메인 wrapping** (우측) — logos-rag 화면 전용 (QuestionInput, AnswerBlock, VerseCard). design primitive 를 *조합* 하여 도메인 의미를 가진 컴포넌트.

`structure.md` 는 shadcn/ui 원어휘 (좌측 1열) 로 화면을 기술 — 가독성과 paper.design 친화성을 위해. `components/**` 는 우측 도메인 컴포넌트 interface 를 정의하며 가운데 design primitive 를 참조한다.

---

## 6. 원본 PRD 보존 / 추적

- `docs/v1-paper-prd.md` (2572줄) · `docs/v1-design-prd.md` (1067줄) 는 **legacy 원본** 으로 보존한다.
- 신규 작업은 `docs/v1/**` 만 갱신한다.
- 두 원본은 v1 출시 후 archive 디렉토리로 이동 예정.
- 본 시스템이 두 원본을 어떻게 분할했는지는 §2 책임 분리 매트릭스 참조.

---

## 7. 컨벤션

- **언어** — 모든 문서 한국어.
- **마크다운** — 표 적극 활용. 산문 최소화.
- **컴포넌트 어휘** — shadcn/ui (Button / Card / Tabs / Input / Textarea / Alert / Badge / DropdownMenu / Skeleton / Toast / AlertDialog) + 본 시스템 wrapping 컴포넌트 (§5).
- **화면 ID** — `SC-01` ~ `SC-09` 고정.
- **flow 식별자** — 동사-목적어 케밥 (`ask-question`, `password-reset` 등).
- **컴포넌트 파일명** — PascalCase (`QuestionInput.md`).
- **링크** — 동일 디렉토리는 상대 경로 (`./QuestionInput.md`), 다른 디렉토리는 루트 기준 (`../components/QuestionInput.md`).

---

## 8. Design 채택 결정

- **디자인 언어**: Supabase 마케팅 디자인 채택 (단일 emerald accent · white-canvas · greyscale ladder · 6px button radius · 토큰 기반 명세).
- **한국어 환경 적응**: Pretendard (display/UI) + Inter (영문 verse 본문) 페어. Inter 와 메트릭 호환.
- **다크 모드**: `prefers-color-scheme: dark` 자동. `design.md` 의 light/dark 토큰 페어 정의. UI 토글 버튼 없음 (PRD §2.3 out-of-scope).
- **shadcn/ui 베이스 유지**: shadcn React primitive 위에 design token layer 매핑 (Tailwind theme variable 을 design token 으로 채움).
- **Single emerald commitment / White canvas commitment** — design.md "Don't" 섹션에 명시. 깨면 브랜드 파산.

자세한 시각 토큰 정의는 [`design.md`](./design.md), 행동 규칙은 [`ui-rules.md`](./ui-rules.md).
