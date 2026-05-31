# logos-rag · v1 Design System

> Supabase 디자인 언어 채택 (단일 emerald accent · white-canvas · greyscale ladder · 6px button radius · 토큰 기반 명세). 한국어 본문 환경에 맞춰 Pretendard 페어링. shadcn/ui primitive 위에 token layer 로 매핑.

## Overview

logos-rag 는 한국어 질문에 영문 성경 verse 를 근거로 답하는 RAG 도구다. 디자인은 **명료성 우선** 으로 엔지니어링한다. `{colors.canvas}` (pure white) 위에 `{colors.ink}` (`#171717` — near-black, never pure black) 텍스트, 단일 chromatic event 는 **emerald primary** (`{colors.primary}` — `#3ecf8e`). 나머지는 `#ededed` ~ `#171717` 사이 calibrated grey ladder.

타이포는 **Pretendard 500** (display) + **Inter** (영문 verse 본문 / 코드). display tier 는 negative letter-spacing 으로 humanist 글자형을 editorial 밀도로 당긴다. 대기 gradient 없음, full-bleed 사진 없음, 마케팅 다크 트랙 없음 — 브랜드는 white 에 commit.

logos-rag 의 "제품"은 dashboard 가 아니라 **한국어 답변 카드 + 영문 verse 카드 stack** 이다. SC-01 의 답변 영역이 Supabase 의 product mockup 자리를 차지한다 — 답변 자체가 브랜드의 argument.

**Key Characteristics:**
- Single emerald primary (`{colors.primary}` `#3ecf8e`) as the only chromatic event; everything else monochrome.
- White canvas across all 9 screens (SC-01 ~ SC-09); dark 토큰 페어는 `prefers-color-scheme: dark` 일 때 자동 적용.
- Pretendard 500 display + 400 body for 한국어; Inter 400 for 영문 verse 본문과 코드.
- Negative letter-spacing on display tier (`-1.92px` at 64px → `-0.42px` at 28px) for tightened 한글·영문 cadence.
- Tight 6px / 8px button radii — square-ish, technical, never pill-shaped.
- No photography, no illustration, no atmospheric gradient. Verse cards (영문) 와 answer card (한국어) 만이 페이지의 시각 hierarchy.
- Single emerald reserved for filled CTA + 잔여 한도 Badge dot; secondary actions are outline / ghost / link.
- `prefers-color-scheme: dark` 시 canvas 가 `{colors.canvas-night}` 로 invert; emerald 는 light/dark 양쪽 그대로 사용 (대비 OK).

## Colors

> **소스:** Supabase 마케팅 (`/`, `/database`, `/pricing`, `/partners/integrations`) 그대로 채택. logos-rag 9 화면에 일대일 매핑. 다크 모드는 system prefers-color-scheme 자동.

### Brand & Accent
- **Emerald** (`{colors.primary}` — `#3ecf8e`): 시그니처 CTA 색. Filled-button background, 잔여 한도 Badge dot, focus ring root. 한 viewport 당 하나의 filled emerald.
- **Emerald Deep** (`{colors.primary-deep}` — `#24b47e`): Pressed-state lift.
- **Emerald Soft** (`{colors.primary-soft}` — `#4ade80`): hover / 보조 액센트 (Toast success 등). 현재 v1 화면에서는 거의 미사용.
- **Destructive** (`{colors.destructive}` — `#dc2626`): SC-02 quota Alert, form error, FormFieldError. emerald 와 충돌 금지 — 같은 viewport 에 동시 표시 OK (의미 채널이 다름).
- **Destructive Deep** (`{colors.destructive-deep}` — `#991b1b`): Pressed / focus.

### Surface (Light · 기본)
- **Canvas** (`{colors.canvas}` — `#ffffff`): 기본 페이지 배경. 모든 9 화면 light 기본.
- **Canvas Soft** (`{colors.canvas-soft}` — `#fafafa`): alternating section band, verse card 그룹 배경 (필요 시).
- **Canvas Night** (`{colors.canvas-night}` — `#1c1c1c`): code 블록, dark 토큰 페어의 base. v1 화면에 코드블록 거의 없음 — 향후 docs 용.
- **Canvas Night Soft** (`{colors.canvas-night-soft}` — `#202020`): nested dark chrome.
- **Hairline** (`{colors.hairline}` — `#dfdfdf`): 1px border on cards, verse cards, table.
- **Hairline Strong** (`{colors.hairline-strong}` — `#c7c7c7`): outline button border, 강조 1px line.
- **Hairline Cool** (`{colors.hairline-cool}` — `#ededed`): 가장 fine chrome (divider, subtle bg).

### Surface (Dark · prefers-color-scheme: dark)
| Light token | Dark 페어 | hex |
|---|---|---|
| `{colors.canvas}` | `{colors.canvas-dark}` | `#0a0a0a` |
| `{colors.canvas-soft}` | `{colors.canvas-soft-dark}` | `#141414` |
| `{colors.hairline}` | `{colors.hairline-dark}` | `#2a2a2a` |
| `{colors.hairline-strong}` | `{colors.hairline-strong-dark}` | `#3a3a3a` |
| `{colors.hairline-cool}` | `{colors.hairline-cool-dark}` | `#1f1f1f` |

`{colors.primary}` emerald 는 light/dark 동일 (`#3ecf8e`). `{colors.destructive}` 도 동일.

### Text (Light)
- **Ink** (`{colors.ink}` — `#171717`): 기본 body 텍스트. near-black, never pure.
- **Ink Secondary** (`{colors.ink-secondary}` — `#212121`): body emphasis.
- **Ink Mute** (`{colors.ink-mute}` — `#707070`): secondary text, helper, verse 라벨 (book chapter:verse).
- **Ink Mute 2** (`{colors.ink-mute-2}` — `#9a9a9a`): tertiary text, similarity score 보조.
- **Ink Faint** (`{colors.ink-faint}` — `#b2b2b2`): disabled / placeholder.
- **On Primary** (`{colors.on-primary}` — `#171717`): emerald 버튼 위 텍스트 — **near-black, NOT white**. emerald 가 "lit surface with dark type" 으로 읽힘.
- **On Dark** (`{colors.on-dark}` — `#ffffff`): canvas-night surface 위 텍스트.
- **On Destructive** (`{colors.on-destructive}` — `#ffffff`): destructive 버튼 / Alert 위.

### Text (Dark 페어)
| Light token | Dark 페어 | hex |
|---|---|---|
| `{colors.ink}` | `{colors.ink-dark}` | `#ededed` |
| `{colors.ink-secondary}` | `{colors.ink-secondary-dark}` | `#d4d4d4` |
| `{colors.ink-mute}` | `{colors.ink-mute-dark}` | `#a3a3a3` |
| `{colors.ink-mute-2}` | `{colors.ink-mute-2-dark}` | `#737373` |
| `{colors.ink-faint}` | `{colors.ink-faint-dark}` | `#525252` |

`{colors.on-primary}` 는 light/dark 동일 (`#171717` — emerald 가 dark canvas 에서도 충분히 밝아 dark type 유지).

### 사용 빈도 enum
- 한 viewport 당 filled emerald CTA: **최대 1개**.
- 한 viewport 당 destructive: **최대 1개** (Alert 또는 Button).
- emerald + destructive 동시 표시: 허용 (의미 채널 다름).
- 액센트 purple/yellow/pink: **v1 미사용** (Supabase 에서는 chart/logo 한정 — logos-rag 에는 chart 없음).

## Typography

### Font Family

| Tier | Family | Fallback |
|---|---|---|
| Display / UI (한국어 메인) | **Pretendard Variable** | `'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif` |
| 영문 verse 본문 / 영문 inline | **Inter Variable** | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` |
| Code (rare in v1) | system mono | `ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace` |

**Pretendard** 는 한국 디자인 시스템 사실상 표준. Inter 와 x-height·메트릭 호환 우수 → 한국어 문장 안에 영문 단어가 섞여도 baseline 어긋남 최소.

**영문 verse 본문 (VerseCard 내부)** 만 Inter 강제 (`font-family: 'Inter', ...`). 그 외 한국어 답변·UI 는 Pretendard.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xxl}` | 64px | 500 | 1.1 | -1.92px | (v1 거의 미사용 — SC-09 큰 숫자에 한해) |
| `{typography.display-xl}` | 48px | 500 | 1.1 | -1.44px | SC-09 "404" / "500" 큰 숫자 |
| `{typography.display-lg}` | 36px | 500 | 1.15 | -0.72px | SC-03 / SC-05 / SC-06 페이지 타이틀 ("로그인", "이메일을 확인하세요" 등) |
| `{typography.display-md}` | 28px | 500 | 1.2 | -0.42px | SC-01 답변 카드 header 의 질문 재표시, SC-07 로고 wordmark |
| `{typography.heading-lg}` | 22px | 500 | 1.2 | 0 | SC-02 quota Alert 타이틀, SC-09 부제 |
| `{typography.heading-md}` | 18px | 500 | 1.4 | 0 | section sub-heading, SC-03 Tabs 라벨 |
| `{typography.body-lg}` | 18px | 400 | 1.55 | 0 | SC-01 한국어 답변 본문 (Pretendard) |
| `{typography.body-md}` | 16px | 400 | 1.5 | 0 | 기본 UI body, form label |
| `{typography.body-verse}` | 17px | 400 | 1.55 | -0.1px | **영문 verse 본문 (Inter)** — Pretendard body 와 시각적 무게 페어링을 위해 1px 크고 약간 tight |
| `{typography.button-md}` | 14px | 500 | 1.0 | 0 | 기본 버튼 라벨 |
| `{typography.caption}` | 13px | 400 | 1.45 | 0 | helper, verse 라벨 (book chapter:verse), 면책 |
| `{typography.micro}` | 12px | 400 | 1.45 | 0 | pill label, 잔여 한도 Badge ("18/20"), 푸터 fine print |
| `{typography.code}` | 14px | 400 | 1.5 | 0 | code block (v1 거의 미사용) |

### Principles
- **Weight 500 across display.** Mid-weight reads as engineered, not decorative. Weight 600+ 금지 (Pretendard 도 동일).
- **Negative tracking on display.** -1.92px @ 64px scaling proportionally down. 한글에서도 자간 좁혀 editorial 밀도. **17px 이하 (body / caption / micro) 에서는 적용 금지** — 한글 가독성 저하.
- **한국어 답변 = body-lg (18/1.55).** SC-01 답변 본문은 1줄 line-height 1.55 로 호흡 확보. 영문 verse 본문 = body-verse (17/1.55 Inter).
- **Weight ladder = 400 / 500 만 사용.** Pretendard 는 100~900 전부 있지만 본 시스템은 Display = 500, Body = 400. 600 이상 금지.

### Pretendard 운영 노트
- `Pretendard Variable` 단일 woff2 로 로드 (font-weight 100~900 가변).
- `font-feature-settings: "ss03"` 비활성 (Pretendard 기본 글리프 사용).
- Inter 와 동시 로드 시 `font-display: swap` 통일.

## Layout

### Spacing System
- **Base unit**: 8px (sub-tokens 2 / 4 / 12 for fine work).
- **Tokens**:

| Token | Value | 대표 사용 |
|---|---|---|
| `{spacing.xxs}` | 2px | Badge dot 간격, micro chip |
| `{spacing.xs}` | 4px | inline icon gap |
| `{spacing.sm}` | 8px | Button 내부 vertical padding, Card 간 sibling gap |
| `{spacing.md}` | 12px | Input 내부 horizontal padding, verse card 간 gap |
| `{spacing.lg}` | 16px | Card 내부 컨텐츠 gap, code block padding |
| `{spacing.xl}` | 24px | Card 내부 padding, 폼 필드 간 gap |
| `{spacing.xxl}` | 32px | feature card padding, section 내부 컨테이너 |
| `{spacing.huge}` | 64px | section vertical padding (marketing 톤) |

- **Section vertical padding**: 64–96px (`{spacing.huge}` ~ 96px) on marketing/auth surfaces. SC-01 QA 메인은 컨텐츠 페이지라 32–48px.
- **Card internal padding**: `{spacing.xxl}` (32px) on feature / answer card. `{spacing.xl}` (24px) on verse card (더 컴팩트).
- **Button padding**: `{spacing.sm} {spacing.lg}` (8px 16px) — 14px 라벨 기준.

### Grid & Container
- Marketing/auth 페이지: ~1280px 컨테이너 max-width, edge-bleed 없음.
- SC-01 QA 메인: ~720px reading-width 컨테이너 (답변·verse 가독성 우선).
- SC-03 auth: Card max-w-md (~448px) 단일 컨테이너 vertical center.
- Verse card list: 단일 컬럼 stack (1280px container 내부에서 width-clamped) — Supabase 의 2-up pricing 과 달리 logos-rag 는 verse 가 sequence 있으므로 1-up.

### Whitespace Philosophy
64–96px section padding + atmospheric gradient 없음 = white canvas 자체가 디자인. 한국어 답변 카드와 영문 verse 카드의 시각 weight 가 vacuum 안에서 두드러지도록 설계. Supabase 가 product mockup 으로 vacuum 을 채우는 방식과 동일한 자리에 logos-rag 는 *답변 콘텐츠* 를 둔다.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | Flat, 1px `{colors.hairline}` border | 기본 Card, verse card, Input, Textarea |
| 1 | `box-shadow: 0 1px 3px rgba(0,0,0,0.06)` | hover 시 약한 lift (verse card hover) |
| 2 | `box-shadow: 0 8px 24px rgba(0,0,0,0.08)` | DropdownMenu, Popover, Toast |
| 3 | `box-shadow: 0 16px 48px rgba(0,0,0,0.12)` | Modal / AlertDialog overlay |

### Decorative Depth
Supabase 가 product UI mockup stack 으로 깊이를 만든다면, logos-rag 는 **답변 카드 + verse card stack** 자체가 spatial hierarchy. 추가 chrome (border-only, shadow 없음) 로 충분. **Hero band 에 gradient / blur / atmospheric 효과 금지**.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Form inputs (옵션), hairline tags |
| `{rounded.sm}` | 6px | **Buttons (시그니처 button radius)**, code blocks, Badge, Input default, Textarea |
| `{rounded.md}` | 8px | Compact cards, Alert, DropdownMenu |
| `{rounded.lg}` | 12px | Feature card, answer card, verse card |
| `{rounded.xl}` | 16px | Modal dialog, large container chrome |
| `{rounded.full}` | 9999px | Pill tags, avatar (UserMenu trigger) |

### Photography Geometry
v1 사용 사진 / 일러스트 / 아이콘 외 이미지 **0개**. SC-07 로고는 텍스트 wordmark + emerald dot 만. Customer logo strip / 케이스 스터디 / hero photo 모두 v1 비목표.

## Components

> 아래는 shadcn/ui primitive 위에 design token 으로 매핑된 **일반 primitive component** 명세다. logos-rag 도메인 컴포넌트 (`QuestionInput`, `AnswerBlock`, `VerseCard` 등) 는 `components/**` 에서 이 primitive 들을 조합한다.

### Buttons

**`button-primary`** — 시그니처 CTA. shadcn `<Button variant="default">` 매핑.
- Background `{colors.primary}`, text `{colors.on-primary}` (near-black, **NOT white**), type `{typography.button-md}`, padding `{spacing.sm} {spacing.lg}` (8px 16px), rounded `{rounded.sm}` (6px).
- Pressed: `{colors.primary-deep}`.
- Focus: 2px solid `{colors.primary-deep}` outline + 2px offset.
- Disabled: `{colors.hairline-cool}` background, `{colors.ink-faint}` text.

**`button-secondary-outline`** — shadcn `<Button variant="outline">`.
- Background `{colors.canvas}`, text `{colors.ink}`, 1px solid `{colors.hairline-strong}` border, 동일 shape.
- Hover: background `{colors.canvas-soft}`.

**`button-ghost`** — shadcn `<Button variant="ghost">`.
- Background transparent, text `{colors.ink}`, no border, 동일 padding.
- Hover: background `{colors.hairline-cool}`.

**`button-link`** — text-only inline button. shadcn `<Button variant="link">`.
- Transparent background, text `{colors.ink}` in `{typography.button-md}`, no padding, persistent underline.

**`button-destructive`** — shadcn `<Button variant="destructive">`.
- Background `{colors.destructive}`, text `{colors.on-destructive}` (white), 동일 shape. v1 에서는 sign-out confirm 등 거의 미사용.

**`button-on-dark`** — code 블록 영역 / 다크 카드 위 CTA.
- Background `{colors.canvas-night}`, text `{colors.on-dark}`, 동일 shape.

### Cards & Containers

**`card-feature`** — 기본 흰 카드. shadcn `<Card>` 매핑.
- Background `{colors.canvas}`, padding `{spacing.xxl}` (32px), rounded `{rounded.lg}` (12px), 1px `{colors.hairline}` border.

**`card-answer`** — SC-01 답변 카드 (logos-rag 시그니처).
- 기본 `card-feature` 동일, 단 CardHeader 에 질문 재표시 + CardFooter 에 면책 `{typography.caption}` `{colors.ink-mute}`.

**`card-verse`** — SC-01 영문 verse 카드.
- Background `{colors.canvas}`, padding `{spacing.xl}` (24px), rounded `{rounded.lg}` (12px), 1px `{colors.hairline}` border.
- 내부 구조: 라벨 (`{typography.caption}` `{colors.ink-mute}`, 예: "John 3:16") → 영문 본문 (`{typography.body-verse}` Inter, `{colors.ink}`) → similarity score (`{typography.micro}` `{colors.ink-mute-2}`, default 숨김 토글로 노출).
- Hover: Level 1 shadow.

**`code-block`** — shadcn `<pre><code>` wrapping.
- Background `{colors.canvas-night}`, text `{colors.on-dark}` in `{typography.code}`, padding `{spacing.lg}` (16px), rounded `{rounded.sm}` (6px).

### Inputs & Forms

**`text-input`** — shadcn `<Input>`.
- Background `{colors.canvas}`, text `{colors.ink}`, type `{typography.body-md}`, padding `{spacing.sm} {spacing.md}` (8px 12px), rounded `{rounded.sm}` (6px), 1px `{colors.hairline}` border.
- Focus: 2px solid `{colors.primary}` ring, 2px offset.
- Error: 1px solid `{colors.destructive}` border + error helper in `{typography.caption}` `{colors.destructive}` below.
- Disabled: `{colors.canvas-soft}` background, `{colors.ink-faint}` text.
- Placeholder: `{colors.ink-faint}`.

**`text-area`** — shadcn `<Textarea>`. SC-01 질문 입력.
- 동일 토큰. min-height 96px (3줄), auto-grow to max-height 240px (10줄), resize:none.

**`tabs-list`** — shadcn `<TabsList>`. SC-03 로그인/회원가입 탭.
- Background `{colors.canvas-soft}`, padding `{spacing.xxs}` (2px), rounded `{rounded.sm}` (6px), inline-flex.

**`tabs-trigger`** — shadcn `<TabsTrigger>`.
- Active: background `{colors.canvas}`, text `{colors.ink}`, shadow Level 1.
- Inactive: background transparent, text `{colors.ink-mute}`.
- Type `{typography.heading-md}` (18px / 500).

**`alert-default`** — shadcn `<Alert>` neutral.
- Background `{colors.canvas-soft}`, text `{colors.ink}`, 1px `{colors.hairline}` border, rounded `{rounded.md}` (8px), padding `{spacing.lg}` (16px).

**`alert-destructive`** — shadcn `<Alert variant="destructive">`. SC-02 quota 초과 배너.
- Background `#fef2f2` (light) / `#3a1818` (dark), title `{colors.destructive}` + body `{colors.ink}`, 1px `{colors.destructive}` border, rounded `{rounded.md}` (8px).

**`badge-default`** — shadcn `<Badge>`. SC-07 잔여 한도 Badge.
- Background `{colors.canvas-soft}`, text `{colors.ink}` in `{typography.micro}` (12/400), padding `{spacing.xxs} {spacing.sm}` (2px 8px), rounded `{rounded.sm}` (6px). 잔여 한도 healthy 시 emerald dot `{colors.primary}` 옵션.

**`badge-destructive`** — quota = 0 시 Badge.
- Background `#fef2f2`, text `{colors.destructive}` in `{typography.micro}`, 동일 shape.

**`dropdown-menu`** — shadcn `<DropdownMenu>`. SC-07 UserMenu.
- Background `{colors.canvas}`, 1px `{colors.hairline}` border, rounded `{rounded.md}` (8px), shadow Level 2, padding `{spacing.xs}` (4px).
- `DropdownMenuItem`: padding `{spacing.sm} {spacing.md}` (8px 12px), text `{colors.ink}` in `{typography.body-md}`. Hover: background `{colors.canvas-soft}`. Destructive variant: text `{colors.destructive}`.

**`skeleton`** — shadcn `<Skeleton>`. SC-01 답변 로딩, SC-04 callback loader.
- Background gradient `{colors.canvas-soft}` ↔ `{colors.hairline-cool}` 1.4s pulse animation. Rounded `{rounded.sm}` (6px).

**`toast-default`** — shadcn `<Toast>`. 우상단.
- Background `{colors.canvas}`, 1px `{colors.hairline}` border, rounded `{rounded.md}` (8px), shadow Level 2, padding `{spacing.lg}` (16px).
- Type: title `{typography.heading-md}` `{colors.ink}`, description `{typography.body-md}` `{colors.ink-mute}`.

**`toast-error`** — destructive variant.
- 1px `{colors.destructive}` border, title `{colors.destructive}`. 동일 shape.

**`alert-dialog`** — shadcn `<AlertDialog>`. 사용 거의 없음 (sign-out confirm 정도).
- Backdrop: `rgba(0, 0, 0, 0.5)`.
- Container: background `{colors.canvas}`, rounded `{rounded.xl}` (16px), padding `{spacing.xxl}` (32px), shadow Level 3, max-w-md.

### Navigation

**`nav-bar`** — SC-07 전역 헤더. 라이트.
- Background `{colors.canvas}`, 1px `{colors.hairline}` bottom border, padding `{spacing.lg} {spacing.xl}` (16px 24px), height 64px sticky.
- Layout: 로고 (left) · primary nav (center, v1 비어 있음) · `{colors.primary}` dot Badge + `dropdown-menu` (right).

### Pills, Tags, Chips

**`pill-tag-soft`** — neutral pill.
- Background `{colors.canvas-soft}`, text `{colors.ink}` in `{typography.micro}`, padding `{spacing.xxs} {spacing.sm}` (2px 8px), rounded `{rounded.full}`.

### Signature Components

**Answer + Verse stack** — SC-01 의 시각 정체성. 단일 흰 카드 (한국어 답변) 위에 verse card 5개 stack. shadow 없음, hairline border 만. Supabase 의 product mockup stack 자리에 logos-rag 는 *콘텐츠 stack* 을 놓는다.

**`link-on-light`** — body 내 inline link.
- Text `{colors.ink}` in `{typography.body-md}`, persistent underline. Hover: text `{colors.primary-deep}`.

**`footer`** — SC-08 사이트 푸터.
- Background `{colors.canvas}`, text `{colors.ink-mute}` in `{typography.caption}` (13/400), padding `{spacing.huge} {spacing.xl}` (64px 24px), 1px `{colors.hairline}` top border.
- 단일 행: 면책 (좌) · GitHub link + 버전 (우).

## Do's and Don'ts

### Do
- `{colors.primary}` emerald 는 filled CTA 와 wordmark dot 에만. 한 viewport 1개.
- display tier 는 weight 500 + negative letter-spacing. 한글에서도 동일.
- button radius 는 `{rounded.sm}` (6px). 절대 pill 아님.
- answer card + verse card 는 `{rounded.lg}` (12px) container + 1px hairline + shadow 없음.
- emerald 버튼 위 텍스트는 `{colors.on-primary}` (near-black). white text 금지 — emerald 가 "lit surface with dark type" 으로 읽혀야 함.
- 한국어 본문 = Pretendard. 영문 verse 본문 = Inter (`{typography.body-verse}`).
- 다크 모드는 `prefers-color-scheme: dark` 자동. canvas/ink token 페어만 swap, emerald/destructive 그대로.

### Don't
- 추가 액센트 색 (purple / yellow / pink) 시스템 색으로 도입 금지.
- display weight 600+ 금지. 한글에서도 500 ceiling.
- pill-shaped button 금지. 시그니처는 6px square-ish.
- emerald 버튼 위 white text 금지 — near-black 강제.
- Hero / 인증 페이지에 gradient / atmospheric backdrop 금지. white canvas commitment.
- 사진 / 일러스트 / 종교 이미지 (십자가 등) 금지. v1 0개.
- verse card 에 shadow 금지. hairline border + hover 시에만 Level 1.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Wide | ≥ 1440px | Full 1280px container; verse card 단일 컬럼 유지 (720px clamp) |
| Desktop | 1024–1440px | Default content max-width; auth Card 448px center |
| Tablet | 768–1023px | nav-bar 로고 + Badge + UserMenu 만; section padding 32px |
| Mobile | < 768px | display tier 64 → 36px; full-width with 16px margin |

### Touch Targets
- 모든 버튼 ≥ 44 × 44px hit area (시각 height 36px + invisible padding 8px).
- Form fields ≥ 44px 시각 height on mobile.

### Collapsing Strategy
- Display tier stair-step: 64 → 48 → 36 → 28 → 22px.
- SC-01 답변 카드: desktop 720px → mobile full-width with `{spacing.lg}` 16px margin.
- SC-03 auth Card: desktop max-w-md center → mobile full-width with `{spacing.lg}` 16px margin.

### Image Behavior
v1 사진 0개. (Skeleton 은 placeholder 이지 image 아님.)

## Iteration Guide

1. 한 번에 한 컴포넌트만 작업. token 키 (`{component.button-primary}`, `{colors.primary}`) 로 참조.
2. 새 variant 가 필요하면 `-active`, `-focus`, `-error` suffix 로 separate entry.
3. `{token.refs}` 어디서나 사용 — inline hex 금지.
4. **Hover 명세 금지.** Default 와 Active/Pressed 만 명세. Focus 는 keyboard a11y 용.
5. Display = Pretendard 500 + negative tracking. Body = Pretendard 400 (한글) / Inter 400 (영문 verse). 경계 변경 금지.
6. Single emerald commitment 절대 깨지 말 것. 두 번째 brand color 도입 = 브랜드 파산.
7. White canvas commitment 절대 깨지 말 것. atmospheric gradient = 브랜드 파산.

## Known Gaps

- v1 화면 9개 외 영역 (admin / docs / status page) 의 토큰은 정의되지 않음. 등장 시 본 시스템 확장.
- Inter 와 Pretendard 의 한·영 메트릭 페어링은 production 검수 후 `{typography.body-verse}` letter-spacing 미세 조정 가능성.
- 다크 모드 토큰 페어는 light 기준 mechanical invert. 실 사용 후 verse card / answer card 의 hairline 강도 (dark 에서 약해 보일 가능성) 검수 필요.
- `{colors.destructive}` light/dark hex 동일 (`#dc2626`). dark canvas 에서 대비 검증 필요 — 필요 시 `{colors.destructive-on-dark}` (`#f87171`) 추가.
- v1 에 코드블록 거의 없음 — `code-block` / `button-on-dark` / `{typography.code}` 는 docs 페이지 추가 시점에 검수 재실행.
- Toast 동시 표시 최대 개수 / queue 처리는 ui-rules.md 의 행동 규칙 영역.
- AlertDialog 의 backdrop blur 강도는 production 측정 후 결정.

## shadcn/ui ↔ design token 매핑 (요약)

| shadcn primitive | design.md component | 핵심 token |
|---|---|---|
| `<Button variant="default">` | `button-primary` | `{colors.primary}` / `{rounded.sm}` |
| `<Button variant="outline">` | `button-secondary-outline` | `{colors.hairline-strong}` / `{rounded.sm}` |
| `<Button variant="ghost">` | `button-ghost` | transparent / `{rounded.sm}` |
| `<Button variant="link">` | `button-link` | `{colors.ink}` underline |
| `<Button variant="destructive">` | `button-destructive` | `{colors.destructive}` |
| `<Card>` | `card-feature` / `card-answer` / `card-verse` | `{rounded.lg}` / `{colors.hairline}` |
| `<Input>` | `text-input` | `{colors.hairline}` / `{rounded.sm}` |
| `<Textarea>` | `text-area` | 동일 |
| `<Tabs>` / `<TabsList>` / `<TabsTrigger>` | `tabs-list` / `tabs-trigger` | `{colors.canvas-soft}` / `{rounded.sm}` |
| `<Alert>` | `alert-default` / `alert-destructive` | `{rounded.md}` |
| `<Badge>` | `badge-default` / `badge-destructive` | `{rounded.sm}` / `{typography.micro}` |
| `<DropdownMenu>` | `dropdown-menu` | Level 2 shadow |
| `<Skeleton>` | `skeleton` | `{colors.canvas-soft}` ↔ `{colors.hairline-cool}` pulse |
| `<Toast>` | `toast-default` / `toast-error` | Level 2 shadow |
| `<AlertDialog>` | `alert-dialog` | Level 3 shadow / `{rounded.xl}` |

이 매핑이 `components/**` (도메인 wrapping) 의 베이스가 된다.
