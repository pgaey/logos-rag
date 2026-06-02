# phase-03: 인증 · UI · LLM 통합 (auth-ui-llm)

> 본 phase 의 모든 SPEC 을 한 파일에 요점/방향성으로 나열합니다.
> *구체적* 작업 내용은 `specs/spec-03-{seq}-{slug}/spec.md` 에서 다룹니다.
>
> 본 문서는 "이번 phase 에서 무엇을 어디까지 할 것인가" 를 한 번에 보기 위한 *업무 지도* 입니다.

## 📋 메타

| 항목 | 값 |
|---|---|
| **Phase ID** | `phase-03` |
| **상태** | Planning |
| **시작일** | 2026-05-20 |
| **목표 종료일** | TBD (학습 페이스) |
| **소유자** | @pgaey |
| **Base Branch** | `phase-03-auth-ui-llm` (opt-in) → **최종 머지 대상: `develop`** |

## 🎯 배경 및 목표

### 현재 상황
phase-01 에서 KJV/WEB 31,102 verse 텍스트 적재 + pgvector 검색 인프라가 완성되었고 (현재 임베딩 3,011/31,102, 매일 무료 tier 로 점진 적재 중), phase-02 에서 한국어 질문 → `searchVerses` → `buildPrompt` → 완성 프롬프트 문자열까지의 흐름이 CLI 와 `POST /api/search` 로 검증 가능한 상태가 되었습니다. 그러나 아직 (a) 실제 사용자가 접근할 수 있는 UI 와 인증이 없고, (b) Gemini Flash 호출이 빠져 있어 프롬프트는 만들어도 답변이 나오지 않습니다. 외부에 공개하려면 두 가지를 함께 메워야 합니다.

### 목표 (Goal)
Supabase Auth 기반 로그인을 갖춘 Next.js App Router 페이지에서 사용자가 한국어 질문을 입력하면, Server Action `askQuestion` 이 phase-02 의 검색·프롬프트 조립 결과를 Gemini Flash 에 투입해 한국어 답변 + 영문 근거 verse 카드를 함께 렌더링하는 엔드투엔드 플로우를 완성한다. 로컬에서 회원가입 → 로그인 → 질문 → 답변·근거 표시까지 손으로 검증 가능한 MVP 가 결과물.

### 성공 기준 (Success Criteria) — 정량 우선
1. 회원가입 → 로그인 → 보호 경로 진입 → 로그아웃 흐름이 로컬 dev 서버에서 **수동 시나리오 PASS**
2. 미인증 상태로 `/qa` 직접 접근 시 `/login` 으로 redirect, 미인증 상태에서 `askQuestion` Server Action 호출 시 **인증 실패 throw** (자동 검증 — action 직접 import 한 unit test)
3. 로그인 상태에서 한국어 질문 입력 시 `askQuestion` Server Action 이 **5~15초 내** 결과 반환, 결과 객체는 `{ answer: string, verses: VerseMatch[] }` 구조 (스모크 테스트)
4. UI 에서 답변 본문 (한국어 텍스트) + 근거 verse 카드 (book chapter:verse + 영문 텍스트) 가 동시에 표시됨 (수동 확인)
5. `src/lib/llm/gemini.ts` 의 unit test PASS (mock 기반)

## 🧩 작업 단위 (SPECs)

> 본 표는 phase 의 *작업 지도* 입니다. SPEC 은 *요점 + 방향성 + 참조* 까지만 적습니다.
> 자세한 spec/plan/task 는 `specs/spec-03-{seq}-{slug}/` 에서 작성합니다.
> sdd 가 `<!-- sdd:specs:start --> ~ <!-- sdd:specs:end -->` 사이를 자동 갱신하므로 마커는 그대로 두세요.

<!-- sdd:specs:start -->
| ID | 슬러그 | 우선순위 | 상태 | 디렉토리 |
|---|---|:---:|---|---|
| `spec-03-01` | supabase-auth-setup | P0 | Merged | `specs/spec-03-01-supabase-auth-setup/` |
| `spec-03-02` | auth-ui-pages | P? | Merged | `specs/spec-03-02-auth-ui-pages/` |
| `spec-03-03` | llm-gemini-client | P? | Merged | `specs/spec-03-03-llm-gemini-client/` |
| `spec-03-04` | qa-server-action | P? | Merged | `specs/spec-03-04-qa-server-action/` |
| `spec-03-05` | qa-page-ui | P? | Active | `specs/spec-03-05-qa-page-ui/` |
| `spec-03-06` | server-only-boundary | P? | Active | `specs/spec-03-06-server-only-boundary/` |
<!-- sdd:specs:end -->

> 상태 허용값: `Backlog` / `In Progress` / `Merged`
> sdd가 ship 시 자동으로 `Merged`로 갱신합니다. `In Progress`는 active spec에 자동 마킹됩니다.

### spec-03-01 — supabase-auth-setup

- **요점**: Supabase Auth 활성화 + `@supabase/ssr` 기반 서버/클라이언트 헬퍼 + proxy (Next.js 16, 구 middleware) 세션 검증
- **방향성**:
  - **공식 문서 우선**: 구현 전 context7 MCP 로 `@supabase/ssr` + Next.js App Router 통합 최신 가이드를 직접 조회하고, 그 권장 디렉토리 구조 (`lib/supabase/server.ts`, `lib/supabase/client.ts`, `proxy.ts`) 를 그대로 따른다. 임의 구조 만들지 않음.
  - Supabase 의 "session" 은 stateless JWT 묶음 (cookie 저장) 으로 Vercel 멀티 인스턴스 / serverless 환경에서 sticky session 없이 동작 — 이 사실을 walkthrough 결정 기록에 명시.
  - 이메일 + 1 개 소셜 provider (Google) 만 활성화. 추가 provider 는 v1 이후.
  - `src/proxy.ts` (Next.js 16 컨벤션, 구 middleware) 는 `/qa` 경로의 세션을 갱신하고 보호.
- **참조**:
  - Supabase 공식: `@supabase/ssr` Next.js App Router quickstart (context7 조회)
  - `node_modules/next/dist/docs/` — proxy / cookies API (AGENTS.md 지침)
- **연관 모듈**: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/proxy.ts`, `src/lib/supabase/proxy.ts`, `.env.local`

### spec-03-02 — auth-ui-pages

- **요점**: 로그인 / 회원가입 / OAuth 콜백 페이지 + 공통 헤더의 로그인 상태 표시
- **방향성**:
  - App Router 페이지: `/login`, `/auth/callback`. 회원가입 폼은 `/login` 안의 탭/토글로 통합 가능.
  - UI 라이브러리: 무거운 디자인 시스템 도입은 보류. 최소 Tailwind + 직접 작성한 폼/버튼 컴포넌트. 향후 v1.5 에서 shadcn/ui 등 검토 가능.
  - 헤더에 로그인 시 이메일 노출 + 로그아웃 버튼. 미인증 시 "로그인" 링크.
- **참조**:
  - spec-03-01 산출물 (`createClient` 헬퍼)
- **연관 모듈**: `app/login/page.tsx`, `app/auth/callback/route.ts`, `app/layout.tsx` (헤더), `src/components/Header.tsx`

### spec-03-03 — llm-gemini-client

- **요점**: `src/lib/llm/gemini.ts` — Gemini Flash 호출 wrapper + 한국어 답변 생성 + unit test
- **방향성**:
  - 기존 `@google/genai` SDK 재사용 (`scripts/embed-bible.ts` 와 동일 패키지).
  - 시그니처: `generateAnswer(prompt: string): Promise<{ answer: string }>` 같은 형태. 입력은 phase-02 의 `buildPrompt` 결과 그대로.
  - 모델 ID, 타임아웃, 재시도(429 시 backoff), 입력 토큰 한도 가드 환경변수화.
  - 외부 API 의존성 — unit test 는 SDK mock 으로 구현 (실제 호출은 통합 테스트에서).
  - 에러 분류: rate limit / 인증 실패 / 네트워크 / unknown → API route 가 적절한 status 로 매핑할 수 있게 throw.
- **참조**:
  - `scripts/embed-bible.ts` — `GoogleGenAI` 사용 패턴
  - Gemini API 문서 (context7 조회) — `models.generateContent` 시그니처
- **연관 모듈**: `src/lib/llm/gemini.ts`, `src/lib/llm/__tests__/gemini.test.ts`

### spec-03-04 — qa-server-action

- **요점**: `src/app/qa/actions.ts` — Server Action `askQuestion(input)` 으로 인증 확인 + 검색 + 프롬프트 조립 + LLM 호출을 묶은 통합 mutation 핸들러
- **방향성**:
  - Next.js 공식 가이드 기준 mutation 은 Server Action 권장 — Route Handler (`/api/qa`) 대신 `'use server'` async function 채택. (`data-security.mdx`, `mutating-data.mdx`)
  - 시그니처: `askQuestion(input: { question: string; k?: number }): Promise<AskResult>` — typed object 인자 (FormData 아님, 클라이언트는 typed payload 로 호출).
  - 결과 타입: `type AskResult = { ok: true; answer: string; verses: VerseMatch[] } | { ok: false; reason: 'unauthorized' | 'invalid-input' | 'rate-limit' | 'unknown' }` (HTTP status 매핑 없음 — 클라이언트가 typed result 분기).
  - 흐름: `src/proxy.ts` 가 1차 세션 갱신, action 안에서 `getUser()` 로 인증 재검증 (defence in depth) → `searchVerses(question, k)` → `buildPrompt(question, verses)` → `generateAnswer(prompt)` → typed 결과 반환.
  - 입력 검증: `question` 비어있음·과도한 길이 → `{ ok: false, reason: 'invalid-input' }`. `k` 기본 5.
  - 에러 분류: 인증 실패 / rate limit / 기타 → typed result. 예외 throw 는 unknown 으로만.
  - 기존 `/api/search` (phase-02) 는 검색 단독 Route Handler 로 유지 — 회귀 보호.
- **참조**:
  - Next.js 공식: `data-security.mdx`, `mutating-data.mdx`, `forms.mdx` (context7 조회)
  - `src/app/api/search/route.ts` — phase-02 검색 API 패턴 (참고용, 본 spec 은 미사용)
  - spec-03-03 산출물 (`generateAnswer`)
- **연관 모듈**: `src/app/qa/actions.ts`, `src/lib/search/cosine.ts`, `src/lib/prompt/template.ts`, `src/lib/llm/gemini.ts`, `src/lib/supabase/server.ts`

### spec-03-05 — qa-page-ui

- **요점**: `/qa` 페이지 — 질문 입력 + 답변·근거 verse 렌더링 (Server Action 직접 호출, 외부 데이터 fetching 라이브러리 미사용)
- **방향성**:
  - `src/app/qa/page.tsx` — proxy 보호된 RSC. 내부에 질문 폼용 client component 한 개 임포트.
  - `src/app/qa/QaForm.tsx` (`'use client'`) — `useActionState(askQuestion, initial)` 로 action 호출, `useFormStatus().pending` 으로 로딩 표시.
  - TanStack Query 등 외부 fetching 라이브러리 도입하지 않음 — Server Action + `useActionState` 만으로 충분. 채팅 히스토리 / 폴링 같은 요구 등장하면 v1.5 에 검토.
  - 결과 분기: `state.ok === true` → 답변 본문 + verse 카드 목록 렌더링. `state.ok === false` → reason 별 인라인 메시지 (`'rate-limit'` 등).
  - 빈 입력 가드는 client 측 disabled + action 측 typed `'invalid-input'` 이중 방어.
  - verse 카드는 `book chapter:verse` 라벨 + 영문 텍스트. 클릭 시 펼침/접힘 같은 인터랙션은 v1 이후.
- **참조**:
  - spec-03-04 산출물 (`askQuestion`, `AskResult`)
  - Next.js 공식: `mutating-data.mdx`, `forms.mdx`, `useActionState` / `useFormStatus` API (context7)
- **연관 모듈**: `src/app/qa/page.tsx`, `src/app/qa/QaForm.tsx`, `src/components/AnswerView.tsx`, `src/components/VerseCard.tsx`

## 📌 결정 기록 (Review)

> Phase PR review 중 발생한 결정·합의·발견을 누적합니다. Spec walkthrough 의 결정 기록과 동일 패턴이며 Phase 레벨 living decision log 역할 (→ agent.md §6.3.2).

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 인증 토큰 저장 방식 | Cookie session / Bearer JWT header | **Cookie session (`@supabase/ssr`)** | Server Component / proxy 가 인증 상태를 알아야 하고, refresh 자동화 필요. JWT 자체는 stateless 라 Vercel 멀티 인스턴스 무관. |
| `/api/search` 처리 | LLM 포함으로 확장 / LLM 없는 검색 전용 유지 | **유지, 신규 `askQuestion` Server Action 추가** | phase-02 의 통합 시나리오 (검색 단독) 가 회귀 가능. 책임 분리. |
| UI 라이브러리 | shadcn / Mantine / 자체 | **자체 (Tailwind + 직접 작성)** | v1 범위. 디자인 시스템 도입은 사용자 수 늘기 전엔 ROI 음수. |
| 소셜 provider 범위 | Google only / Google+GitHub / 다수 | **Google 1 개** | 학습용 MVP. 추가는 v1.5. |
| QA mutation 스타일 | Route Handler (`/api/qa`) / Server Action (`actions.ts`) | **Server Action** | Next.js 공식 가이드 (`data-security.mdx`, `mutating-data.mdx`) 가 form mutation 에 Server Action 권장. 외부 consumer 없고 RSC 통합 자연스러움. 2026-05-27 phase-03 alignment 중 결정. |
| 요청 인터셉터 | middleware (deprecated) / proxy | **proxy** | Next.js 16+ 에서 `middleware.ts` → `proxy.ts` rename. 이미 `src/proxy.ts` 채택 상태. nodejs runtime 고정 (edge 미지원) — 본 프로젝트는 Supabase SSR 만 쓰므로 영향 없음. |
| 클라이언트 fetching 라이브러리 | TanStack Query 도입 / 미도입 | **미도입** | Server Action + `useActionState` 만으로 phase-03 요구 (단발 mutation) 충족. 폴링 / 무한 스크롤 / 채팅 히스토리 등장 시 v1.5 검토. |

## 🧪 통합 테스트 시나리오 (간결)

> 본 phase 의 Done 조건 중 하나. 시나리오 1·3 은 자동 테스트, 시나리오 2 는 사람 손 검증.
> **현재 임베딩 적재 상태**: 3,011 / 31,102 verse (Genesis·Exodus 완료 + Leviticus 1~11). 매일 FF 로 +1,000 씩 점진 증가 중 — phase-03 답변 품질은 임베딩 진척에 부분 의존.

### 시나리오 1: 인증 흐름 (수동 + 일부 자동)
- **Given**: dev 서버 실행, Supabase Auth 활성화
- **When**: 신규 이메일로 회원가입 → 메일 확인 → 로그인 → `/qa` 접근 → 로그아웃 → `/qa` 재접근
- **Then**:
  - 로그인 후 `/qa` 접근 OK
  - 로그아웃 후 `/qa` 접근 시 `/login` 으로 redirect (proxy 가 차단)
  - 미인증 상태에서 `askQuestion` Server Action 직접 호출 시 `{ ok: false, reason: 'unauthorized' }` 반환 (unit/integration test)
- **연관 SPEC**: spec-03-01, spec-03-02

### 시나리오 2: 엔드투엔드 QA (수동)
- **Given**: 로그인된 세션, 임베딩이 적재된 범위 (Genesis·Exodus 등) 의 한국어 질문
- **When**: `/qa` 페이지에서 "천지창조에 대해 알려줘" 입력 후 제출
- **Then**:
  - 5~15초 내 응답 도착
  - 답변 본문이 한국어
  - 근거 verse 카드 3~5건이 영문으로 표시되며 답변 내용과 의미적으로 연결됨
- **연관 SPEC**: spec-03-03, spec-03-04, spec-03-05

### 시나리오 3: Server Action 스모크 테스트 (자동)
- **Given**: 로컬 Supabase 세션 (테스트 fixture), Gemini API quota 가용
- **When**: `pnpm exec tsx scripts/smoke-qa.ts` — `askQuestion` Server Action 을 직접 import 해서 `{ question: '천지창조', k: 5 }` 로 호출
- **Then**: 결과가 `{ ok: true, answer: string (non-empty), verses: VerseMatch[] (length 5) }` 구조
- **연관 SPEC**: spec-03-04

### 통합 테스트 실행
```bash
# 자동 시나리오만
pnpm test                          # unit (gemini mock, action handler)
pnpm exec tsx scripts/smoke-qa.ts  # 시나리오 3 (별도 작성 예정)

# 수동 시나리오 (사람 손)
pnpm dev
# → http://localhost:3000 에서 시나리오 1·2 진행
```

## 🔗 의존성

- **선행 phase**: `phase-02` (`searchVerses`, `buildPrompt`, `/api/search` 패턴)
- **외부 시스템**:
  - Supabase (Auth + pgvector — read-only 검색은 phase-02 그대로)
  - Google AI Studio (Gemini Flash — 답변 생성용. 기존 embedding key 와 동일 프로젝트 사용 가능)
- **연관 ADR**: 없음 (단, spec-03-01 결과에 따라 "Auth 토큰 저장 방식" 을 ADR 로 승격 가능)

## 📝 위험 요소 및 완화

| 위험 | 영향 | 완화책 |
|---|---|---|
| `@supabase/ssr` + Next.js 16 (proxy 컨벤션) 권장 패턴이 학습 데이터 stale | 잘못된 구조로 구현 → 재작업 | spec-03-04/05 첫 task 로 context7 공식 가이드 직접 조회 후 구조 결정. AGENTS.md 지침 준수. |
| Gemini Flash API 무료 tier 한도 / 응답 시간 | 데모 중 429 또는 long polling | spec-03-03 wrapper 에서 timeout + backoff. UI 는 로딩 스피너 + "잠시만요" 안내. |
| 임베딩 진척률이 낮아 (~10%) 답변 품질 편차 | 답변이 "모르겠습니다" 로 자주 끝남 | 시나리오 2 는 임베딩 완료 범위(Genesis·Exodus) 한정 질문으로 검증. UI/플로우 자체는 임베딩과 무관하게 PASS 가능. |
| 보호 경로가 proxy 만으로 부족 (defence in depth) | Server Action 단에서 인증 우회 | `askQuestion` 안에서 `getUser()` 한 번 더 검증. |
| Server Action + Supabase auth 통합 패턴이 처음 도입 | `useActionState` / `useFormStatus` 패턴 시행착오 | spec-03-04 첫 task 로 공식 가이드 (`mutating-data.mdx`, `forms.mdx`) 조회 후 시그니처 결정. |

## 🏁 Phase Done 조건

- [ ] 모든 SPEC 이 `phase-03-auth-ui-llm` 로 merge (2/5 — spec-03-01·02 완료)
- [ ] `phase-03-auth-ui-llm` 가 `develop` 으로 merge (`/hk-phase-ship` 시)
- [ ] 시나리오 1 인증 흐름 자동·수동 모두 PASS
- [ ] 시나리오 2 엔드투엔드 QA 수동 OK (사용자 확인)
- [ ] 시나리오 3 Server Action 스모크 테스트 PASS
- [ ] 사용자 최종 승인

## 📊 검증 결과 (phase 완료 시 작성)

<!-- 통합 테스트 로그, 성공 기준 측정값, 회귀 점검 결과 등을 여기 첨부 -->
