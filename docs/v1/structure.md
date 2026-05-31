# logos-rag v1 · 화면 구조 명세서 (structure.md)

> **이 문서의 책임**: 9 화면(SC-01 ~ SC-09) 각각의 실제 화면 구조를 구현 디테일 수준으로 기술한다.
> 비즈니스 목표·페르소나·JTBD → `v1-paper-prd.md` / 색 hex·폰트 패밀리·정확한 px·ms → `design.md` / `ui-rules.md` / 컴포넌트 내부 prop·variant → `components/*.md` / 사용자 여정 시퀀스 → `flows/*.md` / DB 스키마 → `database/`

| 항목 | 값 |
|---|---|
| **버전** | v1.0 |
| **작성일** | 2026-05-27 |
| **기준 문서** | `docs/v1-paper-prd.md` (§7 화면별 PRD 11블록 메인 소스) + `docs/v1-design-prd.md` (§5 Per-Screen Spec) |
| **베이스라인** | shadcn/ui (Radix + Tailwind) · Next.js 16 App Router |
| **화면 수** | 9 (SC-01 ~ SC-09) |

---

## 목차

- [공통 레이아웃 골격](#공통-레이아웃-골격)
- [공통 spacing rhythm 참조](#공통-spacing-rhythm-참조)
- [공통 컴포넌트 호출 매트릭스](#공통-컴포넌트-호출-매트릭스)
- [SC-01 · QA 메인](#sc-01--qa-메인)
- [SC-02 · QA · 일일 한도 초과](#sc-02--qa--일일-한도-초과)
- [SC-03 · 로그인 / 회원가입](#sc-03--로그인--회원가입)
- [SC-04 · OAuth / 매직링크 콜백](#sc-04--oauth--매직링크-콜백)
- [SC-05 · 이메일 인증 안내](#sc-05--이메일-인증-안내)
- [SC-06 · 비밀번호 재설정 (2-step)](#sc-06--비밀번호-재설정-2-step)
- [SC-07 · 전역 헤더](#sc-07--전역-헤더)
- [SC-08 · 전역 푸터](#sc-08--전역-푸터)
- [SC-09 · 404 / 500 폴백](#sc-09--404--500-폴백)

---

## 공통 레이아웃 골격

모든 페이지는 다음 3-layer 구조를 공유한다.

```
<html>
  <body>
    ├── <Header>  (SC-07 · sticky top-0 · z-50 · h-14)
    ├── <main>    (flex-1 · min-h-screen 또는 min-h-[calc(100vh-h-header-h-footer)])
    └── <Footer>  (SC-08 · border-t · py-4)
  </body>
</html>
```

### Header 변형

| 페이지 | Header 변형 |
|---|---|
| SC-01, SC-02 (`/qa`) | **full** — 로고 + Badge(잔여 한도) + DropdownMenu |
| SC-03 ~ SC-06 (인증 페이지) | **minimal** — 로고만 (우측 컨트롤 없음) |
| SC-09 (폴백) | **full** (렌더 가능한 경우) — 불가 시 minimal 자동 fallback |

### Main 영역 컨테이너

- QA 화면(SC-01, SC-02): `max-w-2xl mx-auto px-4 py-8`
- 인증 화면(SC-03 ~ SC-06): `flex items-center justify-center min-h-[calc(100vh-3.5rem-57px)] px-4`
- 폴백(SC-09): `flex items-center justify-center min-h-[calc(100vh-3.5rem-57px)] px-4`

### 페이지별 레이아웃 분류

| 분류 | 화면 | 특징 |
|---|---|---|
| **QA 레이아웃** | SC-01, SC-02 | 단일 컬럼 · max-w-2xl · 상단 타이틀 + 입력 + 답변 |
| **Auth 레이아웃** | SC-03, SC-04, SC-05, SC-06 | 뷰포트 수직 중앙 · Card(max-w-md) 단일 컨테이너 |
| **Fallback 레이아웃** | SC-09 | 뷰포트 중앙 · 텍스트 + CTA 최소 구성 |

---

## 공통 spacing rhythm 참조

> 구체적인 px 값은 `ui-rules.md` 에 위임. 이 섹션은 리듬의 상대적 규칙만 기술한다.

- **페이지 내부 수직 간격**: 섹션 간 > 컴포넌트 그룹 간 > 컴포넌트 내부 순서로 좁아지는 리듬
- **Card 내부 패딩**: Input 그룹이 포함된 Card 는 모든 면에 넉넉한 동일 패딩 (auth 화면 기준)
- **Input → 인라인 에러 메시지 간격**: Input 높이보다 작은 소형 간격
- **섹션 제목 → 컨텐츠 간격**: 섹션 제목과 첫 번째 컴포넌트 사이 소형 간격
- **Skeleton 줄 간격**: 실제 텍스트 줄 간격과 동일하게 맞춰 레이아웃 시프트 없도록
- **verse 카드 목록 간격**: 카드 간 여백 > 카드 내부 요소 간 여백

---

## 공통 컴포넌트 호출 매트릭스

| 컴포넌트 | SC-01 | SC-02 | SC-03 | SC-04 | SC-05 | SC-06 | SC-07 | SC-08 | SC-09 |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `Header` (SC-07) | full | full | minimal | minimal | minimal | minimal | — | — | full/minimal |
| `Footer` (SC-08) | O | O | O | O | O | O | — | — | O |
| `Card` | O | O | O | O | O | O | — | — | — |
| `Button` | O | O | O | O | O | O | O | — | O |
| `Input` | — | — | O | — | — | O | — | — | — |
| `Textarea` | O | O(disabled) | — | — | — | — | — | — | — |
| `Tabs` / `TabsList` / `TabsTrigger` | — | — | O | — | — | — | — | — | — |
| `Alert` | O | O | O | O | — | O | — | — | — |
| `Badge` | O | O(destructive) | — | — | — | — | O | — | — |
| `Skeleton` | O | — | — | — | — | — | O(quota) | — | — |
| `DropdownMenu` | — | — | — | — | — | — | O | — | — |
| `Separator` | — | — | O | — | O | — | — | — | — |
| `Checkbox` | — | — | O | — | — | — | — | — | — |
| `Toast` | O | — | — | — | O | O | O | — | — |
| `Loader2` 아이콘 | O | — | O | O | O | O | O | — | — |

---

## SC-01 · QA 메인

### 1. 화면 목적

사용자가 한국어로 질문을 입력하고 5~15초 내에 한국어 AI 답변 + 영문 근거 verse 카드 5건을 받는다.

### 2. 경로 / 레이아웃 파일

- **경로**: `/qa`
- **page 파일**: `app/qa/page.tsx` (Server Component · AUTHENTICATED 전용)
- **layout 파일**: `app/layout.tsx` (Header full + Footer 포함)
- **보호**: `middleware.ts` (proxy.ts) — 미인증 시 `/login` 307 redirect

### 3. 레이아웃 계층

```
app/layout.tsx
  └── <Header variant="full" />          ← SC-07 sticky top-0 h-14
  └── <main>
        └── <QAPage>                      ← max-w-2xl mx-auto px-4 py-8
              ├── 페이지 타이틀 블록
              ├── 질문 입력 블록
              └── 답변 영역
  └── <Footer />                          ← SC-08 border-t py-4
```

Main 영역은 `max-w-2xl mx-auto px-4` 로 중앙 정렬. Header(h-14) + Footer(py-4 + border = ~57px) 를 제외한 나머지 공간을 Main 이 채운다.

### 4. 섹션 순서

1. **페이지 타이틀 블록** — `h1` ("성경에서 답을 찾아보세요") + 부제 `p`
2. **질문 입력 블록** — `Textarea` + 하단 바 (글자수 카운터 + Submit `Button`)
3. **키보드 힌트** — `p.text-xs` ("⌘+Enter 로 제출") — Textarea 하단 우측 정렬
4. **답변 영역** — 상태에 따라 empty / loading / success / error 중 하나 렌더링

### 5. 컴포넌트 구성

#### 페이지 타이틀 블록

- `h1` (font-semibold) — "성경에서 답을 찾아보세요"
- `p` (text-muted-foreground · text-sm) — "한국어로 질문하면 AI가 성경 구절을 찾아 답변드립니다."

#### 질문 입력 블록

- `Textarea` (id=question · rows 시작 3줄 · 입력 시 최대 10줄까지 auto-grow · resize=none · overflow-y-auto)
  - placeholder: "한국어로 자유롭게 질문해주세요 (예: 하나님이 세상을 만든 이야기 알려줘)"
  - 500자 초과 시 `disabled` 해제 안 하고 글자수 카운터만 `text-destructive` 전환
- 입력 바 (Textarea 아래 · flex row · justify-between)
  - 좌측: `span` (text-sm · text-muted-foreground) — "47 / 500" 형식 글자수 카운터
  - 우측: Submit `Button` (variant=default · "질문하기" · 우측에 `Send` 아이콘)

#### 답변 영역 — empty 상태

- `div` (flex-col · items-center · gap-3 · py-16 · text-center)
  - `BookOpen` 아이콘 (text-muted-foreground/40)
  - `p` (text-muted-foreground · text-sm) — "질문을 입력하면 성경 구절을 찾아 답변드립니다."

#### 답변 영역 — loading 상태

- 로딩 라벨 행 (flex row · items-center · gap-2)
  - `Loader2` 아이콘 (animate-spin · text-muted-foreground)
  - `p.text-sm.text-muted-foreground` — "답변 생성 중... (5~15초 소요)"
- 답변 본문 Skeleton: `Skeleton` × 3줄 (100% / 90% / 75% 너비 · h-4 · gap-2 · animate-pulse)
- 근거 구절 영역 Skeleton: `Skeleton` × 5 (각 h-16 · w-full)

#### 답변 영역 — success 상태

- **답변 Card**
  - `CardHeader` — Q 라벨 + 질문 재표시 (`text-sm · text-muted-foreground · italic`)
  - `CardContent` — 한국어 답변 본문 (font-sans · whitespace-pre-wrap · leading-relaxed)
  - `CardFooter` — 면책 한 줄 (`text-xs · text-muted-foreground` — "이 답변은 AI가 생성하며 신학적 권위를 갖지 않습니다.")
- **근거 구절 섹션 헤더** — `h3` (text-sm · font-semibold · text-muted-foreground) — "근거 구절 · 5건"
- **verse 카드 목록** — `ul` (모바일: `space-y-2` · 데스크탑: `grid grid-cols-2 gap-3`)
  - 각 verse `Card` (variant=outline · p-3):
    - 상단 행 (flex · justify-between · items-start)
      - `Badge` (variant=secondary) — "Genesis 1:1" 형식
      - 유사도 `span` (text-xs · text-muted-foreground) — "0.87" · **기본 숨김** (`?debug=1` 또는 토글 시만 노출)
    - 본문 `p` (text-sm · font-serif · leading-relaxed) — 영문 verse 텍스트

#### 답변 영역 — error 상태

- `Alert` (variant=destructive · 아이콘=`AlertCircle`)
  - `AlertTitle` — 에러별 제목
  - `AlertDescription` — 에러 카피
  - (일부 에러) "다시 시도" `Button` (variant=outline · size=sm)
- `error.no-results` 한정: `Alert`(variant=default · 아이콘=`Search`)

### 6. 반응형 동작

- **모바일(~sm 미만)**: verse 카드 1열 세로 스택 (`space-y-2`) · Textarea rows=3 시작 · Submit 버튼 전체 너비 · 답변 Card 패딩 소형
- **태블릿(sm~lg)**: 단일 컬럼 유지 · verse 카드 1열 유지
- **데스크탑(lg 이상)**: verse 카드 `grid grid-cols-2 gap-3` 전환 · Textarea rows=3 유지 (auto-grow 동일)
- max-w-2xl 로 항상 중앙 정렬 — 화면이 넓어져도 컨텐츠는 고정 폭

### 7. sticky / scroll 동작

- **Header**: sticky top-0 (SC-07 기술)
- **질문 입력 바**: 기본 inline (sticky 없음 · v1 기본값 · A-5 Open Question)
- **infinite scroll**: 없음 (답변 최근 1건만 표시 · 히스토리 v1.5)
- **verse 카드 영역**: overflow 없음 · 5건 고정 표시
- 모바일에서 Textarea 포커스 시 소프트 키보드 올라옴 → `min-h-screen` 없이 처리해 레이아웃 스크롤 가능

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| `Textarea` | focus | border 포커스 ring 활성 |
| `Textarea` | 타이핑 | 글자수 카운터 실시간 갱신 · auto-grow (최대 10줄) |
| `Textarea` | 500자 초과 | 글자수 텍스트 `text-destructive` 전환 · Submit `disabled` |
| Submit `Button` | hover | 기본 shadcn hover 효과 |
| Submit `Button` | click | `submitting` 상태 진입 · 내부 `Loader2` 스피너 교체 · `disabled=true` · Textarea `pointer-events-none` |
| `Cmd/Ctrl+Enter` | keydown (Textarea 포커스) | Submit 동일 트리거 (submitting 상태 아닐 때만) |
| 답변 영역 | success 수신 | Skeleton fade-out → 답변 Card fade-in (shadcn 기본 전환) |
| "다시 시도" `Button` | click | 동일 질문 재제출 (마지막 질문 값 유지) |
| verse `Badge` | hover | 별도 동작 없음 (v1) |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `empty` (기본) | Textarea 비어있음 · Submit `disabled` · 답변 영역 `BookOpen` 아이콘 + 안내 텍스트 |
| `typing` | 텍스트 있음 · Submit 활성 · 글자수 갱신 |
| `typing.over-limit` | 500자 초과 · 글자수 `text-destructive` · Submit `disabled` |
| `submitting` | Textarea + Submit `disabled` · 이전 답변 fade-out → Skeleton + 로딩 라벨 |
| `success` | 답변 Card + verse 카드 5건 · Textarea 내용 유지 (재질문 가능) |
| `error.gemini-429` | `Alert`(destructive) "AI 서비스가 일시적으로 혼잡합니다..." + "다시 시도" |
| `error.gemini-other` | `Alert`(destructive) "답변 생성 중 오류가 발생했습니다..." + "다시 시도" |
| `error.no-results` | `Alert`(default · Search 아이콘) "관련 성경 구절을 찾지 못했습니다..." |
| `error.network` | `Alert`(destructive) "네트워크 연결을 확인해주세요." + "다시 시도" |
| `error.401` | `Toast`(destructive, "세션이 만료되었습니다.") → 500ms 후 `/login` redirect |
| `disabled.quota-exceeded` | SC-02 sub-state 전환 (다음 섹션 참조) |
| ANONYMOUS 진입 | `/login` 307 redirect (서버 측 · 화면 없음) |

### 10. 모달 / 드롭다운 / 탭 동작

해당 없음. SC-01 은 단일 화면 SPA 패턴 — 페이지 이동 없이 답변 영역만 업데이트.

### 11. CTA 배치

| 우선순위 | CTA | 위치 | 컴포넌트 |
|---|---|---|---|
| Primary | "질문하기" (Submit) | 질문 입력 바 우측 끝 | `Button`(default) |
| Secondary | "다시 시도" | error 상태 `Alert` 내부 | `Button`(outline · size=sm) |

---

## SC-02 · QA · 일일 한도 초과

### 1. 화면 목적

SC-01 의 sub-state. `/api/qa` 가 429 를 반환한 후 인라인으로 전환되어, 사용자가 한도 초과를 명확히 인지하고 KST 자정 초기화 시각을 알도록 한다.

### 2. 경로 / 레이아웃 파일

- **경로**: `/qa` (SC-01 과 동일 URL · 별도 페이지 없음)
- **page 파일**: `app/qa/page.tsx` (SC-01 과 공유 · 클라이언트 상태 분기)
- **layout 파일**: `app/layout.tsx`
- SC-01 → SC-02 전환은 `router.push` 없이 **인라인 상태 전환**

### 3. 레이아웃 계층

SC-01 과 동일. 변경되는 부분만 아래에 기술.

```
app/layout.tsx
  └── <Header variant="full" />           ← Badge variant=destructive "0 / 20"
  └── <main>
        └── <QAPage state="quota-exceeded">
              ├── 페이지 타이틀 블록       ← 그대로 유지
              ├── [NEW] 한도 초과 Alert 배너 ← Textarea 위에 삽입
              ├── 질문 입력 블록            ← Textarea + Button disabled
              └── 답변 영역                 ← empty 상태 + 초기화 안내 카피
  └── <Footer />
```

### 4. 섹션 순서

1. 페이지 타이틀 블록 (SC-01 과 동일 · 변경 없음)
2. **한도 초과 `Alert` 배너** (신규 · Textarea 블록 위)
3. 질문 입력 블록 (`Textarea` + Submit `Button` 모두 disabled)
4. 키보드 힌트 (표시 유지 · 실질 효과 없음)
5. 답변 영역 (empty + 초기화 안내 카피)

### 5. 컴포넌트 구성

#### 한도 초과 Alert 배너 (SC-02 전용 신규)

- `Alert` (variant=default · border=amber 계열 · 아이콘=`Clock`)
  - `AlertTitle` — "오늘의 사용량을 모두 소진했습니다"
  - `AlertDescription` — "하루 20회 한도를 모두 사용했습니다. 한국 시각 자정(00:00 KST)에 초기화됩니다."
  - (선택 추가) `p.text-xs` — "내일 다시 질문해주세요."

#### 질문 입력 블록 변경사항

- `Textarea` — `disabled=true` · `bg-muted` 색상 · placeholder 교체: "오늘 사용 가능한 질문 횟수를 모두 사용했습니다."
- Submit `Button` — `disabled=true` · `cursor-not-allowed`
- 글자수 카운터 — 표시 유지 (입력 불가이므로 정적)

#### 답변 영역 변경사항

- `BookOpen` 아이콘 유지
- 텍스트 교체: "오늘은 더 이상 질문할 수 없습니다. 자정 이후 다시 시도해주세요."

#### Header Badge 변경사항

- SC-07 의 `Badge` → variant=destructive · 텍스트 "0 / 20"

### 6. 반응형 동작

SC-01 과 동일. Alert 배너는 모바일·데스크탑 모두 full-width 블록.

### 7. sticky / scroll 동작

SC-01 과 동일. Alert 배너는 inline — sticky 없음.

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| `Textarea` | click / focus | 반응 없음 (`disabled`) |
| Submit `Button` | hover | `cursor-not-allowed` (shadcn disabled 기본) |
| Submit `Button` | click | 반응 없음 (`disabled`) |
| `Cmd/Ctrl+Enter` | keydown | 반응 없음 (submitting 상태가 아니어도 quota-exceeded 시 guard) |
| 페이지 새로고침 | — | 서버 quota 재확인 → 자정 경과 시 SC-01 default 복귀 |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `quota-exceeded` | Alert 배너 노출 · Textarea disabled · Submit disabled · Header Badge destructive "0 / 20" · 답변 영역 초기화 안내 카피 |
| SC-01 의 다른 상태 (`typing`, `submitting`, `success`, `error.*`) | 모두 비활성화 (quota-exceeded 에서는 진입 불가) |

### 10. 모달 / 드롭다운 / 탭 동작

해당 없음.

### 11. CTA 배치

이 화면에서 사용자가 취할 수 있는 직접 CTA 없음. 간접 안내:
- Alert 배너 내 텍스트 — 다음 날 자정 이후 재방문 안내
- Header DropdownMenu 로그아웃 (SC-07) — 그대로 작동

---

## SC-03 · 로그인 / 회원가입

### 1. 화면 목적

미인증 사용자가 5초 안에 가입·로그인 방법을 인지하고 1분 안에 가입 → `/qa` 진입을 완료한다. v1 인증 진입 단일 경로.

### 2. 경로 / 레이아웃 파일

- **경로**: `/login`
- **page 파일**: `app/login/page.tsx` (Server Component 진입 · 인증 확인 후 Client Component 위임)
- **layout 파일**: `app/layout.tsx` (Header minimal + Footer)
- **URL 분기**: `/login?tab=signup` → 회원가입 탭 초기 활성 · `/login?tab=login` → 로그인 탭 (default)
- 인증된 사용자가 방문 시: RSC layer 에서 `/qa` 307 redirect

### 3. 레이아웃 계층

```
app/layout.tsx
  └── <Header variant="minimal" />        ← 로고만 · 우측 컨트롤 없음
  └── <main>
        └── <LoginPage>
              └── (flex items-center justify-center min-h-screen)
                    └── <Card max-w-md>   ← 뷰포트 수직 중앙
                          ├── 워드마크 블록
                          ├── Google OAuth Button
                          ├── Separator
                          ├── Tabs (로그인 / 회원가입)
                          │     ├── TabsContent "login"
                          │     └── TabsContent "signup"
                          └── Alert (에러 · 조건부)
  └── <Footer />                          ← 면책 한 줄
```

### 4. 섹션 순서

Card 내부 (위에서 아래):

1. 워드마크 블록 — "logos-rag" + 태그라인
2. Google OAuth `Button`
3. `Separator` ("또는 이메일로")
4. `Tabs` (로그인 탭 · 회원가입 탭)
5. `Alert` 에러 영역 (폼 상단 · 오류 발생 시에만 표시)

### 5. 컴포넌트 구성

#### 워드마크 블록

- `p` (font-bold) — "logos-rag"
- `p` (text-sm · text-muted-foreground) — "성경 의미 검색 · AI 답변"

#### Google OAuth Button

- `Button` (variant=outline · full-width) — "Google 계정으로 계속하기"
  - 좌측 Google 'G' 아이콘 SVG (16×16)
  - 클릭 시: `loading.google` 상태 → 아이콘 → `Loader2` 스피너 · `disabled=true`

#### Separator

- `Separator` with 중앙 텍스트 "또는 이메일로" (절대 위치 배경 처리 또는 shadcn Separator 래핑)

#### Tabs

- `Tabs` (defaultValue: URL `?tab=` 파라미터 · fallback "login")
  - `TabsList` (full-width · 2개 균등 분할)
    - `TabsTrigger value="login"` — "로그인"
    - `TabsTrigger value="signup"` — "회원가입"
  - `TabsContent value="login"` 내부:
    ```
    Label "이메일"
    Input (type=email · id=email · placeholder="you@example.com")
    [인라인 에러] p.text-destructive.text-xs
    Label "비밀번호"
    Input (type=password · id=password · placeholder="비밀번호")
    [인라인 에러] p.text-destructive.text-xs
    Link (text-sm · text-right) "비밀번호를 잊으셨나요?" → /auth/reset-password
    Button (type=submit · full-width · variant=default) "로그인"
    ```
  - `TabsContent value="signup"` 내부:
    ```
    Label "이메일"
    Input (type=email · id=signup-email · placeholder="you@example.com")
    [인라인 에러] p.text-destructive.text-xs
    Label "비밀번호"
    Input (type=password · id=signup-password · placeholder="8자 이상")
    [인라인 에러] p.text-destructive.text-xs
    Label "비밀번호 확인"
    Input (type=password · id=signup-confirm · placeholder="비밀번호 확인")
    [인라인 에러] p.text-destructive.text-xs
    Checkbox (id=terms) + Label "이용약관 및 개인정보 처리방침에 동의합니다"
      - "이용약관" / "개인정보 처리방침" 각각 밑줄 링크 (현재 더미 #)
    [인라인 에러] p.text-destructive.text-xs
    Button (type=submit · full-width · variant=default) "계정 만들기"
    ```

#### Alert 에러 영역

- `Alert` (조건부 · 폼 최상단 또는 Tabs 바로 위)
  - `error.invalid-credentials`: variant=destructive — "이메일 또는 비밀번호가 올바르지 않습니다."
  - `error.email-not-verified`: variant=default · 아이콘=`MailWarning` — "이메일 인증이 완료되지 않았습니다..." + `Button`(inline · size=sm) "인증 메일 재전송"
  - `error.email-already-registered`: variant=default — "이미 가입된 이메일입니다..." + `Button`(inline · size=sm) "로그인 탭으로 이동"
  - `error.network`: variant=destructive — "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."

### 6. 반응형 동작

- **모바일**: Card max-w-md → 전체 너비 사용 (좌우 `px-4` 여백) · 폰트·버튼 크기 그대로 · Checkbox + Label 줄바꿈 가능
- **태블릿 이상**: max-w-md Card 중앙 정렬 · 카드 좌우 여백 자동
- **Input 너비**: 탭 내부 100% (Card 너비에 맞춤)

### 7. sticky / scroll 동작

- Header: sticky top-0
- Card: `min-h-screen` flex 중앙 정렬 — Card 가 뷰포트 높이 초과 시 스크롤 가능 (overflow-y-auto on body)
- sticky CTA: 없음

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| `TabsTrigger` | click | 탭 전환 (URL `?tab=` 갱신) · `loading.*` 상태 중 disabled |
| Email `Input` | blur | 이메일 형식 클라이언트 검증 → 인라인 에러 표시 |
| Password `Input` (signup) | blur | 8자 이상 검증 → 인라인 에러 |
| Confirm `Input` | blur | 비밀번호 일치 검증 → 인라인 에러 |
| `Checkbox` | click | checked/unchecked 토글 |
| Submit `Button` | click | `loading.email` 상태 → 버튼 내 `Loader2` 스피너 · `disabled=true` · 탭 전환 차단 |
| Google `Button` | click | `loading.google` 상태 → 스피너 · `disabled=true` · Supabase OAuth redirect |
| "비밀번호를 잊으셨나요?" | click | `/auth/reset-password` 이동 |
| Enter 키 (Input 포커스) | keydown | Submit 동일 트리거 |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `default` | 탭 "login" 활성 (URL 분기) · 모든 필드 비어있음 · 버튼 활성 |
| `loading.email` | Submit 버튼 스피너 · `disabled` · 탭 전환 차단 · Google 버튼 `disabled` |
| `loading.google` | Google 버튼 스피너 · `disabled` · Submit `disabled` · 탭 전환 차단 |
| `error.invalid-credentials` | Alert(destructive) 폼 상단 · 필드 값 유지 |
| `error.email-not-verified` | Alert(default · MailWarning) + "인증 메일 재전송" 버튼 |
| `error.email-already-registered` | Alert(default) + "로그인 탭으로 이동" 버튼 |
| `error.network` | Alert(destructive) |
| `field.email.error=format` | 이메일 Input 아래 인라인 에러 |
| `field.password.error=too-short` | 비밀번호 Input 아래 인라인 에러 (signup 탭) |
| `field.confirm.error=mismatch` | 비밀번호 확인 Input 아래 인라인 에러 |
| `field.terms.error=required` | Checkbox 아래 인라인 에러 |
| `success.login` | `/qa` redirect (화면 전환 · 사용자에게 로딩 없음) |
| `success.signup` | `/auth/verify-email?email=...` redirect |
| AUTHENTICATED 진입 | `/qa` 307 redirect (서버 측 · 화면 미표시) |

### 10. 모달 / 드롭다운 / 탭 동작

- **Tabs 전환**: `TabsTrigger` 클릭 시 URL `?tab=` 갱신 + TabsContent 교체. 탭 전환 시 이전 탭 에러 Alert 초기화.
- `loading.*` 상태 중 `TabsTrigger` `disabled=true` (로딩 중 탭 전환 차단).
- Google OAuth 취소(팝업 닫기): 에러 표시 없이 `default` 상태로 복귀.

### 11. CTA 배치

| 우선순위 | CTA | 위치 | 컴포넌트 |
|---|---|---|---|
| Primary | "로그인" / "계정 만들기" | 탭 하단 full-width | `Button`(default) |
| Secondary | "Google 계정으로 계속하기" | Tabs 위 full-width | `Button`(outline) |
| Tertiary | "비밀번호를 잊으셨나요?" | 비밀번호 Input 아래 우측 | `Link`(text-sm) |

---

## SC-04 · OAuth / 매직링크 콜백

### 1. 화면 목적

Google OAuth 또는 이메일 인증/비밀번호 재설정 링크에서 도달한 토큰을 서버 측에서 교환하고, 세션 쿠키 설정 후 `/qa` 또는 SC-06 step 2 로 redirect 한다. 정상 흐름에서 사용자 노출 0~1초.

### 2. 경로 / 레이아웃 파일

- **경로**: `/auth/callback`
- **Route Handler**: `app/auth/callback/route.ts` — 서버측 토큰 교환 + Set-Cookie + 307 redirect (사용자에게 HTML 렌더 없음)
- **폴백 page**: `app/auth/callback/page.tsx` — Route Handler 지연·에러 시 또는 직접 URL 진입 시만 렌더
- **layout 파일**: `app/layout.tsx` (Header minimal + Footer)

### 3. 레이아웃 계층

```
app/layout.tsx
  └── <Header variant="minimal" />
  └── <main>
        └── (flex items-center justify-center min-h-screen)
              └── <div flex-col items-center gap-4>   ← 중앙 컨테이너
                    ├── 워드마크 텍스트
                    ├── Loader2 스피너
                    ├── 로딩 메시지
                    └── Alert 에러 영역 (에러 상태 시)
  └── <Footer />
```

### 4. 섹션 순서

1. 워드마크 텍스트 — "logos-rag"
2. `Loader2` 스피너 (animate-spin)
3. 로딩 메시지 `p`
4. `Alert` 에러 영역 (에러 상태 시에만 렌더 · 스피너 대체)

### 5. 컴포넌트 구성

#### 로딩 상태 (default)

- `p` (text-lg · font-semibold) — "logos-rag"
- `Loader2` 아이콘 (animate-spin · text-muted-foreground)
- `p` (text-sm · text-muted-foreground) — "로그인 처리 중입니다..."

#### 에러 상태

- `Alert` (variant=destructive · 아이콘=`AlertCircle`)
  - `AlertDescription` — 에러별 카피
  - `Button` (variant=outline · full-width) — "로그인 화면으로 돌아가기" → `/login`

### 6. 반응형 동작

- 항상 뷰포트 중앙 수직 정렬 · 좌우 여백 `px-4`
- 모바일·데스크탑 구조 차이 없음 (최소 UI)

### 7. sticky / scroll 동작

- Header: sticky top-0
- 중앙 컨테이너: overflow 없음 · 스크롤 없음

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| page.tsx 진입 (직접 URL) | mount | URL 쿼리 파싱 → 파라미터 없으면 즉시 `/login` redirect |
| "로그인 화면으로 돌아가기" | click | `router.push('/login')` |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `loading` (default) | 스피너 + 로딩 메시지 · 사용자 노출 0~1초 |
| `success` | Route Handler 가 즉시 `/qa` redirect → 화면 미표시 |
| `error.code-expired` | 스피너 숨김 · Alert(destructive) "인증 링크가 만료되었습니다." + CTA |
| `error.code-invalid` | Alert(destructive) "유효하지 않은 인증 요청입니다." + CTA |
| `error.network` | Alert(destructive) "인증 처리 중 오류가 발생했습니다." + CTA |

### 10. 모달 / 드롭다운 / 탭 동작

해당 없음.

### 11. CTA 배치

| 우선순위 | CTA | 위치 | 컴포넌트 |
|---|---|---|---|
| Primary (에러 시) | "로그인 화면으로 돌아가기" | Alert 내부 full-width | `Button`(outline) |

---

## SC-05 · 이메일 인증 안내

### 1. 화면 목적

회원가입 직후 사용자가 메일함을 확인하도록 명확히 안내하고, 인증 메일을 못 받은 경우 60초 쿨다운 재전송 수단을 제공한다.

### 2. 경로 / 레이아웃 파일

- **경로**: `/auth/verify-email`
- **page 파일**: `app/auth/verify-email/page.tsx`
- **URL 파라미터**: `?email=user@example.com` — 이메일 표시용 (없으면 "등록하신 이메일" 폴백)
- **layout 파일**: `app/layout.tsx` (Header minimal + Footer)
- 인증된 사용자 방문 시: `/qa` redirect

### 3. 레이아웃 계층

```
app/layout.tsx
  └── <Header variant="minimal" />
  └── <main>
        └── (flex items-center justify-center min-h-screen px-4)
              └── <Card max-w-md>
                    ├── MailCheck 아이콘
                    ├── CardTitle
                    ├── CardDescription (이메일 강조)
                    ├── 부가 안내 (스팸 폴더)
                    ├── 재전송 Button (60초 쿨다운)
                    ├── Separator
                    └── 보조 링크 × 2
  └── <Footer />
```

### 4. 섹션 순서

Card 내부 (위에서 아래):

1. `MailCheck` 아이콘 (중앙 정렬)
2. `CardTitle` — "이메일을 확인해주세요"
3. `CardDescription` — 이메일 주소 강조 + 안내 문장
4. `p.text-sm.text-muted-foreground` — "메일이 보이지 않으면 스팸 폴더를 확인해보세요."
5. 재전송 `Button` (full-width · 쿨다운 상태 분기)
6. `Separator`
7. 보조 링크 — "다른 이메일로 가입하기" + "로그인 화면으로"

### 5. 컴포넌트 구성

- `MailCheck` 아이콘 (mx-auto · text-primary)
- `CardTitle` — "이메일을 확인해주세요"
- `CardDescription`:
  - 이메일 있음: "`[이메일 주소]`로 인증 메일을 보냈습니다. 메일함을 확인하고 인증 링크를 클릭해주세요."
  - 이메일 없음: "등록하신 이메일로 인증 메일을 보냈습니다. 메일함을 확인하고 인증 링크를 클릭해주세요."
  - 이메일 주소는 `strong` 또는 `span.font-medium` 으로 강조
- `p.text-sm.text-muted-foreground` — 스팸 폴더 안내
- 재전송 `Button` (full-width):
  - `default` 상태: `variant=default` — "인증 메일 재전송"
  - `loading.resend`: 내부 `Loader2` 스피너 + `disabled=true`
  - `cooldown` 상태: `variant=outline` · `disabled=true` — "재전송 가능 (N초)" (카운트다운 1초 간격 갱신)
- `Separator`
- `p.text-sm` — `Link` "다른 이메일로 가입하기" → `/login?tab=signup`
- `p.text-sm` — `Link` "로그인 화면으로" → `/login`

### 6. 반응형 동작

- Card max-w-md → 모바일 전체 너비 (px-4 여백)
- 버튼 full-width 유지
- 보조 링크: 각각 한 줄 · 중앙 또는 좌측 정렬

### 7. sticky / scroll 동작

- Header: sticky top-0
- 카드: 뷰포트 중앙 · 높이 초과 시 스크롤

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| 재전송 `Button` | click | `loading.resend` → 성공: `success.resend` → Toast + 60초 쿨다운 시작 / 실패: Toast(destructive) + 버튼 활성 복귀 |
| 쿨다운 중 `Button` | click | 반응 없음 (`disabled`) |
| 쿨다운 타이머 | 매 1초 | 버튼 라벨 "재전송 가능 (N초)" 갱신 |
| 쿨다운 0 도달 | — | 버튼 활성화 + 라벨 "인증 메일 재전송" 복귀 |
| "다른 이메일로 가입하기" | click | `/login?tab=signup` 이동 |
| "로그인 화면으로" | click | `/login` 이동 |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `default` | 재전송 버튼 활성 |
| `loading.resend` | 버튼 스피너 + `disabled` |
| `success.resend` | Toast(default, "인증 메일을 재전송했습니다.") + 쿨다운 60초 시작 |
| `error.resend` | Toast(destructive, "메일 재전송에 실패했습니다.") + 버튼 활성 유지 |
| `cooldown` | 버튼 `disabled` + 카운트다운 라벨 |
| AUTHENTICATED 진입 | `/qa` redirect (서버 측) |

### 10. 모달 / 드롭다운 / 탭 동작

해당 없음. `Toast` 는 shadcn `Toaster` 글로벌 통해 우상단 표시.

### 11. CTA 배치

| 우선순위 | CTA | 위치 | 컴포넌트 |
|---|---|---|---|
| Primary | "인증 메일 재전송" | Card 중앙 full-width | `Button`(default/outline) |
| Secondary | "다른 이메일로 가입하기" | Separator 아래 | `Link`(text-sm) |
| Tertiary | "로그인 화면으로" | Separator 아래 | `Link`(text-sm) |

---

## SC-06 · 비밀번호 재설정 (2-step)

### 1. 화면 목적

비밀번호를 잊은 사용자가 이메일로 재설정 링크를 받고, 링크 클릭 후 새 비밀번호를 설정해 로그인 화면으로 복귀한다. 동일 경로(`/auth/reset-password`)에서 URL 파라미터(`?step=2`)로 2-step 분기.

### 2. 경로 / 레이아웃 파일

- **경로**: `/auth/reset-password`
- **page 파일**: `app/auth/reset-password/page.tsx`
- **URL 분기**: `?step=2` → Step 2 렌더 · 없으면 Step 1 렌더
- **Step 2 진입 경로**: SC-04(`/auth/callback?type=recovery`) → recovery 임시 세션 발급 → `/auth/reset-password?step=2`
- **layout 파일**: `app/layout.tsx` (Header minimal + Footer)

### 3. 레이아웃 계층

Step 1 과 Step 2 모두 동일 레이아웃 뼈대 사용.

```
app/layout.tsx
  └── <Header variant="minimal" />
  └── <main>
        └── (flex items-center justify-center min-h-screen px-4)
              └── <Card max-w-md>          ← Step 1 또는 Step 2 컨텐츠
  └── <Footer />
```

### 4. 섹션 순서

#### Step 1 — 이메일 입력 (기본 뷰)

1. `CardTitle` — "비밀번호 재설정"
2. `CardDescription` — 안내 문장
3. `Label` + `Input`(email) + 인라인 에러
4. Submit `Button`
5. 보조 링크 — "로그인 화면으로"

#### Step 1 — 완료 뷰 (발송 성공 후 카드 컨텐츠 교체)

1. `MailCheck` 아이콘 (중앙)
2. 완료 메시지 `p`
3. 스팸 폴더 안내 `p.text-sm.muted`
4. 재전송 `Button` (60초 쿨다운)

#### Step 2 — 새 비밀번호 입력

1. `CardTitle` — "새 비밀번호 설정"
2. `Label` + `Input`(password, "새 비밀번호") + 인라인 에러
3. `Label` + `Input`(password, "비밀번호 확인") + 인라인 에러
4. Submit `Button`
5. 보조 링크 — "로그인 화면으로"

#### Step 2 — 토큰 에러 뷰 (폼 대체)

1. `Alert`(destructive) — 에러 카피
2. `Button` (full-width · outline) — "로그인 화면으로"

### 5. 컴포넌트 구성

#### Step 1 기본 뷰

- `CardTitle` — "비밀번호 재설정"
- `CardDescription` — "가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다."
- `Label` + `Input`(type=email · placeholder="you@example.com")
- 인라인 에러 `p.text-destructive.text-xs`
- Submit `Button` (full-width · "재설정 링크 보내기")
  - loading 중: 내부 `Loader2` + `disabled=true` + `pointer-events-none`
- 보조 링크 `p.text-sm` — `Link` "로그인 화면으로" → `/login`

#### Step 1 완료 뷰 (발송 성공 후 카드 컨텐츠 교체)

- `MailCheck` 아이콘 (mx-auto · text-primary)
- `p` — "재설정 링크를 이메일로 보냈습니다. 메일함을 확인해주세요."
- `p.text-sm.text-muted-foreground` — 스팸 폴더 안내
- `Button` (full-width · 60초 쿨다운)
  - 쿨다운 중: `variant=outline` · `disabled=true` — "재전송 가능 (N초)"
  - 활성: `variant=default` — "재전송 가능"

#### Step 2 폼

- `CardTitle` — "새 비밀번호 설정"
- `Label` + `Input`(type=password · id=new-password · placeholder="새 비밀번호 (8자 이상)")
- 인라인 에러 `p.text-destructive.text-xs`
- `Label` + `Input`(type=password · id=confirm-password · placeholder="비밀번호 확인")
- 인라인 에러 `p.text-destructive.text-xs`
- Submit `Button` (full-width · "비밀번호 변경")
- 보조 링크 `p.text-sm` — `Link` "로그인 화면으로" → `/login`

#### Step 2 토큰 에러 뷰

- `Alert` (variant=destructive · 아이콘=`AlertCircle`)
  - `AlertDescription` — `token-expired`: "재설정 링크가 만료되었습니다. 다시 요청해주세요." / `token-invalid`: "유효하지 않은 재설정 링크입니다."
  - 단, `token-expired` 에서는 Alert 내 "다시 요청하기" 인라인 버튼 → Step 1 초기화
- `Button` (variant=outline · full-width) — "로그인 화면으로" → `/login`

### 6. 반응형 동작

- Card max-w-md → 모바일 전체 너비 (px-4 여백)
- Input 100% 너비
- 버튼 full-width

### 7. sticky / scroll 동작

- Header: sticky top-0
- 카드: 뷰포트 중앙 · 높이 초과 시 스크롤

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| Step 1 Email `Input` | blur | 이메일 형식 검증 → 인라인 에러 |
| Step 1 Submit | click | `step1.loading` → 성공: 완료 뷰 교체 / 네트워크 에러: `Alert`(destructive) |
| Step 1 재전송 `Button` (완료 뷰) | click | 쿨다운 중 `disabled` / 활성 시: 재발송 + 60초 쿨다운 재시작 |
| Step 2 비번 `Input` | blur | 8자 이상 검증 |
| Step 2 확인 `Input` | blur | 비밀번호 일치 검증 |
| Step 2 Submit | click | `step2.loading` → 성공: Toast + `/login` redirect / 토큰 에러: 에러 뷰 전환 |
| Enter (Input 포커스) | keydown | Submit 동일 트리거 |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `step1.default` | 이메일 입력 폼 활성 |
| `step1.loading` | 버튼 스피너 · `disabled` · 폼 `pointer-events-none` |
| `step1.success` | 폼 숨김 → 완료 뷰 교체 (MailCheck 아이콘 + 메시지 + 재전송 버튼) |
| `step1.error.network` | `Alert`(destructive) 폼 상단 |
| `step1.cooldown` | 재전송 버튼 카운트다운 |
| `step2.default` | 새 비번 폼 활성 |
| `step2.loading` | 버튼 스피너 · `disabled` |
| `step2.success` | Toast(default, "비밀번호가 변경되었습니다.") + `/login` redirect |
| `step2.error.token-expired` | 폼 숨김 → 에러 뷰 (`Alert`(destructive) + "다시 요청하기" + "로그인 화면으로") |
| `step2.error.token-invalid` | 폼 숨김 → 에러 뷰 |
| `step2.error.password-mismatch` | 비번 확인 Input 아래 인라인 에러 |
| `step2.error.password-too-short` | 비번 Input 아래 인라인 에러 |
| `step2.error.network` | `Alert`(destructive) 폼 상단 |

### 10. 모달 / 드롭다운 / 탭 동작

해당 없음.

### 11. CTA 배치

| 우선순위 | CTA | 위치 | 컴포넌트 |
|---|---|---|---|
| Primary | "재설정 링크 보내기" (Step 1) / "비밀번호 변경" (Step 2) | 폼 하단 full-width | `Button`(default) |
| Secondary | "로그인 화면으로" | Card 하단 | `Link`(text-sm) |
| Secondary (에러 뷰) | "로그인 화면으로" | Alert 아래 full-width | `Button`(outline) |

---

## SC-07 · 전역 헤더

### 1. 화면 목적

어느 페이지에서나 앱 정체성(로고)이 보이고, 인증 상태와 잔여 일일 한도를 즉시 확인할 수 있다. 인증 페이지에서는 미니멀 변형으로 전환.

### 2. 경로 / 레이아웃 파일

- **파일**: `app/_components/header.tsx` (Server Component · 또는 async RSC)
- **마운트 위치**: `app/layout.tsx` 내 `<body>` 최상단
- **변형 결정**: 현재 경로 판단 (인증 페이지 여부) → `variant` prop 전달

### 3. 레이아웃 계층

```
<header> (sticky · top-0 · z-50 · border-b · bg-background/95 · backdrop-blur-sm)
  └── <div> (max-w-2xl · mx-auto · px-4 · h-14 · flex · items-center · justify-between)
        ├── 좌측: 로고 영역
        └── 우측: 인증 상태별 컨트롤
```

### 4. 섹션 순서

1. 좌측 — 로고 링크 (워드마크 + 태그라인)
2. 우측 — 인증 상태별 분기:
   - **미인증**: "로그인" `Button`
   - **인증**: 잔여 한도 `Badge` + `DropdownMenu`
   - **minimal 변형**: 아무것도 없음 (좌측 로고만)

### 5. 컴포넌트 구성

#### 공통

- `header` HTML element (sticky · top-0 · z-50 · h-14 · border-b · bg-background/95 · backdrop-blur-sm)
- 내부 컨테이너 `div` (max-w-2xl · mx-auto · px-4 · h-full · flex · items-center · justify-between)

#### 좌측 — 로고

- `Link` (href: 인증 시 `/qa` · 미인증 시 `/login`)
  - `span` (font-bold · text-lg · tracking-tight) — "logos-rag"
  - `span` (text-xs · text-muted-foreground · **hidden sm:inline**) — "성경 AI 검색"

#### 우측 — 미인증 상태

- `Button` (variant=default · size=sm) — "로그인" → `/login`

#### 우측 — 인증 상태 (`authenticated.*`)

- **잔여 한도 Badge**:
  - 로딩 중: `Skeleton` (w-12 · h-5)
  - 정상: `Badge` (variant=secondary) — "N / 20"
  - 잔여 3 이하: `Badge` (variant=warning 또는 amber 커스텀 · §14 B-2)
  - 잔여 0: `Badge` (variant=destructive) — "0 / 20"
  - 모바일(sm 미만): `Badge` 대신 숫자 + `Flame` 또는 `Zap` 아이콘 소형 표시
- **DropdownMenu**:
  - `DropdownMenuTrigger` as child: `Button` (variant=ghost · size=icon) + `User` 아이콘
  - `DropdownMenuContent` (align=end):
    - `DropdownMenuLabel` — 사용자 이메일 (text-sm · text-muted-foreground · non-interactive)
    - `DropdownMenuSeparator`
    - `DropdownMenuItem` — `LogOut` 아이콘 + "로그아웃" → `signOut()` + `/login` redirect

#### 우측 — minimal 변형 (인증 페이지)

- 아무 컴포넌트도 렌더링하지 않음

### 6. 반응형 동작

- **데스크탑(sm 이상)**: 로고 태그라인 "성경 AI 검색" 표시 · Badge 전체 표시
- **모바일(sm 미만)**: 로고 태그라인 숨김 (`hidden sm:inline`) · Badge 대신 아이콘 + 숫자 · DropdownMenu 유지

### 7. sticky / scroll 동작

- Header 전체 `sticky top-0 z-50` — 페이지 스크롤과 무관하게 항상 상단 고정
- `bg-background/95 backdrop-blur-sm` — 스크롤 시 아래 컨텐츠 투과 블러

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| 로고 `Link` | click | 인증: `/qa` 이동 · 미인증: `/login` 이동 |
| "로그인" `Button` | click | `/login` 이동 |
| `DropdownMenuTrigger` | click | DropdownMenuContent 열기/닫기 |
| "로그아웃" `DropdownMenuItem` | click | `loading.signout` 상태 → `signOut()` → 성공: Toast(default, "로그아웃했습니다.") + `/login` redirect / 실패: Toast(destructive) |
| `Esc` 키 | keydown (DropdownMenu 열림) | DropdownMenu 닫힘 (shadcn 기본) |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `unauthenticated` | 로고 + "로그인" `Button` |
| `authenticated.normal` | 로고 + Badge(secondary, "N / 20") + DropdownMenu |
| `authenticated.quota-near` | Badge variant=warning (잔여 3 이하 · §14 B-2) |
| `authenticated.quota-zero` | Badge variant=destructive "0 / 20" |
| `loading.signout` | DropdownMenu 닫힘 + `User` 버튼 내 `Loader2` 스피너 |
| `minimal` | 로고만 · 우측 컨트롤 없음 (인증 페이지: SC-03~SC-06) |
| `quota.loading` | Badge 자리에 `Skeleton` (w-12 · h-5) |

### 10. 모달 / 드롭다운 / 탭 동작

- **DropdownMenu 열기**: `DropdownMenuTrigger` 클릭 · `Esc` 닫힘 · 외부 클릭 닫힘 (shadcn 기본 동작)
- DropdownMenuContent 는 트리거 기준 `align=end` — 우측 하단 정렬
- `loading.signout` 중: DropdownMenu 내 아이템 `disabled`

### 11. CTA 배치

| 우선순위 | CTA | 위치 | 컴포넌트 |
|---|---|---|---|
| Primary (미인증) | "로그인" | Header 우측 | `Button`(default · size=sm) |
| Primary (인증) | DropdownMenu Trigger | Header 우측 | `Button`(ghost · icon) |
| Dropdown 내 | "로그아웃" | DropdownMenuContent | `DropdownMenuItem` |

---

## SC-08 · 전역 푸터

### 1. 화면 목적

AI 답변의 신학적 권위 없음을 면책하고, GitHub 링크와 버전 정보를 표기한다. 시각적으로 최소화.

### 2. 경로 / 레이아웃 파일

- **파일**: `app/_components/footer.tsx` (정적 · 상태 없음)
- **마운트 위치**: `app/layout.tsx` 내 `<body>` 최하단

### 3. 레이아웃 계층

```
<footer> (border-t · py-4)
  └── <div> (max-w-2xl · mx-auto · px-4 · flex · flex-wrap · items-center · justify-between · gap-x-4 · gap-y-1)
        ├── 면책 문구
        └── GitHub 링크 + 버전 표기
```

### 4. 섹션 순서

1. 면책 `p` (좌측/중앙)
2. GitHub `a` + 버전 `span` (우측)

### 5. 컴포넌트 구성

- `footer` HTML element (border-t · py-4)
- 내부 `div` (max-w-2xl · mx-auto · px-4 · flex · flex-wrap · items-center · justify-between · gap-x-4 · gap-y-1)
  - `p.text-xs.text-muted-foreground` — "이 답변은 AI가 생성하며 신학적 권위를 갖지 않습니다."
  - 우측 그룹 (flex · items-center · gap-x-2):
    - `a.text-xs.text-muted-foreground.hover:underline` (target=_blank · rel=noopener) — "GitHub"
    - `span.text-xs.text-muted-foreground` — "v1"

### 6. 반응형 동작

- **데스크탑**: 면책 문구 좌측 · GitHub + 버전 우측 · 단일 행
- **모바일**: `flex-wrap` 으로 줄바꿈 — 면책 문구 1행 + GitHub·버전 2행 또는 `justify-center` 로 중앙 정렬

### 7. sticky / scroll 동작

고정되지 않음. 페이지 최하단에 일반 flow 위치.

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| "GitHub" `a` | click | 외부 GitHub 저장소 새 탭 열기 |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `default` | 항상 동일 · 상태 변화 없음 |

### 10. 모달 / 드롭다운 / 탭 동작

해당 없음.

### 11. CTA 배치

CTA 없음. GitHub 링크는 외부 리소스 연결 보조 링크.

---

## SC-09 · 404 / 500 폴백

### 1. 화면 목적

길을 잃은 사용자가 빠르게 앱으로 복귀할 수 있도록 명확한 에러 안내와 CTA 를 제공한다.

### 2. 경로 / 레이아웃 파일

- **404 파일**: `app/not-found.tsx` (Next.js App Router 관례)
- **500 파일**: `app/error.tsx` (Client Component 필수 — `"use client"` + `error` + `reset` props)
- **layout 파일**: `app/layout.tsx` (Header full 또는 minimal fallback + Footer)
- 404: 존재하지 않는 경로 접근 시 Next.js 자동 렌더
- 500: 서버 컴포넌트 런타임 에러 또는 API Route 미처리 예외 시 Next.js Error Boundary 발동

### 3. 레이아웃 계층

```
app/layout.tsx
  └── <Header variant="full" />            ← 에러 상황에서도 렌더 가능한 경우 full · 불가 시 minimal fallback
  └── <main>
        └── (flex · items-center · justify-center · min-h-[...] · px-4)
              └── <div flex-col items-center gap-4 text-center py-20 max-w-sm mx-auto>
                    ├── 큰 숫자 (404/500)
                    ├── 에러 제목 h1
                    ├── 부가 메시지 p
                    ├── CTA 버튼 (Primary)
                    └── (500 전용) CTA 버튼 (Secondary) + 오류 ID
  └── <Footer />
```

### 4. 섹션 순서

1. 큰 에러 코드 숫자 (`p` — "404" 또는 "500")
2. 에러 제목 (`h1`)
3. 부가 메시지 (`p`)
4. Primary CTA — "홈으로" `Button`
5. (500 전용) Secondary CTA — "새로고침" `Button`
6. (500 + debug 조건) 오류 ID `p`

### 5. 컴포넌트 구성

#### 공통 컨테이너

- `div` (flex-col · items-center · gap-4 · text-center · py-20 · max-w-sm · mx-auto)

#### 에러 코드 숫자

- `p` (text-8xl · font-bold · text-muted-foreground/20) — "404" 또는 "500"

#### 에러 제목

- `h1` (text-xl · font-semibold)
  - 404: "페이지를 찾을 수 없습니다"
  - 500: "서버 오류가 발생했습니다"

#### 부가 메시지

- `p` (text-sm · text-muted-foreground)
  - 404: "요청하신 페이지가 존재하지 않거나 이동되었습니다."
  - 500: "잠시 후 다시 시도해주세요."

#### CTA 버튼

- "홈으로" `Button` (variant=default)
  - 인증 상태: → `/qa`
  - 미인증 상태: → `/login`
- (500 전용) "새로고침" `Button` (variant=outline) — `reset()` 호출

#### 오류 ID (500 · 조건부)

- `p.text-xs.text-muted-foreground` — "오류 ID: [error.digest]"
- 렌더 조건: `NODE_ENV === 'development'` 또는 URL `?debug=1` (§14 A-6 · 기본 off)

### 6. 반응형 동작

- 항상 뷰포트 중앙 정렬 · max-w-sm 으로 좌우 여백 자동
- 모바일: px-4 여백 · 버튼 너비 auto (또는 full-width 옵션)
- 큰 숫자: text-8xl → 모바일에서도 동일 (가독성 충분)

### 7. sticky / scroll 동작

- Header: sticky top-0
- 본문: 중앙 정렬 · 스크롤 없음

### 8. 인터랙션 동작

| 대상 | 이벤트 | 반응 |
|---|---|---|
| "홈으로" `Button` | click | 인증 상태에 따라 `/qa` 또는 `/login` `router.push` |
| "새로고침" `Button` (500) | click | `reset()` 호출 → Error Boundary 재시도 |

### 9. 상태

| 상태 | 화면 차이 |
|---|---|
| `not-found` (404) | "404" + "페이지를 찾을 수 없습니다" + "홈으로" 버튼만 |
| `server-error` (500) | "500" + "서버 오류가 발생했습니다" + "새로고침" + "홈으로" 버튼 |
| `server-error.with-debug` | 위 + 오류 ID `p` 추가 |

### 10. 모달 / 드롭다운 / 탭 동작

해당 없음.

### 11. CTA 배치

| 우선순위 | CTA | 위치 | 컴포넌트 |
|---|---|---|---|
| Primary | "홈으로" | 컨테이너 하단 중앙 | `Button`(default) |
| Secondary (500) | "새로고침" | "홈으로" 위 (또는 옆) | `Button`(outline) |

---

## 부록 · 화면 간 상태 연동 요약

### Header Badge 와 SC-01 / SC-02 연동

| SC-01 상태 | Header Badge |
|---|---|
| `empty` / `typing` / `success` | variant=secondary "N / 20" |
| `disabled.quota-exceeded` → SC-02 | variant=destructive "0 / 20" |
| quota 로딩 중 | `Skeleton` |

### Toast 발생 화면

| Toast | 발생 조건 | variant |
|---|---|---|
| "로그아웃했습니다." | SC-07 signOut 성공 | default |
| "세션이 만료되었습니다." | SC-01 error.401 | destructive |
| "인증 메일을 재전송했습니다." | SC-05 resend 성공 | default |
| "메일 재전송에 실패했습니다." | SC-05 resend 실패 | destructive |
| "비밀번호가 변경되었습니다." | SC-06 step2 성공 | default |

Toast 는 `app/layout.tsx` 에 글로벌 `<Toaster />` 마운트 — 모든 화면에서 동작.

### 인증 페이지 헤더 minimal 적용 대상

SC-03 (`/login`) · SC-04 (`/auth/callback`) · SC-05 (`/auth/verify-email`) · SC-06 (`/auth/reset-password`) → Header `variant="minimal"` (로고만)
