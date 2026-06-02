# logos-rag · v1 Database / API Contract

> **책임 범위**: Supabase Postgres + pgvector + Auth 기준. v1 (phase-03 + phase-04) 스키마 및 API 계약 단일 진실 원천.
>
> **작성일**: 2026-05-27  
> **참조 문서**: `docs/v1-paper-prd.md` (§3 §8 §10 §13), `docs/v1-design-prd.md`  
> **다음 소비자**: Next.js 16 Server Action / Route Handler 구현자 (본인)

---

## 목차

1. [Overview](#1-overview)
2. [테이블 스키마](#2-테이블-스키마)
3. [RPC 함수 (Postgres)](#3-rpc-함수-postgres)
4. [RLS 정책](#4-rls-정책)
5. [API 응답 스키마 (TypeScript interface)](#5-api-응답-스키마-typescript-interface)
6. [에러 코드 표준](#6-에러-코드-표준)
7. [환경 변수 / Secret](#7-환경-변수--secret)
8. [외부 의존](#8-외부-의존)
9. [일일 한도 (Quota) 설계](#9-일일-한도-quota-설계)
10. [마이그레이션 / 시드](#10-마이그레이션--시드)
11. [보안 정책](#11-보안-정책)
12. [Open Questions / 결정 필요](#12-open-questions--결정-필요)

---

## 1. Overview

### 1.1 Supabase 사용 영역

| 영역 | 역할 | 비고 |
|---|---|---|
| **Supabase Auth** | 이메일+비밀번호 가입/로그인, Google OAuth, 이메일 인증, 비밀번호 재설정, JWT 세션 발급/만료 | `@supabase/ssr` 로 쿠키 기반 세션 관리 |
| **Supabase Postgres** | `public.verses` (WEB 성경 31,102 row), `public.user_quota` (phase-04) | Supabase free tier (500MB) |
| **pgvector extension** | `verses.embedding vector(768)` 코사인 유사도 검색 | `match_verses` RPC 사용 |

### 1.2 Next.js 16 Server 와의 연결

| 경계 | 인터페이스 | 비고 |
|---|---|---|
| **Server Action** | `createServerClient()` (supabase/ssr) + `cookies()` | `app/login/_actions.ts` 등 |
| **Route Handler** | `createServerClient()` + `cookies()` | `app/api/qa/route.ts`, `app/auth/callback/route.ts` |
| **Middleware (proxy.ts)** | `createServerClient()` + `NextRequest.cookies` | `/qa` 보호 경로 검사 |
| **RSC (Server Component)** | `createServerClient()` 직접 사용 | 세션 확인 후 redirect 결정 |

모든 서버측 Supabase 클라이언트는 **`SUPABASE_SERVICE_ROLE_KEY` 를 직접 사용하지 않는다**. Route Handler 내 `user_quota` 조작에만 service_role 클라이언트가 필요하며, 해당 경우 명시적으로 서버 내부에서만 사용한다.

### 1.3 v1 stateless 답변 정책

v1 에서 질문과 답변은 **DB 에 영구 저장하지 않는다**. `/api/qa` 요청은 매 호출마다 독립적이며, 응답 후 클라이언트 메모리에만 보관된다 (브라우저 새로고침 시 소멸). 히스토리 / 즐겨찾기 / 공유 링크는 v1.5 이후 범위다.

저장되는 데이터: `user_quota.today_count` 증가 (phase-04 예정).

---

## 2. 테이블 스키마

### 2.1 `auth.users` (Supabase Auth 관리)

Supabase Auth 가 내부적으로 관리하는 테이블. 본 프로젝트가 직접 DDL 을 작성하지 않는다. 참조 컬럼만 명시한다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | `uuid` | 사용자 고유 식별자. `user_quota.user_id` 의 FK 대상 |
| `email` | `text` | 가입 이메일. 헤더 DropdownMenu 표시에 사용 |
| `email_confirmed_at` | `timestamptz \| null` | 이메일 인증 완료 시각. `null` 이면 미인증 |
| `created_at` | `timestamptz` | 가입 시각 |

직접 조회 방법: `supabase.auth.getUser()` (서버 컴포넌트 / Route Handler), Supabase Dashboard.

---

### 2.2 `public.verses`

**역할**: WEB (World English Bible) 전체 31,102 verse 와 768차원 임베딩 저장. phase-01 에서 시드 완료.

#### DDL

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE public.verses (
  verse_id     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  book         text        NOT NULL,   -- "Genesis"
  chapter      integer     NOT NULL,   -- 1
  verse_number integer     NOT NULL,   -- 1
  label        text        NOT NULL,   -- "Genesis 1:1"
  text         text        NOT NULL,   -- "In the beginning God created..."
  embedding    vector(768) NOT NULL,   -- Gemini text-embedding-004 출력
  created_at   timestamptz NOT NULL DEFAULT now()
);
```

#### 컬럼 상세

| 컬럼 | 타입 | Nullable | Default | 설명 |
|---|---|---|---|---|
| `verse_id` | `uuid` | NO | `gen_random_uuid()` | PK |
| `book` | `text` | NO | — | 책 이름 (WEB 영문 원문. 예: `"Genesis"`, `"Revelation"`) |
| `chapter` | `integer` | NO | — | 장 번호 (1 이상 정수) |
| `verse_number` | `integer` | NO | — | 절 번호 (1 이상 정수) |
| `label` | `text` | NO | — | `"Book Chapter:Verse"` 형식. 예: `"Genesis 1:1"` |
| `text` | `text` | NO | — | WEB 영문 본문 |
| `embedding` | `vector(768)` | NO | — | `text-embedding-004` 로 생성한 768차원 float32 벡터 |
| `created_at` | `timestamptz` | NO | `now()` | 시드 삽입 시각 |

#### PK / 인덱스

```sql
-- 기본 PK
PRIMARY KEY (verse_id)

-- ivfflat 코사인 유사도 인덱스 (phase-01 구현)
CREATE INDEX verses_embedding_ivfflat_idx
  ON public.verses
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
-- lists 값은 row 수 sqrt(31102) ≈ 176 기준 100~200 범위에서 선택.
-- phase-01 결정: lists = 100 (현재 적용 중)

-- 복합 Unique 인덱스 (중복 삽입 방지)
CREATE UNIQUE INDEX verses_book_chapter_verse_idx
  ON public.verses (book, chapter, verse_number);
```

> **ivfflat vs hnsw 결정 사항**: §12 Open Questions Q-1 참조.

#### RLS 정책

```sql
-- verses 는 인증 여부 무관 읽기만 허용.
-- 쓰기(INSERT / UPDATE / DELETE)는 service_role 만 가능.
ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verses_read_all"
  ON public.verses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT / UPDATE / DELETE: RLS 정책 없음 → service_role 만 가능
```

#### 예상 row 수 / 변경 빈도

| 항목 | 값 |
|---|---|
| 예상 row 수 | 31,102 (WEB 전체 · 고정) |
| 변경 빈도 | 거의 없음 (v1 에서 텍스트 수정 없음). 재임베딩 시 전체 UPDATE 가능성 |
| 크기 추정 | 768 float32 × 4 byte × 31,102 ≈ 95 MB (임베딩만). 텍스트 포함 약 120~150 MB |

---

### 2.3 `public.user_quota` (phase-04 예정)

**역할**: 사용자별 일일 질문 횟수 추적. phase-04 에서 구현.

#### DDL

```sql
CREATE TABLE public.user_quota (
  user_id      uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  today_count  integer     NOT NULL DEFAULT 0,           -- 오늘 사용 횟수
  quota_date   date        NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Seoul')::date,
  -- quota_date: KST 기준 날짜. 오늘 날짜와 다르면 today_count 를 0 으로 리셋
  total_count  bigint      NOT NULL DEFAULT 0,           -- 누적 사용 횟수 (통계용)
  updated_at   timestamptz NOT NULL DEFAULT now()
);
```

#### 컬럼 상세

| 컬럼 | 타입 | Nullable | Default | 설명 |
|---|---|---|---|---|
| `user_id` | `uuid` | NO | — | PK + FK → `auth.users(id)`. `ON DELETE CASCADE` |
| `today_count` | `integer` | NO | `0` | 오늘(KST 기준) 소비한 질문 횟수. 최대 20 |
| `quota_date` | `date` | NO | KST 오늘 | 카운트 기준 날짜 (KST). 이 날짜가 KST 오늘과 다르면 `today_count` 를 0 으로 재설정 |
| `total_count` | `bigint` | NO | `0` | 전체 누적 카운트 (통계용, 운영자 참고) |
| `updated_at` | `timestamptz` | NO | `now()` | 마지막 카운트 갱신 시각 |

#### PK / 인덱스

```sql
-- user_id 가 PK 이므로 별도 인덱스 없음.
-- ON DELETE CASCADE 로 auth.users 삭제 시 연계 삭제.
```

#### RLS 정책

```sql
ALTER TABLE public.user_quota ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 자기 row 만 읽기 가능
CREATE POLICY "quota_read_own"
  ON public.user_quota
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT / UPDATE: service_role 전용 (Route Handler 에서 service_role 클라이언트 사용)
-- 이유: today_count 갱신 로직이 서버측 단일 원점에서 이루어져야 race condition 방지 가능
```

#### 예상 row 수 / 변경 빈도

| 항목 | 값 |
|---|---|
| 예상 row 수 | 사용자 수와 동일 (1:1). v1 포트폴리오 규모: 수십~수백 |
| 변경 빈도 | `/api/qa` 성공 시 1회 갱신 (KST 자정 후 첫 호출 시 reset + 갱신) |

---

### 2.4 향후 확장 테이블 (현재 비범위)

| 테이블 후보 | 예정 Phase | 설명 |
|---|---|---|
| `qa_sessions` | v1.5 | 질문/답변 영구 저장 (히스토리) |
| `verse_meta` | v2 | 인물/장소/사건 엔티티 메타 |

---

## 3. RPC 함수 (Postgres)

### 3.1 `match_verses` (phase-01 구현 완료)

**역할**: 질문 임베딩 벡터와 `verses.embedding` 간 코사인 유사도를 계산해 상위 K 개를 반환.

#### DDL

```sql
CREATE OR REPLACE FUNCTION public.match_verses(
  query_embedding   vector(768),
  match_count       integer DEFAULT 5,
  similarity_threshold float DEFAULT 0.0
)
RETURNS TABLE (
  verse_id     uuid,
  book         text,
  chapter      integer,
  verse_number integer,
  label        text,
  text         text,
  similarity   float
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    v.verse_id,
    v.book,
    v.chapter,
    v.verse_number,
    v.label,
    v.text,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM public.verses v
  WHERE 1 - (v.embedding <=> query_embedding) >= similarity_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

#### 시그니처 상세

| 매개변수 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `query_embedding` | `vector(768)` | — (필수) | 질문 텍스트의 Gemini 임베딩 |
| `match_count` | `integer` | `5` | 반환할 최대 row 수. `/api/qa` 에서 `k` 파라미터로 전달 |
| `similarity_threshold` | `float` | `0.0` | 최소 유사도 하한. 현재 기본값 0.0 (전체 반환) |

#### 반환 컬럼

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `verse_id` | `uuid` | 구절 PK |
| `book` | `text` | 책 이름 |
| `chapter` | `integer` | 장 번호 |
| `verse_number` | `integer` | 절 번호 |
| `label` | `text` | `"Genesis 1:1"` 형식 라벨 |
| `text` | `text` | WEB 영문 본문 |
| `similarity` | `float` | 코사인 유사도 (0.0 ~ 1.0, 높을수록 유사) |

#### 권한

```sql
-- SECURITY DEFINER: 함수 소유자(postgres) 권한으로 실행
-- anon, authenticated 에게 EXECUTE 권한 부여
GRANT EXECUTE ON FUNCTION public.match_verses(vector(768), integer, float)
  TO anon, authenticated;
```

#### 호출 예시 (Next.js Route Handler)

```typescript
const { data, error } = await supabase.rpc('match_verses', {
  query_embedding: embeddingArray,  // number[] (768개)
  match_count: k,                   // 1~10
  similarity_threshold: 0.0,
});
```

### 3.2 `increment_quota` (phase-04 예정)

**역할**: `user_quota.today_count` 를 원자적으로 1 증가. KST 자정 이후 첫 호출 시 자동 리셋.

```sql
CREATE OR REPLACE FUNCTION public.increment_quota(
  p_user_id uuid
)
RETURNS TABLE (
  today_count  integer,
  quota_date   date,
  is_exceeded  boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_kst_today date := (now() AT TIME ZONE 'Asia/Seoul')::date;
  v_count     integer;
  v_date      date;
BEGIN
  -- UPSERT: 없으면 삽입, 있으면 날짜 확인 후 카운트 증가
  INSERT INTO public.user_quota (user_id, today_count, quota_date, total_count, updated_at)
  VALUES (p_user_id, 1, v_kst_today, 1, now())
  ON CONFLICT (user_id) DO UPDATE
    SET
      today_count = CASE
        WHEN user_quota.quota_date < v_kst_today THEN 1   -- 날짜 변경: 리셋 후 1
        ELSE user_quota.today_count + 1                    -- 같은 날: 증가
      END,
      quota_date  = v_kst_today,
      total_count = user_quota.total_count + 1,
      updated_at  = now()
  RETURNING today_count, quota_date INTO v_count, v_date;

  RETURN QUERY SELECT v_count, v_date, (v_count > 20);
END;
$$;
```

> **race condition 방지**: `ON CONFLICT ... DO UPDATE` 는 Postgres 레벨 atomic UPSERT 이므로 동시 요청에도 정확히 1씩 증가한다.

---

## 4. RLS 정책

### 4.1 전체 요약 매트릭스

| 테이블 | anon | authenticated | service_role | 비고 |
|---|---|---|---|---|
| `auth.users` | — | 자기 row 읽기 (Supabase 자동) | 전체 읽기/쓰기 | Supabase Auth 관리 |
| `public.verses` | SELECT | SELECT | 전체 | 임베딩 시드는 service_role |
| `public.user_quota` | — | 자기 row SELECT | 전체 | INSERT/UPDATE 는 service_role 전용 RPC |

### 4.2 `public.verses` RLS

```sql
-- 이미 §2.2 에 명시. 요약:
-- anon, authenticated → SELECT 허용
-- INSERT / UPDATE / DELETE → 정책 없음 (service_role 만 가능)
```

### 4.3 `public.user_quota` RLS

```sql
-- 이미 §2.3 에 명시. 요약:
-- authenticated → 자기 row SELECT 허용 (auth.uid() = user_id)
-- INSERT / UPDATE → service_role 전용 (RPC increment_quota 를 통해서만)
-- DELETE → 정책 없음 (service_role 만 가능)
```

### 4.4 RLS 우회 패턴 (service_role 클라이언트)

`/api/qa` Route Handler 에서 `user_quota` 를 갱신할 때는 service_role 클라이언트를 사용한다. 이 클라이언트는 **서버측 코드에서만** 생성해야 한다.

```typescript
// app/api/qa/route.ts (서버 전용)
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// increment_quota RPC 호출 (phase-04 예정)
const { data } = await supabaseAdmin.rpc('increment_quota', { p_user_id: userId });
```

`SUPABASE_SERVICE_ROLE_KEY` 는 `NEXT_PUBLIC_` prefix 없이 선언해 클라이언트 번들에 포함되지 않도록 한다.

---

## 5. API 응답 스키마 (TypeScript interface)

### 5.1 공통 응답 엔벨로프

```typescript
/** 성공 응답 */
interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
}

/** 실패 응답 */
interface ApiError {
  ok: false;
  error: {
    code: ErrorCode;       // §6 에러 코드 enum
    message: string;       // 한국어 사용자 노출 메시지
    field?: string | null; // 필드 레벨 에러 시 필드명
    retryable?: boolean;   // 재시도 가능 여부
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

### 5.2 `POST /api/qa`

**요청**

```typescript
interface QaRequest {
  question: string;  // 1~500자 한국어 질문
  k?: number;        // top-K 구절 수. default 5, 범위 1~10
}
```

**응답 — 200 성공**

```typescript
interface VerseMatch {
  verse_id:     string;  // uuid
  book:         string;  // "Genesis"
  chapter:      number;  // 1
  verse_number: number;  // 1
  label:        string;  // "Genesis 1:1"
  text:         string;  // "In the beginning God created..."
  similarity:   number;  // 0.0~1.0 코사인 유사도
}

interface QaData {
  answer: string;        // Gemini Flash 생성 한국어 답변
  verses: VerseMatch[];  // top-K 구절 (최대 10)
}

interface QaMeta {
  model_embedding: string;  // "text-embedding-004"
  model_generation: string; // "gemini-2.0-flash"
  latency_ms: number;       // 전체 처리 소요 ms
}

type QaSuccessResponse = ApiSuccess<QaData> & { meta: QaMeta };
```

**응답 — 401 미인증**

```typescript
// code: "UNAUTHENTICATED"
// message: "로그인이 필요합니다"
// retryable: false
```

**응답 — 400 입력 오류**

```typescript
// code: "INVALID_INPUT"
// message: "질문을 입력해주세요" 또는 "질문이 너무 깁니다 (최대 500자)"
// field: "question" | "k"
// retryable: false
```

**응답 — 429 일일 한도 초과 (phase-04)**

```typescript
interface QuotaExceededError {
  ok: false;
  error: {
    code: 'QUOTA_EXCEEDED';
    message: '오늘의 사용량을 모두 사용했습니다.';
    reset_at: string;   // ISO8601, KST 자정. 예: "2026-05-28T00:00:00+09:00"
    retryable: false;
  };
}
```

**응답 — 502 LLM 오류**

```typescript
// code: "LLM_FAILED"
// message: "답변 생성 중 오류가 발생했습니다."
// retryable: true
```

**응답 — 500 DB/내부 오류**

```typescript
// code: "INTERNAL"
// message: "일시적인 오류가 발생했습니다."
// retryable: true
```

---

### 5.3 `GET /auth/callback` (Route Handler)

브라우저에게 JSON 응답을 반환하지 않는다. 처리 결과는 HTTP redirect 로만 전달된다.

| 경우 | 처리 결과 |
|---|---|
| 정상 토큰 교환 성공 | `307 Location: /qa` + `Set-Cookie: sb-access-token, sb-refresh-token` |
| `type=recovery` 토큰 | `307 Location: /auth/reset-password?step=2` |
| 파라미터 없음 | `307 Location: /login` |
| 토큰 교환 실패 | `307 Location: /auth/auth-code-error` (또는 폴백 page.tsx 렌더) |

---

### 5.4 Server Action 응답 스키마

#### `signIn(email, password)`

```typescript
type SignInResult =
  | { ok: true; redirectTo: '/qa' }
  | { ok: false; error: { code: 'INVALID_CREDENTIALS' | 'EMAIL_NOT_VERIFIED' | 'INTERNAL'; message: string } };
```

#### `signUp(email, password)`

```typescript
type SignUpResult =
  | { ok: true; redirectTo: string }  // "/auth/verify-email?email=..."
  | { ok: false; error: { code: 'EMAIL_ALREADY_REGISTERED' | 'INVALID_INPUT' | 'INTERNAL'; message: string; field?: string } };
```

#### `signOut()`

```typescript
type SignOutResult =
  | { ok: true; redirectTo: '/login' }
  | { ok: false; error: { code: 'INTERNAL'; message: string } };
```

#### `resendVerification(email)`

```typescript
type ResendResult =
  | { ok: true }
  | { ok: false; error: { code: 'INTERNAL'; message: string } };
// 보안: 이메일 존재 여부 무관하게 ok:true 반환 (이메일 열거 공격 방지)
```

#### `requestPasswordReset(email)`

```typescript
type ResetRequestResult =
  | { ok: true }
  | { ok: false; error: { code: 'INTERNAL'; message: string } };
// 보안: resendVerification 과 동일하게 통일 응답
```

#### `updatePassword(newPassword, confirmPassword)`

```typescript
type UpdatePasswordResult =
  | { ok: true; redirectTo: '/login' }
  | {
      ok: false;
      error: {
        code: 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'INVALID_INPUT' | 'INTERNAL';
        message: string;
        field?: 'newPassword' | 'confirmPassword';
      };
    };
```

---

### 5.5 `GET /api/quota` (phase-04 예정)

**응답 — 200 성공**

```typescript
interface QuotaData {
  remaining: number;   // 0~20
  total: number;       // 20 (고정)
  reset_at: string;    // ISO8601 KST 자정
}

type QuotaSuccessResponse = ApiSuccess<QuotaData>;
```

**응답 — 401**

```typescript
// code: "UNAUTHENTICATED"
// message: "로그인이 필요합니다"
```

---

## 6. 에러 코드 표준

### 6.1 에러 코드 enum

```typescript
type ErrorCode =
  | 'UNAUTHENTICATED'          // 세션 없음 / 만료
  | 'FORBIDDEN'                // 권한 없음 (v1 현재 미사용)
  | 'INVALID_INPUT'            // 클라이언트 입력 오류
  | 'INVALID_CREDENTIALS'      // 이메일/비밀번호 불일치
  | 'EMAIL_NOT_VERIFIED'       // 이메일 미인증
  | 'EMAIL_ALREADY_REGISTERED' // 중복 이메일
  | 'TOKEN_EXPIRED'            // 인증/재설정 링크 만료
  | 'TOKEN_INVALID'            // 인증/재설정 링크 무효
  | 'QUOTA_EXCEEDED'           // 일일 한도 초과
  | 'EMBEDDING_FAILED'         // Gemini 임베딩 실패
  | 'LLM_FAILED'               // Gemini 답변 생성 실패
  | 'DB_ERROR'                 // Postgres / pgvector 오류
  | 'INTERNAL'                 // 기타 서버 내부 오류
  | 'NOT_FOUND';               // 리소스 없음
```

### 6.2 에러 코드 × HTTP 상태 × 재시도 매핑

| 코드 | HTTP 상태 | 사용자 노출 메시지 (한국어) | 재시도 가능 | 사용 위치 |
|---|---|---|---|---|
| `UNAUTHENTICATED` | 401 | "로그인이 필요합니다." | false | 모든 보호 엔드포인트 |
| `FORBIDDEN` | 403 | "접근 권한이 없습니다." | false | (v1 미사용) |
| `INVALID_INPUT` | 400 | "입력값을 확인해주세요." (필드별 상세) | false | `/api/qa`, signUp, updatePassword |
| `INVALID_CREDENTIALS` | 401 | "이메일 또는 비밀번호가 올바르지 않습니다." | false | signIn |
| `EMAIL_NOT_VERIFIED` | 403 | "이메일 인증이 완료되지 않았습니다." | false | signIn |
| `EMAIL_ALREADY_REGISTERED` | 409 | "이미 가입된 이메일입니다." | false | signUp |
| `TOKEN_EXPIRED` | 401 | "링크가 만료되었습니다. 다시 요청해주세요." | false | `/auth/callback`, updatePassword |
| `TOKEN_INVALID` | 401 | "유효하지 않은 링크입니다." | false | `/auth/callback`, updatePassword |
| `QUOTA_EXCEEDED` | 429 | "오늘의 사용량을 모두 사용했습니다." | false | `/api/qa` |
| `EMBEDDING_FAILED` | 502 | "답변 생성 중 오류가 발생했습니다." | true | `/api/qa` (Gemini embed 호출 실패) |
| `LLM_FAILED` | 502 | "답변 생성 중 오류가 발생했습니다." | true | `/api/qa` (Gemini generate 호출 실패) |
| `DB_ERROR` | 500 | "일시적인 오류가 발생했습니다." | true | `/api/qa` (match_verses RPC 실패) |
| `INTERNAL` | 500 | "일시적인 오류가 발생했습니다." | true | 모든 엔드포인트 catch-all |
| `NOT_FOUND` | 404 | "찾을 수 없습니다." | false | `app/not-found.tsx` |

### 6.3 클라이언트측 네트워크 에러

네트워크 에러는 HTTP 응답을 받지 못하는 경우이므로 `ErrorCode` 에 포함하지 않는다. 클라이언트에서 `fetch` 실패 / `AbortError` 를 별도로 처리한다.

```typescript
// 클라이언트 전용 처리 패턴
try {
  const res = await fetch('/api/qa', { signal: controller.signal, ... });
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    // 15초 timeout → error.gemini-other 상태
  } else {
    // 네트워크 끊김 → error.network 상태
  }
}
```

---

## 7. 환경 변수 / Secret

### 7.1 전체 목록

| 변수명 | client 번들 포함 | 설명 | 필수 여부 |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | YES | Supabase 프로젝트 URL. 예: `https://xxxx.supabase.co` | 필수 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | YES | Supabase anon JWT. RLS 적용, 공개 가능 | 필수 |
| `SUPABASE_SERVICE_ROLE_KEY` | NO | Supabase service_role JWT. RLS 우회. 서버 전용 | 필수 (서버) |
| `GOOGLE_API_KEY` | NO | Google AI Studio API Key. Gemini embed + generate 호출 | 필수 (서버) |

### 7.2 client / server 경계

```
┌─────────────────────────────────────────────────────┐
│  클라이언트 번들 (브라우저에 노출됨)                   │
│  NEXT_PUBLIC_SUPABASE_URL                            │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  서버 전용 (클라이언트 번들 미포함)                    │
│  SUPABASE_SERVICE_ROLE_KEY  ← 절대 노출 금지         │
│  GOOGLE_API_KEY             ← 절대 노출 금지         │
└─────────────────────────────────────────────────────┘
```

`NEXT_PUBLIC_` prefix 가 없는 변수는 Next.js 가 빌드 시 클라이언트 번들에서 자동 제외한다.

### 7.3 Vercel 환경 변수 설정

```bash
# Vercel CLI 로 설정 (프로덕션)
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add GOOGLE_API_KEY production
```

로컬 개발 시 `.env.local` 에 선언 (`.gitignore` 필수 확인).

---

## 8. 외부 의존

### 8.1 Google AI Studio (Gemini)

| 항목 | 값 | 비고 |
|---|---|---|
| 임베딩 모델 | `text-embedding-004` | 768차원 출력. 한국어 지원 (크로스링궐 검색 가능) |
| 생성 모델 | `gemini-2.0-flash` (또는 후속) | 한국어 답변 생성. 모델명은 환경 변수화 권장 |
| API 엔드포인트 | Google AI Studio API (REST 또는 `@google/genai` SDK) | `GOOGLE_API_KEY` 로 인증 |
| 임베딩 호출 | `embedContent({ content: { parts: [{ text: question }] } })` | 응답: `embedding.values` (float[] 768) |
| 생성 호출 | `generateContent({ contents: [...] })` | 응답: `candidates[0].content.parts[0].text` |

#### 무료 티어 Quota (2026-05 기준, 변경 가능)

| 모델 | RPM | TPM | RPD |
|---|---|---|---|
| `text-embedding-004` | 1,500 | 1,000,000 | 미공개 |
| `gemini-2.0-flash` | 15 | 1,000,000 | 1,500 |

> 일일 한도 20회/사용자 설계는 Gemini Flash RPD(1,500) 대비 여유 있으나, 동시 사용자 수 증가 시 RPM 병목 가능성 있음. §12 Open Questions Q-4 참조.

### 8.2 Supabase (무료 티어)

| 항목 | 무료 티어 제한 |
|---|---|
| DB 크기 | 500 MB |
| 월간 활성 사용자 (MAU) | 50,000 |
| Storage | 1 GB |
| Edge Function 호출 | 500,000 / 월 |
| Auth 이메일 발송 | 4 / 시간 (기본 SMTP) |

> Auth 이메일 발송 한도: Supabase 기본 SMTP 는 시간당 4건으로 제한된다. 포트폴리오 데모 규모에서는 충분하나, 실 서비스 시 Resend / Postmark 등 외부 SMTP 로 교체 필요 (v1.5 이후).

---

## 9. 일일 한도 (Quota) 설계

> 이 섹션의 구현은 **phase-04 예정**. phase-03 에서는 Gemini API 자체 429 를 그대로 클라이언트에 전달하는 임시 처리.

### 9.1 `user_quota` 테이블 스키마

§2.3 참조.

### 9.2 일일 리셋 규칙

| 항목 | 결정 |
|---|---|
| 기준 시간대 | **KST (Asia/Seoul, UTC+9)** |
| 리셋 시각 | KST 00:00 (자정) |
| 저장 방식 | `quota_date` 컬럼에 KST 날짜 저장. API 호출 시 `now() AT TIME ZONE 'Asia/Seoul'` 와 비교해 날짜가 다르면 `today_count` 를 0 으로 재설정 |
| 별도 cron 필요 여부 | **불필요** (§9.3 설계로 cron 없이 처리 가능). §12 Open Questions Q-2 에서 최종 결정 |

### 9.3 카운트 증가 시점

| 옵션 | 장점 | 단점 |
|---|---|---|
| **요청 시작 전** | LLM 오류 시에도 한도 차감 → 무한 재시도 방지 | 사용자 불만 (실패해도 차감) |
| **성공 응답 후** (채택) | 실패한 요청은 차감 안 됨 → 공정 | LLM 응답 수신 후 DB 갱신 실패 시 무차감 가능 (허용 오차) |

**채택**: 성공 응답 후 카운트 증가. `/api/qa` 가 정상 JSON 응답을 클라이언트에 전송하기 직전에 `increment_quota` RPC 를 호출한다.

```typescript
// app/api/qa/route.ts (phase-04 추가 예정)
// ... Gemini 답변 생성 완료 후

// 카운트 증가 (실패해도 응답은 정상 반환)
const { data: quotaData } = await supabaseAdmin.rpc('increment_quota', {
  p_user_id: user.id,
});

if (quotaData?.is_exceeded) {
  // 이미 한도 초과 상태 → 429 반환 (이 요청에는 이미 카운트 소모됨)
  return NextResponse.json(
    { ok: false, error: { code: 'QUOTA_EXCEEDED', message: '오늘의 사용량을 모두 사용했습니다.', reset_at: nextMidnightKST() } },
    { status: 429 }
  );
}

return NextResponse.json({ ok: true, data: { answer, verses }, meta });
```

### 9.4 한도 확인 시점 (사전 검사)

성공 응답 후 증가 방식을 채택하더라도, **요청 시작 시 사전 검사**를 함께 수행해 불필요한 LLM 호출을 차단한다.

```typescript
// 요청 시작 시 사전 한도 확인
const { data: quota } = await supabaseAdmin
  .from('user_quota')
  .select('today_count, quota_date')
  .eq('user_id', user.id)
  .single();

const kstToday = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
const isReset = !quota || quota.quota_date !== kstToday;
const currentCount = isReset ? 0 : quota.today_count;

if (currentCount >= 20) {
  return NextResponse.json(
    { ok: false, error: { code: 'QUOTA_EXCEEDED', ... } },
    { status: 429 }
  );
}
```

### 9.5 동시 요청 race condition 처리

복수의 요청이 동시에 들어와 사전 검사를 통과하더라도, `increment_quota` RPC 의 `ON CONFLICT DO UPDATE` + 카운트 반환으로 최종 한도를 보장한다.

```
동시 요청 3개가 today_count = 18 일 때 통과 가정:
  → 요청 A: increment → today_count = 19 (is_exceeded = false)
  → 요청 B: increment → today_count = 20 (is_exceeded = false)
  → 요청 C: increment → today_count = 21 (is_exceeded = true → 429 반환)

결과: 정확히 20회 제한. 21번째 요청은 답변을 이미 생성했더라도 429 반환.
허용 오차: 요청 C 의 LLM 비용 1회 소모. 포트폴리오 규모에서 허용.
```

엄격한 제한이 필요한 경우 사전 검사를 `SELECT FOR UPDATE` 또는 Advisory Lock 으로 강화 가능 (v1.5 이후 검토).

---

## 10. 마이그레이션 / 시드

### 10.1 WEB Bible 31,102 row 임베딩 시드 절차

phase-01 에서 완료. 재실행 시 아래 절차를 따른다.

```bash
# pnpm embed:bible 스크립트 (루트 package.json 에 정의됨)
pnpm embed:bible

# 내부 동작:
# 1. WEB Bible JSON / CSV 소스 파일 로드 (31,102 row)
# 2. Gemini text-embedding-004 API 배치 호출 (rate limit 준수, 100 row/배치)
# 3. verses UPSERT (book, chapter, verse_number 기준 ON CONFLICT DO NOTHING)
# 4. 완료 후 31,102 row 확인
```

> **quota 리셋 후 단순 재실행**: Gemini 무료 tier 일일 quota 가 리셋된 후 `pnpm embed:bible` 을 재실행하면 된다. 이 작업은 spec 화 금지 (FF 직접 실행). [Memory 참조]

**재임베딩 시 주의사항**:
- `embedding` 컬럼을 UPDATE 하면 ivfflat 인덱스를 `REINDEX` 해야 한다.
- 모델 교체 (예: `text-embedding-005`) 시 전체 31,102 row 재임베딩 필요.

### 10.2 `user_quota` 새 사용자 row 자동 생성 (phase-04 예정)

신규 가입 시 `auth.users` 에 row 가 삽입되면 `user_quota` 에 row 를 자동 생성한다.

**방법 1: Postgres Trigger (권장)**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_quota (user_id, today_count, quota_date, total_count)
  VALUES (
    NEW.id,
    0,
    (now() AT TIME ZONE 'Asia/Seoul')::date,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**방법 2: `increment_quota` UPSERT 활용**

`user_quota` row 가 없으면 `increment_quota` 의 `ON CONFLICT ... DO UPDATE` 가 자동 생성하므로, trigger 없이도 첫 질문 시 row 가 생성된다. 단, 첫 로그인 시점에 row 가 없으면 `GET /api/quota` 에서 잔여 한도를 20으로 가정해야 한다.

**채택**: 방법 1 (Trigger). 첫 질문 전에도 quota row 가 존재해 일관성 확보.

---

## 11. 보안 정책

### 11.1 세션 쿠키

| 항목 | 설정 |
|---|---|
| 라이브러리 | `@supabase/ssr` (`createServerClient`, `createBrowserClient`) |
| 쿠키 이름 | `sb-access-token`, `sb-refresh-token` (Supabase 기본) |
| `httpOnly` | YES (Supabase SSR helper 기본) |
| `Secure` | YES (HTTPS 환경, Vercel 자동 TLS) |
| `sameSite` | `Lax` (Supabase 기본. OAuth redirect 허용, CSRF 방어) |
| 만료 | access_token: 1시간, refresh_token: 60일 (Supabase 기본) |

### 11.2 보호 경로 (`proxy.ts` / middleware)

```typescript
// middleware.ts (proxy.ts)
// 보호 매처: /qa, /qa/* → 세션 없으면 /login 307 redirect
export const config = {
  matcher: ['/qa', '/qa/:path*'],
};
```

Defence-in-depth 원칙: middleware 통과 후에도 Route Handler (`/api/qa`) 와 Server Action 에서 `supabase.auth.getUser()` 를 재검증한다.

### 11.3 `SUPABASE_SERVICE_ROLE_KEY` 노출 금지

- `NEXT_PUBLIC_` prefix 없이 선언.
- 서버 코드(`app/api/`, `app/**/_actions.ts`) 에서만 참조.
- 클라이언트 컴포넌트 (`"use client"`) 에서 절대 import 금지.
- `.env.local` 은 `.gitignore` 에 포함 필수.

### 11.4 이메일 열거 공격 방지

`resendVerification`, `requestPasswordReset` 은 이메일 존재 여부 무관하게 동일 성공 응답을 반환한다. (§5.4 참조)

### 11.5 CORS

Next.js App Router 는 기본적으로 same-origin 정책을 적용한다. `/api/qa` 는 외부 도메인에서 호출할 필요가 없으므로 별도 CORS 헤더 설정 불필요.

### 11.6 Rate Limit

| 레벨 | 정책 |
|---|---|
| **애플리케이션 레벨** | `user_quota.today_count` 로 사용자당 20회/일 (KST 기준) |
| **Supabase Auth 레벨** | 로그인 실패 연속 잠금: Supabase Dashboard 기본 설정 따름 |
| **Vercel 레벨** | Vercel Pro 이상에서 IP 기반 rate limit 활성화 가능 (v1 무료 플랜 미적용) |

### 11.7 Google OAuth redirect URL 화이트리스트

Supabase Dashboard > Authentication > URL Configuration 에서 다음을 허용:

```
http://localhost:3000/auth/callback  (로컬 개발)
https://<vercel-domain>.vercel.app/auth/callback  (프리뷰)
https://<production-domain>/auth/callback  (프로덕션)
```

---

## 12. Open Questions / 결정 필요

| # | 항목 | 잠정 default | 결정 시 영향 | 우선순위 |
|---|---|---|---|---|
| Q-1 | **ivfflat vs hnsw 인덱스** | `ivfflat (lists=100)` 현재 적용 | hnsw 는 INSERT 느리나 검색 정확도 높음. 31,102 row 고정 테이블이므로 hnsw 검토 가치 있음 | phase-04 전 결정 |
| Q-2 | **KST 자정 리셋 메커니즘** | 사전 검사 시 `quota_date` 비교로 자동 리셋 (cron 없음) | DB cron (pg_cron) / Vercel Cron 도입 시 정시 리셋 보장. 단, 추가 인프라 비용 | phase-04 결정 |
| Q-3 | **`user_quota` 단일 row 누적 vs 일자별 row** | 단일 row (`quota_date` 컬럼으로 날짜 비교) | 일자별 row 는 히스토리 조회 가능하나 v1 에서 불필요. 단일 row 채택 | 결정 완료 (단일 row) |
| Q-4 | **Gemini Flash RPM/RPD 대비 일일 20회 한도 적절성** | 20회/일/사용자 | 동시 사용자 5~10명 가정: 100~200회/일 → Gemini Flash RPD 1,500 대비 여유. RPM 15 초과 시 Gemini 자체 429 가능 | phase-04 모니터링 |
| Q-5 | **`similarity_threshold` 기본값** | `0.0` (전체 반환) | 임계값 설정 시 "관련 구절 없음" 케이스 증가. 0.3~0.5 권장 구간 평가 필요 | phase-04 전 결정 |
| Q-6 | **`match_verses` `lists` 파라미터 최적화** | `lists=100` | `lists = sqrt(31102) ≈ 176` 권장치. 검색 정확도 vs 속도 트레이드오프 실측 필요 | phase-04 전 결정 |
| Q-7 | **`user_quota` 엄격한 동시성 제어** | `increment_quota` UPSERT 허용 오차 | 동시 요청 시 최대 1회 초과 허용. 더 엄격한 제어 필요 시 `SELECT FOR UPDATE` 또는 Advisory Lock 도입 | v1.5 검토 |
| Q-8 | **`GET /api/quota` 엔드포인트 캐싱 전략** | 캐싱 없음 (매 요청 DB 조회) | headers: SC-07 Badge 렌더 시 SWR 또는 `stale-while-revalidate` 적용 검토 | phase-04 결정 |

---

> **이 문서의 마지막 약속**
>
> `docs/v1/database/draft-schema.md` 는 v1 (phase-03 + phase-04) 의 Supabase 스키마, RPC 함수, API 계약, 에러 코드, 환경 변수, 보안 정책의 단일 진실 원천이다. PRD 문서들이 이 문서와 충돌할 경우 **이 문서를 우선**으로 한다 (PRD 는 UI/UX 계약, 본 문서는 백엔드 계약).
