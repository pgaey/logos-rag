# logos-rag v1 · UI Rules

> **책임**: *행동 규칙* enum 만 — motion ms, CTA usage, sticky/scroll behavior, form interaction, modal/dialog, mobile interaction, a11y, toast/loading queue, empty state 톤.
>
> **시각 토큰** (color hex / radius px / spacing px / typography size / elevation) 은 모두 [`design.md`](./design.md) 단일 진실 원천. 본 문서는 design token 을 *어떻게 행동시킬지* 만 다룬다.

---

## Motion

### Hover Transition

| 대상 | duration | easing | 비고 |
|---|---|---|---|
| Button (모든 variant) | `150ms` | `ease-in-out` | `transition-colors` |
| Link (`{component.link-on-light}`) | `150ms` | `ease-in-out` | `transition-colors` |
| Badge | `150ms` | `ease-in-out` | `transition-colors` |
| Card (`{component.card-verse}` hover) | `200ms` | `ease-in-out` | `transition-shadow` (Level 0 → Level 1) |

### Focus Ring

- 표시 전환: `150ms`
- 클래스: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- `ring` 크기 변화 애니메이션 금지 (bounce 방지)
- 트리거: `focus-visible` only (마우스 클릭 시 ring 미표시)

### 답변 영역 전환 (SC-01)

| 전환 | duration | easing |
|---|---|---|
| 이전 답변 fade-out (Skeleton 진입 전) | `150ms` | `ease-in` |
| Skeleton fade-in | `200ms` | `ease-out` |
| 답변 카드 fade-in (Skeleton → 결과) | `300ms` | `ease-out` |
| 최소 Skeleton 표시 시간 | `300ms` | — (깜빡임 방지) |

### Modal / Dialog (`{component.alert-dialog}`)

| 이벤트 | duration | easing |
|---|---|---|
| Backdrop fade-in | `200ms` | `ease-out` |
| Modal content slide-in | `200ms` | `ease-out` |
| Modal close (fade-out) | `150ms` | `ease-in` |

### Toast (`{component.toast-default}`, `{component.toast-error}`)

| 이벤트 | duration | easing |
|---|---|---|
| Toast slide-in (top-right 기준 우측에서) | `300ms` | `ease-out` |
| Toast auto-dismiss fade-out | `200ms` | `ease-in` |

### Skeleton (`{component.skeleton}`)

- 애니메이션: `animate-pulse` (Tailwind 기본, opacity 0.5 ↔ 1, 1.4s cycle — design.md `{component.skeleton}` 와 일치)
- shimmer 효과 금지 — `animate-pulse` 만 사용

### 금지 모션

- `bounce`, `spring`, `wiggle` 계열 easing 전면 금지
- Hover scale transform 금지 (Apple 식 `scale(0.95)` 도입 검토했으나 Supabase 톤상 미적용)
- 페이지 전환 애니메이션 금지 (Next.js 기본 동작 유지)
- 화면 진입 시 hero 슬라이드인 금지

---

## CTA Rules

### Primary CTA 수

- 한 viewport 안에 `{component.button-primary}` (filled emerald) **최대 1개**
- 같은 화면에 primary 2개 필요 시 → 하나를 `{component.button-secondary-outline}` 또는 `{component.button-ghost}` 로 강등
- design.md "한 viewport 당 filled emerald 최대 1개" 원칙과 일치

### Above-the-fold Primary CTA 위치

| 화면 | Primary CTA 위치 |
|---|---|
| SC-01 (QA) | Textarea 우측 하단 "질문하기" Button |
| SC-03 (LOGIN) | Tabs 내 각 탭 하단 Submit Button (탭당 1개) |
| SC-05 (VERIFY-EMAIL) | "인증 메일 재전송" Button |
| SC-06 step 1 (RESET-PWD) | "재설정 링크 보내기" Button |
| SC-06 step 2 | "비밀번호 변경" Button |
| SC-09 (FALLBACK) | "홈으로" Button |

### 색 충돌 금지

- `{component.button-primary}` + `{component.button-destructive}` 동일 행(flex row) 배치 금지
- `{component.button-destructive}` 는 단독 행 또는 `{component.button-secondary-outline}` 과만 쌍 배치
- `{component.button-primary}` + `{component.badge-destructive}` 동일 컨테이너 배치 OK (크기·역할 차별화로 위계 유지)

### Disabled 처리

- 조건 미충족 Submit: `disabled={true}` + Tailwind `disabled:cursor-not-allowed disabled:opacity-50`
- 로딩 중 Submit: `disabled={true}` + 내부 `Loader2 animate-spin w-4 h-4 mr-2`
- 버튼 텍스트 변경 금지 (텍스트 유지 + 스피너 추가만)

### Full-width 규칙

- 인증 카드 내부 모든 Submit Button: `w-full` 강제
- SC-01 Submit Button: full-width 금지 — Textarea 하단 우측 정렬

---

## Header (SC-07)

### Sticky 동작

| 속성 | 값 |
|---|---|
| scroll offset | `0px` — 즉시 sticky (스크롤 시작과 동시에 고정) |
| z-index | `z-50` |
| position | `sticky top-0` |

### 배경 / blur 전환

| 상태 | 처리 |
|---|---|
| 항상 (v1 단순화) | `bg-background/95 backdrop-blur-sm` + 1px `{colors.hairline}` bottom border |
| 투명 → 불투명 전환 없음 | v1 에서는 항상 semi-opaque 고정 |

### 잔여 한도 Badge 위치 / variant

| 인증 상태 | Badge 위치 | 컴포넌트 |
|---|---|---|
| AUTHENTICATED (≥ 4 남음) | 헤더 우측, UserMenu 좌측 | `{component.badge-default}` + emerald dot `{colors.primary}` |
| AUTHENTICATED (1~3 남음) | 동일 위치 | `{component.badge-default}` (dot 없음) |
| AUTHENTICATED (0) | 동일 위치 | `{component.badge-destructive}` |
| AUTHENTICATED (로딩 중) | `{component.skeleton} w-12 h-5` (Badge 자리표) | — |
| UNAUTHENTICATED | Badge 없음 → `{component.button-secondary-outline}` "로그인" | — |
| 모바일 `< sm` | Badge 숨김, UserMenu 트리거만 | — |

---

## Form 상호작용

### Focus Ring

| 속성 | 값 |
|---|---|
| 두께 | `ring-2` (2px) |
| 색 토큰 | `ring-{colors.primary}` (shadcn `--ring` = `{colors.primary}` 매핑) |
| 오프셋 | `ring-offset-2` (2px) |
| 트리거 | `focus-visible` only |
| Tailwind 클래스 | `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |

### 검증 메시지

- 표시 위치: Input 바로 아래 (`{component.form-field-error}`), 4px gap
- 트리거 시점: `onBlur` 또는 form submit 시도 시
- 색·typo: design.md `{typography.caption}` `{colors.destructive}`

### Error State 행동

| 상태 | 행동 |
|---|---|
| 인라인 에러 텍스트 | `{component.form-field-error}` 표시 |
| 에러 Input border | shadcn `data-[invalid]` 또는 className 로 1px `{colors.destructive}` 적용 |
| Alert (전체 폼 에러) | `{component.alert-destructive}` 상단 mount |
| 글자수 초과 카운터 | text 색을 `{colors.destructive}` 로 전환 |

### Submit 중 처리

- `disabled={isPending}` — Textarea / Input / Button 모두
- 폼 전체: `pointer-events-none` (또는 개별 disabled)
- 로딩 Button 내부: `Loader2 animate-spin w-4 h-4 mr-2`
- Textarea + Submit disabled 상태에서 Cmd+Enter 재제출 무시

---

## Button Hierarchy 사용 규칙

design.md 에 정의된 5개 variant 의 *사용 빈도 enum*.

| variant (design.md) | 사용 빈도 / 규칙 |
|---|---|
| `{component.button-primary}` | 화면당 최대 1개. above-the-fold. emerald filled. |
| `{component.button-secondary-outline}` | 화면당 최대 2개. primary 보조 / 비파괴 대안. |
| `{component.button-ghost}` | 화면당 최대 3개. 아이콘 버튼, 메뉴 트리거, 3순위 액션. |
| `{component.button-link}` | 인라인 텍스트 내 이동. 개수 제한 없음. |
| `{component.button-destructive}` | 화면당 최대 1개. 파괴적 액션 전용. v1 에서는 거의 미사용. |

### 크기 enum

| size | 시각 height | 사용 |
|---|---|---|
| `sm` | 32px | 헤더 보조 ("로그인"), Badge 근처 |
| `md` (default) | 36px | 일반 폼 submit |
| `lg` | 44px | full-width 주요 CTA (인증 폼) |
| `icon` | 36×36 | 헤더 UserMenu 트리거 |

---

## Modal Behavior

### 닫기 규칙

| 트리거 | 동작 |
|---|---|
| Escape 키 | 닫힘 (shadcn Radix 기본) |
| 외부 클릭 (overlay 클릭) | 닫힘 (shadcn Radix 기본) |
| 내부 X 버튼 | 닫힘 |
| 폼 제출 중 (`isPending`) | Escape / 외부 클릭 무시 (`closeOnOverlayClick={false}`) |

### Focus Trap

- shadcn `<AlertDialog>` 의 Radix `FocusTrap` 기본 동작 유지
- 모달 열림 시 첫 번째 focusable 요소로 자동 포커스
- 모달 닫힘 시 트리거 요소로 포커스 복귀

### 스크롤 잠금

- `{component.alert-dialog}` 열림 시: `overflow-hidden` on `<body>` (Radix 기본)
- `{component.dropdown-menu}` 열림 시: 스크롤 잠금 없음 (인라인 위치)

---

## Mobile Interaction

### Safe-area Padding

- bottom: `pb-[env(safe-area-inset-bottom)]` 또는 Tailwind 플러그인 `pb-safe`
- v1 최소 처리: `pb-4` (16px) 고정 fallback

### Sticky CTA 허용 화면

- SC-01 모바일 sticky 질문 입력 바: **default off** (v1)
- sticky CTA 허용 화면: 없음 (v1 범위)
- 검토: v1.5

### Tap Target 최소 크기

- 모든 인터랙티브 요소: 최소 `44 × 44px` 터치 영역
- Button size=sm (32px): `p-2` 패딩 보정 또는 size=md 로 업그레이드
- 아이콘 Button (36px): `p-2` 패딩으로 44px 터치 영역 확보

### 소프트 키보드

- Textarea 포커스 시 레이아웃 밀림 허용 — `min-h-screen` 금지
- `window.visualViewport` resize 이벤트 별도 처리 없음 (v1)

---

## Accessibility

### Focus Visible 강제

- 모든 인터랙티브 요소에 `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- shadcn 기본 ring 클래스 제거 금지

### aria-label 필수 enum

| 컴포넌트 | aria 처리 |
|---|---|
| 헤더 UserMenu 트리거 (User 아이콘 Button) | `aria-label="사용자 메뉴"` |
| 헤더 로고 Link | `aria-label="logos-rag 홈"` |
| 재전송 쿨다운 Button (disabled 중) | `aria-label="재전송 가능 (N초 후)"` |
| `Loader2 animate-spin` 아이콘 | `aria-hidden="true"` + 텍스트 동반 필수 |
| `MailCheck` / `BookOpen` 장식 아이콘 | `aria-hidden="true"` |
| Submit Button 로딩 중 `Loader2` | `aria-hidden="true"` |
| `{component.skeleton}` 컨테이너 | `aria-busy="true"` |

### 키보드 탐색 순서

| 화면 | Tab 순서 |
|---|---|
| SC-01 (QA) | 헤더 로고 → Badge → UserMenu → Textarea → Submit Button → verse 카드 |
| SC-03 (LOGIN) | 헤더 → Google Button → Tabs → 이메일 → 비번 → (회원가입: 비번 확인 → Checkbox) → Submit |
| SC-05 (VERIFY-EMAIL) | 헤더 → 재전송 Button → "다른 이메일" Link → "로그인 화면으로" Link |

### 대비 비율 (WCAG AA)

| 텍스트 유형 | 최소 비율 |
|---|---|
| 일반 본문 (`{colors.ink}` on `{colors.canvas}`) | 4.5:1 ✓ (`#171717` on `#ffffff` = 17.4:1) |
| 보조 텍스트 (`{colors.ink-mute}` on `{colors.canvas}`) | 4.5:1 ✓ (`#707070` on `#ffffff` = 4.83:1) |
| Large text (18pt+ / 14pt+ bold) | 3:1 |
| 에러 텍스트 (`{colors.destructive}` on `{colors.canvas}`) | 4.5:1 ✓ |
| `{colors.on-primary}` on `{colors.primary}` | 3:1 ✓ (`#171717` on `#3ecf8e` ≈ 7.5:1) |

### Screen Reader 전용 텍스트

- 클래스: `sr-only` (Tailwind)
- 사용처:
  - 글자수 카운터: `<span class="sr-only">{count}자 입력됨, 최대 500자</span>`
  - 쿨다운 카운트다운 라이브 리전: `aria-live="polite"`
  - Skeleton 컨테이너: `aria-busy="true"` + `aria-label="로딩 중"`

### 색만으로 정보 전달 금지

- 잔여 한도 Badge: 색(variant) + 숫자("0 / 20") 병기 — 색 단독 금지
- 에러 Input: border 색 + 인라인 텍스트 메시지 병기
- emerald dot Badge: dot + 숫자 병기

---

## Toast / Notification

### 위치

- Desktop: `top-right` 고정
- Mobile (`< sm`): `top-center` (shadcn Sonner 기본값)

### Duration

| type | 표시 시간 |
|---|---|
| success | `3000ms` |
| error / destructive | `5000ms` |
| info | `3000ms` |

### 동시 최대 표시 개수

- `3개` (shadcn Sonner 기본)
- 초과 시 오래된 것부터 dismiss

### Type ↔ 컴포넌트 매핑

| type | 컴포넌트 (design.md) | 사용처 |
|---|---|---|
| success | `{component.toast-default}` | 재전송 성공, 로그아웃 완료, 비번 변경 성공 |
| error | `{component.toast-error}` | 재전송 실패, 세션 만료 (`error.401`) |
| info | `{component.toast-default}` | (v1 미사용) |

---

## Loading

### Skeleton 사용 화면

| 화면 / 영역 | Skeleton 형태 |
|---|---|
| SC-01 답변 카드 영역 (submitting) | `{component.skeleton}` × 3줄 (`h-4 w-full`, `h-4 w-[90%]`, `h-4 w-[75%]`) |
| SC-01 verse 카드 영역 (submitting) | `{component.skeleton} h-16` × 5개 |
| SC-07 잔여 한도 Badge (데이터 로딩 중) | `{component.skeleton} w-12 h-5` |

### Spinner 사용 화면

| 화면 / 영역 | Spinner 형태 |
|---|---|
| SC-04 callback 로딩 | `Loader2 animate-spin w-6 h-6` color `{colors.ink-mute}` |
| 폼 Submit 중 Button 내부 | `Loader2 animate-spin w-4 h-4 mr-2` |
| UserMenu 로그아웃 중 | `Loader2 animate-spin w-4 h-4` |

### Spinner 단독 사용 금지

- Spinner + 텍스트 메시지 항상 동반
- SC-04: `Loader2` + "로그인 처리 중입니다..." `<p>` 필수 쌍

### 로딩 최소 표시 시간

| 대상 | 최소 표시 |
|---|---|
| SC-01 답변 Skeleton | `300ms` (깜빡임 방지) |
| SC-04 callback 로딩 | `0ms` — Route Handler 즉시 처리 시 사용자에게 안 보여도 OK |
| Button 내부 Spinner | `150ms` (서버 응답 전까지 유지) |

---

## Empty State

### 일러스트 금지

- SVG 일러스트, 이미지, 이모지 헤더 전면 금지
- 허용: lucide-react 아이콘 1개 (w-10 h-10, color `{colors.ink-faint}`) + 텍스트 + CTA (필요 시)

### Empty State 구성 enum

| 화면 | 아이콘 | 텍스트 | CTA |
|---|---|---|---|
| SC-01 답변 영역 (질문 전) | `BookOpen w-10 h-10` `{colors.ink-faint}` | "질문을 입력하면 성경 구절을 찾아 답변드립니다." | 없음 |
| SC-02 답변 영역 (한도 초과) | `BookOpen w-10 h-10` `{colors.ink-faint}` | "오늘은 더 이상 질문할 수 없습니다. 자정 이후 다시 시도해주세요." | 없음 |
| SC-09 404 | 없음 (display 숫자 "404"가 대체) | 제목 + 부제 | "홈으로" Button |
| SC-09 500 | 없음 (display 숫자 "500") | 제목 + 부제 | "새로고침" + "홈으로" |

### 톤 규칙

- 평서문. 호칭 없음 ("당신", "여러분" 금지)
- 종교적 단어 UI 카피에서 금지 (verse 본문 안의 내용은 별개)
- 에러 empty state: 원인 한 줄 + 다음 액션 한 줄 (총 2줄 이하)
- 회복 불가능한 상태에서도 긍정 어조 유지 ("다시 시도해주세요" 등)
