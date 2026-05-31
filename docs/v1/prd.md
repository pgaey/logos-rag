# logos-rag · v1 PRD (비즈니스 로직)

| 항목 | 값 |
|---|---|
| **버전** | v1.0 |
| **작성일** | 2026-05-27 |
| **작성자** | 본인 (1인 풀스택) |
| **릴리즈 목표** | 2026 Q3 (포트폴리오 공개) |
| **이 문서의 책임** | 비즈니스 로직 · 제품 결정 · 운영 규칙 |
| **담당하지 않는 영역** | 시각 디테일 → `design.md` / `ui-rules.md` · 화면별 레이아웃 → `structure.md` · DB 스키마 → `database/draft-schema.md` · 화면 흐름 → `flows/*.md` |

---

## 목차

1. [프로젝트 정의](#1-프로젝트-정의)
2. [핵심 가치 및 JTBD](#2-핵심-가치-및-jtbd)
3. [페르소나](#3-페르소나)
4. [운영 모델](#4-운영-모델)
5. [사용자 Role 정의](#5-사용자-role-정의)
6. [v1 범위 (In-scope / Out-of-scope)](#6-v1-범위)
7. [화면 인벤토리](#7-화면-인벤토리)
8. [비즈니스 규칙](#8-비즈니스-규칙)
9. [시스템 · 외부 의존 제약](#9-시스템--외부-의존-제약)
10. [성공 지표](#10-성공-지표)
11. [Open Questions](#11-open-questions)

---

## 1. 프로젝트 정의

| 항목 | 내용 |
|---|---|
| **프로젝트명** | logos-rag |
| **성격** | 풀스택 RAG 포트폴리오 (개인 프로젝트) |
| **1차 릴리즈 목표** | 9 화면 (SC-01 ~ SC-09) UI 완성 + Next.js 16 App Router 배포 |
| **릴리즈 시기** | 2026 Q3 |
| **개발 단계** | phase-03 (auth UI, 진행 중) + phase-04 (quota UI, 예정) |
| **현재 브랜치** | `spec-03-02-auth-ui-pages` |

logos-rag 는 "성경 구절을 어떻게 찾을까?"라는 탐색 문제를 의미 검색으로 재정의한 풀스택 RAG 포트폴리오다.

- 사용자가 한국어로 질문하면 WEB(World English Bible) 31,102개 verse 전체를 대상으로 cosine 유사도 검색을 수행한다.
- 검색된 verse 를 컨텍스트로 삼아 Gemini Flash 가 한국어 답변을 생성한다.
- 한국어 질문과 영문 성경 텍스트 사이의 언어 장벽을 임베딩 공간에서 허물어 크로스링궐 검색을 실현한다.

**스택**: Next.js 16 App Router · Supabase (Postgres + pgvector + Auth) · Gemini text-embedding-004 + Flash · Vercel

---

## 2. 핵심 가치 및 JTBD

### 핵심 가치 명제

> **신학적 권위를 주장하지 않는 검색 + 요약 도구**

v1 의 가치 제안은 한 문장으로 완결된다. "나는 AI 다. 성경 구절의 의미를 검색하고 요약한다. 해석의 권위는 없다."

### JTBD (Job-to-be-Done)

> **"한국어로 던진 질문에 대해 영문 성경의 의미상 유사한 구절들을 근거로 한 한국어 답변을 받는다 — 신학적 권위가 아니라 검색 + 요약 도구로서."**

**왜 한국어로 질문하는가?** 한국어 사용자가 자신의 언어로 자연스럽게 질문할 수 있어야 한다. 번역 부담을 도구가 흡수한다.

**왜 영문 성경인가?** WEB(World English Bible)은 100% 퍼블릭 도메인이고, 31,102개 verse 가 768차원 임베딩으로 적재되어 있다. 영문 원문 그대로 근거로 인용함으로써 출처 투명성을 확보한다.

**왜 LLM 답변인가?** 코사인 검색 결과는 verse 리스트일 뿐이다. 검색된 구절들을 연결하고 질문의 맥락에 맞게 설명하는 단계가 있어야 사용자가 읽을 수 있는 답변이 된다. Gemini Flash 가 조합·요약 레이어를 담당한다.

---

## 3. 페르소나

페르소나 우선순위: **a > b > c**

| ID | 페르소나 | 역할 | v1 에서의 핵심 기대 |
|---|---|---|---|
| **a** | 포트폴리오 데모 리뷰어 | 면접관 · 기술 리뷰어 · 채용 담당자 | 5초 안에 "AI 성경 검색·답변 도구" 임을 인지 · 1분 안에 가입 → 질문 → 답변 흐름 완료 |
| **b** | 신앙인 일반 | 큐티/묵상/예배 준비 중 질문을 들고 오는 사용자 | 정중한 답변 톤 + 가독성 있는 verse 인용 + 자연스러운 면책 표기로 거부감 없이 사용 |
| **c** | 신학생 / 연구자 | 특정 주제어로 영문 원문을 비교하려는 사용자 | verse 카드에서 영문 원문 + `Book Chapter:Verse` 라벨 확인 · 유사도 점수는 토글로 노출 (default 숨김) |

### 페르소나 위계가 제품 결정에 반영되는 방식

- **첫 진입 (a 최적화)**: 온보딩 / 설명 없이 질문 입력창이 바로 중앙. placeholder 한 줄로 제품 성격 + 입력 방식 동시 전달.
- **답변 렌더링 (b·c 포용)**: 상단 한국어 답변 본문, 하단 영문 근거 verse 카드 5건. b 는 답변만 읽어도 만족, c 는 verse 카드에서 원문·라벨 확인.
- **톤**: 차분 · 미니멀 · 텍스트 위주. 종교적 감수성을 고려해 과도한 색 강조 / 장식 배제.
- **UI 카피**: "하나님", "하느님" 같은 종교적 표현은 UI 카피에 등장하지 않는다. AI 생성 답변 본문 안에서만 Gemini 출력 그대로 나타날 수 있다.

---

## 4. 운영 모델

### 4.1 단일 앱 구조

v1 은 단일 Next.js 16 앱 안에 Auth + RAG 를 함께 둔다. 인증 포털(`auth.example.com`)과 RAG 앱(`logos.example.com`) 분리는 v1.5 이후 과제.

### 4.2 Stateless 답변

**v1 에서 답변은 stateless 다.**

- 질문이나 답변을 DB 에 영구 저장하지 않는다.
- 답변 영역은 "최근 1건" 만 표시한다. 새 질문 제출 시 덮어쓴다.
- 히스토리 / 즐겨찾기 / 공유 링크는 모두 Out-of-scope.

### 4.3 1인 운영

관리자 / 분석 대시보드 없음. 본인(개발자)은 Supabase Dashboard + Vercel Dashboard 로 직접 운영한다.

### 4.4 데이터 흐름 요약

```
Browser
  │ HTTPS
  ▼
Vercel Edge / Serverless
  ├─ proxy.ts       → 보호 경로 /qa 인증 검사 · 미인증 시 307 /login
  ├─ RSC / Page     → Supabase getUser() · UI 분기
  ├─ Server Action  → Supabase Auth (signUp / signIn / reset / signOut)
  └─ Route Handler /api/qa
       ├─ 1) Supabase getUser() · 세션 확인 (defence-in-depth)
       ├─ 2) Gemini embedContent (질문 → 768d vector)
       ├─ 3) Supabase rpc('match_verses', { query_embedding, k=5 })
       ├─ 4) Gemini generateContent (프롬프트 + verse 컨텍스트)
       └─ 5) Response { answer, verses[] }
```

---

## 5. 사용자 Role 정의

### 5.1 Role 매트릭스

| Role ID | Role 명 | 설명 |
|---|---|---|
| **ANONYMOUS** | 미인증 사용자 | `/login` / `/auth/callback` / `/auth/verify-email` / `/auth/reset-password` 접근 가능. `/qa` 접근 시 307 redirect. |
| **AUTHENTICATED** | 인증된 사용자 | Supabase 세션 보유. `/qa` 접근 가능 · 질문 / 답변 흐름 이용 · 일일 한도 (20회 / 일) 적용. |
| **SUPABASE_SERVICE** | 서버측 service role | `match_verses` RPC 호출 · `user_quota` 갱신. 사람 사용자가 아님. |

⚠️ v1 은 ADMIN / DIRECTOR 같은 운영자 Role 없음.

### 5.2 화면 × Role 접근 권한

| 화면 ID | 화면명 | ANONYMOUS | AUTHENTICATED |
|---|---|---|---|
| SC-01 | QA 메인 | — (`/login` 307) | Full |
| SC-02 | QA · 일일 한도 초과 | — | Full (한도 소진 시 자동 진입) |
| SC-03 | 로그인 / 회원가입 | Full | — (`/qa` 307) |
| SC-04 | OAuth/매직링크 콜백 | Full (콜백 자체가 인증 전환 과정) | Full → 즉시 `/qa` redirect |
| SC-05 | 이메일 인증 안내 | Full | — (`/qa` 307) |
| SC-06 | 비밀번호 재설정 (2-step) | Full | Full (자기 비밀번호 재설정 시) |
| SC-07 | 전역 헤더 | 미인증 분기 (로그인 버튼) | 인증 분기 (Badge + DropdownMenu) |
| SC-08 | 전역 푸터 | Full | Full |
| SC-09 | 404 / 500 폴백 | Full | Full |

### 5.3 권한 검사 규칙

1. 모든 보호 경로 (`/qa`) 는 `proxy.ts` 가 Supabase 세션 쿠키를 검사한 뒤 통과 / redirect 결정.
2. Route Handler (`/api/qa`) 는 defence-in-depth 로 `supabase.auth.getUser()` 를 재검증 (proxy 통과 = 세션 유효 보장이 아님).
3. 모든 Server Action 은 호출 직전 `supabase.auth.getUser()` 로 사용자 확인.
4. 클라이언트 useEffect 의 redirect 는 단독 사용 금지 (UX 보조용 only).

---

## 6. v1 범위

### 6.1 In-scope · 핵심 사용자 화면 (P0)

| ID | 화면명 | 우선순위 | 핵심 요약 |
|---|---|---|---|
| SC-01 | QA 메인 | P0 | 한국어 질문 → 답변 + verse 5건. 포트폴리오 데모 핵심. |
| SC-02 | QA · 일일 한도 초과 | P0 | SC-01 의 sub-state. 한도 초과 배너 + disabled 입력. 별도 URL 없음. |
| SC-03 | 로그인 / 회원가입 | P0 | Tabs + 이메일·비밀번호 폼 + Google OAuth. 인증 진입 단일 경로. |
| SC-04 | OAuth/매직링크 콜백 | P0 | 서버측 토큰 교환 + Set-Cookie + redirect. 사용자 노출 0~1초. |
| SC-05 | 이메일 인증 안내 | P0 | 회원가입 직후 진입. 안내 카드 + 60초 쿨다운 재전송. |
| SC-06 | 비밀번호 재설정 (2-step) | P0 | Step 1: 이메일 입력 → Step 2: 새 비밀번호. 동일 경로 분기. |

### 6.2 In-scope · 공통 / 시스템 화면

| ID | 화면명 | 우선순위 | 핵심 요약 |
|---|---|---|---|
| SC-07 | 전역 헤더 | P0 | 로고 + 잔여 한도 Badge + DropdownMenu. 인증 상태별 분기. |
| SC-08 | 전역 푸터 | P0 | 면책 한 줄 + GitHub 링크 + 버전. 모든 페이지 고정. |
| SC-09 | 404 / 500 폴백 | P1 | 큰 숫자 + 카피 + "홈으로" CTA. |

### 6.3 Out-of-scope

| 기능 | 제외 이유 | 처리 방향 |
|---|---|---|
| 답변 히스토리 / 즐겨찾기 | v1 stateless 흐름 | v1.5 |
| 답변 공유 / 영구 링크 (`/qa/[id]`) | DB 영구 저장 안 함 | v1.5 |
| AI 응답 스트리밍 (SSE) | 일괄 표시로 충분 | v1.5 검토 |
| v1.5 SSO 분리 (인증 포털 + RAG 앱 도메인 분리) | v1 단일 앱 | v1.5 |
| 다국어 UI (영문 / 일문 등) | v1 한국어 단일 | v2 |
| 한글 책 이름 번역 (창세기 / 출애굽기 등) | WEB 영문 원문 유지 | v2 |
| v2 엔티티 카드 (인물·장소·사건 별도 카드) | LLM 구조화 추출 미구현 | v2 |
| v3 관계 그래프 (react-flow / vis.js) | UX 우선순위 낮음 | v3 |
| 결제 / 유료 플랜 | v1 무료 일일 20회 | 미정 |
| 모바일 네이티브 앱 | 웹 반응형 only | 미정 |
| 관리자 / 분석 대시보드 | 1인 운영 / 통계 도구 불필요 | 미정 |
| 유사도 점수 강제 노출 | default 숨김, 노출 시 페르소나 a 노이즈 | 토글 옵션 (페르소나 c) |
| 다크 모드 토글 버튼 | 시스템 prefers-color-scheme 자동 따름 | v1.5 검토 |
| shadcn/ui 외 디자인 시스템 혼용 | 일관성 | 영구 비목표 |

---

## 7. 화면 인벤토리

### 7.1 화면 ID 네이밍 규칙

- 형식: `SC-NN` (Screen + 일련번호)
- SC-01 ~ SC-06: 사용자 운영 화면 (인증 + QA)
- SC-07 ~ SC-09: 공통 / 시스템 화면 (헤더 · 푸터 · 폴백)

### 7.2 화면 인벤토리 표

| ID | 화면명 | 경로 | 인증 필요 | 우선순위 | 한 줄 요약 |
|---|---|---|---|---|---|
| **SC-01** | QA 메인 | `/qa` | O | P0 | 한국어 질문 입력 → AI 답변 + verse 5건 출력. 포트폴리오 데모의 핵심 화면. |
| **SC-02** | QA · 일일 한도 초과 | `/qa` (sub-state) | O | P0 | SC-01 의 인라인 sub-state. 한도 소진 배너 + 입력 disabled + 리셋 시각 안내. |
| **SC-03** | 로그인 / 회원가입 | `/login` | X | P0 | 이메일·비밀번호 Tabs + Google OAuth. URL `?tab=signup` 으로 초기 탭 결정. |
| **SC-04** | OAuth/매직링크 콜백 | `/auth/callback` | — | P0 | 서버측 토큰 교환 후 즉시 redirect. 사용자 노출 최소화. 에러 시 폴백 UI. |
| **SC-05** | 이메일 인증 안내 | `/auth/verify-email` | X | P0 | 회원가입 직후 진입. 메일 확인 안내 + 60초 쿨다운 재전송 버튼. |
| **SC-06** | 비밀번호 재설정 | `/auth/reset-password` | X | P0 | 동일 경로에서 Step 1(이메일 입력) → Step 2(새 비밀번호)로 2단계 분기. |
| **SC-07** | 전역 헤더 | 모든 페이지 | — | P0 | 로고 + 인증 상태별 분기. 인증 시 잔여 한도 Badge + DropdownMenu(로그아웃). |
| **SC-08** | 전역 푸터 | 모든 페이지 | — | P0 | AI 면책 한 줄 + GitHub 링크 + 버전 표기. 항상 동일. |
| **SC-09** | 404 / 500 폴백 | 폴백 경로 | — | P1 | 존재하지 않는 경로(404) 또는 서버 오류(500) 시 표시. "홈으로" CTA. |

### 7.3 진입 매트릭스

| 진입 URL | ANONYMOUS | AUTHENTICATED | 비고 |
|---|---|---|---|
| `/` | `/qa` → `/login` 307 | `/qa` 307 | 루트는 별도 화면 없음 |
| `/qa` | `/login` 307 | SC-01 | proxy.ts 보호 매처 |
| `/qa` (한도 소진) | — | SC-02 sub-state | `/api/qa` 429 후 인라인 전환 |
| `/login` | SC-03 | `/qa` 307 | 이미 로그인된 상태 |
| `/login?tab=signup` | SC-03 (signup 탭 활성) | `/qa` 307 | URL 쿼리로 초기 탭 결정 |
| `/auth/callback?code=...` | SC-04 → 토큰 교환 → `/qa` | `/qa` 307 | OAuth + 매직링크 공통 |
| `/auth/callback?type=recovery&code=...` | 토큰 교환 → SC-06 step 2 | 동일 | recovery 분기 |
| `/auth/verify-email` | SC-05 | `/qa` 307 | 회원가입 직후 진입 |
| `/auth/reset-password` | SC-06 step 1 | 동일 (자기 비번 재설정) | 인증 무관 접근 허용 |
| `/auth/reset-password?step=2` | SC-06 step 2 (임시 세션) | 동일 | recovery 토큰 보유 시만 정상 |
| 없는 경로 | SC-09 (404) | 동일 | Next.js `not-found.tsx` |
| 서버 오류 | SC-09 (500) | 동일 | Next.js `error.tsx` |

### 7.4 화면 간 전환 관계

```
SC-03 ──── 로그인 성공 ─────────────────────→ SC-01
SC-03 ──── 회원가입 성공 ────────────────────→ SC-05
SC-03 ──── Google OAuth 클릭 ────────────────→ SC-04
SC-03 ──── 비밀번호 잊음 클릭 ───────────────→ SC-06
SC-05 ──── 메일 인증 링크 클릭 ──────────────→ SC-04
SC-04 ──── 토큰 정상 처리 ───────────────────→ SC-01
SC-04 ──── recovery 토큰 처리 ───────────────→ SC-06
SC-06 ──── 재설정 메일 링크 클릭 ────────────→ SC-04
SC-06 ──── 비밀번호 변경 완료 ───────────────→ SC-03
SC-01 ···· 429 응답 ────────────────────────→ SC-02 (sub-state)
SC-02 ···· 자정 리셋 후 새로고침 ────────────→ SC-01
SC-07 ──── 로그아웃 ──────────────────────────→ SC-03
```

---

## 8. 비즈니스 규칙

### 8.1 일일 한도

| 규칙 | 내용 |
|---|---|
| 한도 횟수 | 인증 사용자 1인당 일일 20회 |
| 카운트 대상 | `POST /api/qa` 응답 200 (정상 답변 생성 완료) 기준 |
| 리셋 시각 | 한국 시각 자정 (KST 00:00) |
| 한도 초과 응답 | HTTP 429 `{ error: { code: "daily_limit_exceeded", reset_at: ISO8601 } }` |
| 구현 시점 | phase-04 (`user_quota` 테이블). phase-03 에서는 Gemini API 자체 429 를 임시 UI 로만 처리. |
| 미인증 사용자 | `/qa` 접근 자체가 차단 (proxy.ts). 한도 비적용. |

### 8.2 질문 입력 제약

| 규칙 | 내용 |
|---|---|
| 최소 길이 | 1자 이상 (빈 입력 불가 · Submit disabled) |
| 최대 길이 | 500자 |
| 서버 재검증 | 클라이언트 검증과 별개로 Route Handler 에서 길이 재검증 |
| k 값 (top-K) | 기본 5, 범위 1~10. 사용자 입력 없음 (클라이언트 고정) |

### 8.3 인증 규칙

| 규칙 | 내용 |
|---|---|
| 비밀번호 최소 길이 | 8자 이상 (클라이언트 + 서버 모두 검증) |
| 이메일 인증 | 회원가입 후 이메일 인증 필수. 미인증 상태로 로그인 시도 시 `email_not_verified` 에러. |
| 이메일 존재 여부 노출 | 통일 응답 — 미가입 이메일로 재설정 요청 시에도 "메일 보냈습니다"만 노출 (이메일 존재 여부 노출 방지). |
| 재설정 링크 만료 | Supabase 기본 1시간 |
| 인증 메일 재전송 쿨다운 | 60초. 클라이언트 카운트다운 + 버튼 disabled. 새로고침 시 초기화 (v1). |
| 비밀번호 변경 후 세션 | Supabase 가 기존 세션 모두 자동 무효화 |

### 8.4 에러 코드 표준

| code | HTTP | 한국어 사용자 메시지 | 발생 화면 |
|---|---|---|---|
| `unauthorized` | 401 | "로그인이 필요합니다" | 보호 경로 / `/api/qa` |
| `invalid_credentials` | 401 | "이메일 또는 비밀번호가 올바르지 않습니다" | SC-03 |
| `email_not_verified` | 403 | "이메일 인증이 완료되지 않았습니다" | SC-03 |
| `email_already_registered` | 409 | "이미 가입된 이메일입니다" | SC-03 |
| `token_expired` | 401 | "링크가 만료되었습니다" | SC-04 / SC-06 |
| `token_invalid` | 401 | "유효하지 않은 링크입니다" | SC-04 / SC-06 |
| `validation_error` | 400 | 필드별 카피 (인라인) | SC-01 / SC-03 / SC-06 |
| `daily_limit_exceeded` | 429 | "오늘의 사용량을 모두 사용했습니다" | SC-01 → SC-02 |
| `llm_error` | 502 | "답변 생성 중 오류가 발생했습니다" | SC-01 |
| `db_error` | 500 | "일시적인 오류가 발생했습니다" | SC-01 |
| `network_error` | (클라이언트) | "네트워크 연결을 확인해주세요" | 모든 화면 |
| `not_found` | 404 | "페이지를 찾을 수 없습니다" | SC-09 |

### 8.5 면책 표기 규칙

면책 문구는 다음 두 위치에 고정 노출한다:

1. **SC-08 전역 푸터** — 모든 페이지 하단에 항상 노출.
2. **SC-01 답변 카드 하단** — AI 답변이 표시되는 영역 내부에 추가 노출.

정확한 문구: **"이 답변은 AI가 생성하며 신학적 권위를 갖지 않습니다."**

### 8.6 verse 인용 표기 컨벤션

| 규칙 | 내용 |
|---|---|
| 라벨 포맷 | `Book Chapter:Verse` (공백 1개, 콜론, 공백 없음). 예: `Genesis 1:1` |
| 책 이름 | WEB 영문 원문 그대로 (Genesis, Exodus 등). 한글 번역명 없음 (v2 이후). |
| 유사도 점수 | default 숨김. `?debug=1` URL 파라미터 또는 토글 활성 시에만 노출. |

### 8.7 보안 정책

| 항목 | 정책 |
|---|---|
| 인증 검증 위치 | proxy.ts + RSC + Route Handler + Server Action 4 지점 모두 |
| 세션 쿠키 | httpOnly + Secure (Supabase 기본) · TLS 1.3 (Vercel 자동) |
| 클라이언트 redirect 단독 사용 금지 | useEffect redirect 는 UX 보조용 only |
| Google OAuth redirect URL | Supabase Dashboard 화이트리스트 |

---

## 9. 시스템 · 외부 의존 제약

### 9.1 기술 스택

| Layer | 기술 | 역할 |
|---|---|---|
| **Client** | Next.js 16 App Router (RSC + Client Component) | 9 화면 렌더링 · 폼 · 답변 표시 |
| **Edge/Server** | Next.js proxy.ts | 보호 경로 `/qa` 인증 검사 · 미인증 시 307 |
| **Server** | Route Handler `/api/qa/route.ts` | 세션 검증 · 임베딩 · pgvector 검색 · LLM · 응답 |
| **Server** | Route Handler `/auth/callback/route.ts` | OAuth / 매직링크 / recovery 토큰 교환 후 redirect |
| **Server** | Server Action (`_actions.ts`) | 이메일 Auth 흐름 (signUp / signIn / reset / signOut) |
| **Auth** | Supabase Auth | 이메일·비밀번호 + Google OAuth · 세션(JWT) · 쿠키 관리 |
| **DB** | Supabase Postgres + pgvector | `verses` (31,102 row · 768d) · `user_quota` (phase-04) |
| **External** | Google AI Studio (Gemini) | text-embedding-004 (768d) + gemini-2.0-flash (답변) |
| **Hosting** | Vercel | Next.js 16 배포 · Edge / Serverless 자동 분기 |

### 9.2 제약 조건

| 항목 | 내용 | 영향 |
|---|---|---|
| **응답 latency** | 5~15초 (embed → match → generate 합산). phase-02 에서 측정 완료. | SC-01 loading state 가 최소 5초 이상 보임. Skeleton + "5~15초 소요" 텍스트 필수. |
| **Gemini 무료 quota** | RPM / RPD 한도 있음 (Google AI Studio 무료 티어) | 자체 일일 20회 한도(SC-02)와 별개로 Gemini 자체 429 발생 가능. 두 경우를 UI 에서 구분 처리. |
| **Supabase 무료 티어** | 프로젝트당 월 500MB DB, 50,000 MAU | v1 포트폴리오 트래픽 (페르소나 a 데모 · 동시 1~5명) 에서는 제한에 도달하지 않을 것으로 판단. |
| **동시 접속** | 페르소나 a 데모 시점 동시 1~5명 가정 | 별도 동시성 제어 없음. |
| **브라우저** | 최신 Chrome / Safari / Edge / Firefox 대상. 서드파티 쿠키 차단 환경 주의. | SC-04 콜백 처리 중 쿠키 설정 실패 시 에러 안내 필요. |
| **다국어** | 한국어 UI 단일. 영문 verse 본문 / 라벨 예외. | v1 확정 결정. UI 크롬 전체 한국어. |
| **멀티테넌트** | 없음 (단일 인스턴스 · 사용자별 quota 만 분리) | — |

### 9.3 phase-03 vs phase-04 구현 경계

| 항목 | phase-03 (현재) | phase-04 (예정) |
|---|---|---|
| `user_quota` 테이블 | 미구현 | 구현 |
| 일일 20회 카운트 | Gemini API 자체 429 임시 처리 / 클라이언트 추정 | `user_quota.today_count` 정확 집계 |
| 헤더 Badge 데이터 소스 | 클라이언트 mutation 카운트 또는 "20 / 20" 표시 | GET `/api/quota` API |
| 자정 리셋 메커니즘 | 없음 | DB cron / Vercel cron / 클라이언트 재조회 중 결정 |

---

## 10. 성공 지표

### 10.1 포트폴리오 데모 기준 (페르소나 a)

| 지표 | 목표값 | 측정 방법 |
|---|---|---|
| 첫 인지 시간 | 5초 이내에 "AI 성경 검색·답변 도구" 임을 인지 | SC-01 첫 화면 스크롤 없이 질문 입력창 + 답변 자리표 + 면책 한 줄 보임 |
| 가입 → 첫 답변 완료 | 1분 이내 | SC-03 진입 → SC-01 첫 질문 → 답변 수신 흐름 |
| 답변 latency | 15초 이내 | `/api/qa` 응답 시간 (embed + match + generate) |

### 10.2 인증 흐름 기준

| 지표 | 목표값 | 비고 |
|---|---|---|
| 로그인 / 회원가입 성공율 | 에러 없는 정상 경로에서 100% | 올바른 자격증명 기준 |
| 이메일 인증 완료율 | 회원가입 후 인증 링크 클릭 시 세션 발급 100% | SC-04 정상 흐름 |
| 비밀번호 재설정 완료율 | 재설정 링크 클릭 후 새 비밀번호 설정 완료 100% | SC-06 step 2 정상 흐름 |

### 10.3 에러 처리 기준

| 지표 | 목표값 |
|---|---|
| 에러 발생 시 사용자 next action 명확 | 모든 에러 UI 에 한국어 카피 + CTA 표시 |
| 세션 만료 시 자동 복구 | 401 응답 → Toast + `/login` redirect 자동 |
| 한도 초과 시 리셋 시각 명시 | SC-02 에서 KST 자정 초기화 시각 표기 |

---

## 11. Open Questions

PRD 채택 시점에는 잠정 default 로 진행 가능. 디자인 정제 / 구현 단계에서 명시적 결정 권장.

### A. v1 포함 여부 결정 필요

| # | 항목 | 잠정 default | 결정 시 영향 |
|---|---|---|---|
| A-1 | 다크 모드 토글 버튼을 SC-07 헤더에 노출 | **off** — 시스템 `prefers-color-scheme` 만 따름 | 헤더 우측 컴포넌트 1개 추가 |
| A-2 | 답변 히스토리 (최근 3건 접힘) | **off** — 1회 질문 = 1회 답변, 덮어쓰기 | SC-01 답변 영역 구조 변경 |
| A-3 | 응답 스트리밍 (Gemini SSE) | **off** — 전체 응답 한 번에 표시 | SC-01 loading state 가 progressive 로 변경 |
| A-4 | 이용약관 / 개인정보 처리방침 실제 페이지 작성 | **off** — 더미 `#` 링크 | 페이지 2개 추가 |
| A-5 | 모바일 SC-01 sticky 질문 입력 바 | **off** — 일반 inline 입력 | 모바일 레이아웃 변경 |
| A-6 | SC-09 500 페이지 오류 ID 노출 | **off** — 메시지만 표시 | 500 컴포넌트 한 줄 추가 |
| A-7 | Sentry 등 에러 추적 서비스 연동 | **off** — phase-04 이후 검토 | 디자인 영향 없음 |
| A-8 | SC-01 verse 카드 유사도 점수 토글 UI | **off** — default 숨김 · `?debug=1` only | verse 카드 우측 상단 토글 |

### B. 디자인 정제 단계에서 결정

| # | 항목 | 메모 |
|---|---|---|
| B-1 | 인증 페이지(SC-03 ~ SC-06)에서 헤더 / 푸터 표시 여부 | UX 상 미니멀 헤더(로고만) + 면책 푸터 권장 |
| B-2 | 잔여 한도 경고 색상 임계값 | **결정**: design.md `{component.badge-default}` (잔여 ≥ 4: emerald dot) / `{component.badge-default}` dot 없음 (1~3) / `{component.badge-destructive}` (0). amber 미사용 — Supabase 단일 emerald 정책상 추가 액센트 금지. |
| B-3 | 유사도 점수 노출 트리거 (`?debug=1` vs 설정 토글) | 토글이 페르소나 c 에게 친화적 |
| B-4 | 비밀번호 재설정 링크 만료 안내 명시 여부 (Supabase 기본 1시간) | 보안 vs UX 트레이드오프 |
| B-5 | 미가입 이메일 재설정 요청 시 — "메일 보냄" 통일 vs 미가입 안내 | **통일 권장** (이메일 존재 여부 노출 방지). §8.3 참조. |
| B-6 | 메일 도메인별 딥링크 ("Gmail 열기" 등) | v1 범위 외 권장 |
| B-7 | 재전송 쿨다운(60초)을 `localStorage` 에 저장해 새로고침 후 유지 | 구현 부담 작으면 yes |
| B-8 | SC-01 verse 카드 클릭 시 펼침/접힘 인터랙션 | v1.5 이후 권장 |

### C. 외부 의존 / 본인 결정 필요

| # | 항목 | 메모 |
|---|---|---|
| C-1 | SC-08 GitHub 링크 실제 URL | README 기준 `github.com/<owner>/logos-rag` 확인 필요 |
| C-2 | Google 외 추가 OAuth provider (GitHub, Apple 등) 활성화 시점 | phase-03 backlog 결정 |
| C-3 | 로그인 실패 연속 잠금 정책 (Supabase 기본 / 커스텀) | Supabase Dashboard 설정 |
| C-4 | phase-03 에서 헤더 Badge 의 실제 데이터 소스 (`user_quota` 미구현 동안) | 클라이언트 mutation 카운트 / 항상 "20 / 20" / Gemini 429 패스스루 중 선택 |
| C-5 | 자정 리셋 메커니즘 (phase-04) | DB cron / Vercel cron / 클라이언트 재조회 중 선택 |

---

*이 문서는 비즈니스 로직 · 제품 결정 · 운영 규칙만 담는다. 시각 디테일은 `design.md`, 화면별 레이아웃은 `structure.md`, DB 스키마는 `database/draft-schema.md`, 화면 흐름 시퀀스는 `flows/*.md` 가 담당한다.*
