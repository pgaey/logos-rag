# Implementation Plan: spec-01-01

## 📋 Branch Strategy

- 신규 브랜치: `spec-01-01-bootstrap-supabase`
- 시작 지점: **`develop`** (phase-01 의 GitFlow 변형 — phase-01.md 결정 기록 참조)
- Base branch (`phase-01-data-pipeline`) 는 본 spec 의 hk-ship 시점에 sdd 가 develop 에서 자동 생성. spec PR target = `phase-01-data-pipeline`.
- 첫 task 가 spec 브랜치 생성을 수행.

## 🛑 사용자 검토 필요 (User Review Required)

> 본 Plan 을 Accept 하기 전에 사용자가 명시적으로 확인해야 할 항목들.

> [!IMPORTANT]
> - [ ] Supabase 프로젝트 생성 완료 + `sb_publishable_*` / `sb_secret_*` 키 발급 완료
> - [ ] Supabase Dashboard → Database → Extensions 에서 **`vector`** 활성화 완료
> - [ ] Google AI Studio (`aistudio.google.com`) 에서 Gemini API key 발급 완료 (이번 spec 에선 사용하지 않지만 `.env.local` 변수 자리 마련)
> - [ ] `.env.local` 채우기 (Task 6 직전)

> [!WARNING]
> - [ ] legacy `anon` / `service_role` JWT 키는 사용 금지 — `sb_publishable_*` / `sb_secret_*` 만 사용
> - [ ] `SUPABASE_SECRET_KEY` 는 `.env.local` 에만 존재, 절대 commit 금지 (Next 기본 gitignore 확인 필요)
> - [ ] GitHub `develop`·`main` 브랜치 보호 룰 설정은 README 에 안내만 하고, 사용자가 GitHub 웹에서 수동 적용

## 🎯 핵심 전략 (Core Strategy)

### 아키텍처 컨텍스트

```mermaid
sequenceDiagram
  participant Script as scripts/check-supabase.ts
  participant Server as src/lib/supabase/server.ts
  participant SB as Supabase Postgres

  Script->>Server: createServerSupabase()
  Server->>SB: SELECT 1
  SB-->>Server: 1
  Server-->>Script: PASS
  Script->>Server: client.from('pg_extension')<br/>.select('extname').eq('extname','vector')
  Server->>SB: SELECT extname FROM pg_extension WHERE extname='vector'
  SB-->>Server: row 1건
  Server-->>Script: PASS
  Script-->>User: exit 0
```

### 주요 결정

| 컴포넌트 | 전략 | 이유 |
|:---:|:---|:---|
| **클라이언트 분리** | server.ts (secret key) + client.ts (publishable key) 2 파일 | secret 누출 사고 사전 차단. import path 만으로도 권한 컨텍스트가 명확 |
| **환경변수 prefix** | publishable·URL 은 `NEXT_PUBLIC_*`, secret 은 prefix 없음 | Next.js 가 `NEXT_PUBLIC_*` 만 클라이언트 번들에 노출. secret 은 강제로 서버 전용 |
| **검증 도구** | Vitest 미도입, `tsx scripts/check-supabase.ts` | spec 범위 최소화. 본 spec 의 검증은 한 번 PASS 확인이 충분. 본격 unit test 러너는 cosine 검색 wrapper 같이 진짜 로직이 생긴 spec 에서 도입 |
| **스크립트 러너** | `tsx` (devDependency) | Node 22+ 도 `--experimental-strip-types` 가 있지만 tsx 가 호환·DX 측면에서 가장 단순 |
| **pgvector 확인 방법** | Supabase JS 로 `pg_extension` 테이블 조회 | RPC 별도 정의보다 단순. RLS 비활성 default 테이블이라 secret key 로 바로 SELECT 가능 |
| **README 업데이트 범위** | 셋업 가이드 한 단락 + 환경변수 표 + 검증 명령 | 외부 사용자/미래의 본인이 처음부터 따라할 수 있는 최소 정보. 깊은 아키텍처는 추후 |

## 📂 Proposed Changes

### Dependencies

#### [MODIFY] `package.json`
- `dependencies`: `@supabase/supabase-js` (^2.x), **`pg` (^8.x)** ← Task 5 진행 중 추가 (pg_catalog 검증은 Supabase JS/PostgREST 로 불가 → 직접 Postgres TCP 가 표준)
- `devDependencies`: `tsx` (^4.x), **`@types/pg`** (^8.x)
- `scripts`: `"check:supabase": "tsx --env-file=.env.local scripts/check-supabase.ts"`

### Supabase 클라이언트 모듈

#### [NEW] `src/lib/supabase/server.ts`
Secret key 기반 서버 전용 클라이언트 팩토리.
```text
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createServerSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY')
  return createClient(url, secret, { auth: { persistSession: false } })
}
```

#### [NEW] `src/lib/supabase/client.ts`
Publishable key 기반 브라우저 클라이언트 팩토리.
```text
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createBrowserSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishable) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  return createClient(url, publishable)
}
```

### 환경변수 템플릿

#### [NEW] `.env.example`
```text
# Supabase (신규 API 키 형식)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx

# Postgres 직접 연결 (Dashboard → Project Settings → Database → Connection string → URI)
# 관리자 작업(extension 검증, 마이그레이션, 배치 적재) 전용. 절대 클라이언트 번들 노출 금지.
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.YOUR-PROJECT.supabase.co:5432/postgres

# Google AI Studio (Gemini)
GEMINI_API_KEY=xxx
```

### 검증 스크립트

#### [NEW] `scripts/check-supabase.ts`
- **`pg` 직접 연결** (`SUPABASE_DB_URL`). Supabase JS 는 PostgREST 경유라 `pg_catalog` 미노출 → 관리자 검증은 직접 Postgres TCP 가 표준.
- SSL: `{ rejectUnauthorized: false }` (로컬 smoke 한정. 프로덕션 코드 아님).
- 단계: (1) connect → (2) `SELECT 1` → (3) `SELECT extname FROM pg_extension WHERE extname = 'vector'`.
- 콘솔 출력 형식:
  ```
  [check:supabase] connecting...
  [check:supabase] SELECT 1 ............ PASS
  [check:supabase] pgvector extension .. PASS
  [check:supabase] all checks passed.
  ```
- 실패 시 `process.exit(1)`.

#### [MODIFY] `package.json` 의 `scripts.check:supabase`
`"check:supabase": "tsx --env-file=.env.local scripts/check-supabase.ts"`

### 문서

#### [MODIFY] `README.md`
- 프로젝트 한 줄 소개
- 셋업 가이드 (Supabase 프로젝트 → pgvector 활성화 → AI Studio key → `.env.local` 채우기 → `pnpm check:supabase`)
- 브랜치 보호 룰 안내 (GitHub 웹에서 main/develop 보호)
- 환경변수 표 (이름·용도·노출 컨텍스트)

## 🧪 검증 계획 (Verification Plan)

### 단위 테스트 (필수)
> 본 spec 은 unit test runner 를 도입하지 않음. 클라이언트 팩토리의 동작은 통합 smoke 로 검증.

### 통합 테스트 (Integration Test Required = yes)
```bash
pnpm check:supabase
# 기대: 3줄 PASS 출력 + exit 0
```

### 수동 검증 시나리오
1. **secret key 누출 확인** — `pnpm build` 후 `.next/static/chunks/*.js` 에 `SUPABASE_SECRET_KEY` 또는 `sb_secret_` 문자열이 없음 (`grep` 확인).
   - 기대: 검색 결과 0건.
2. **환경변수 미설정 시 에러 메시지** — `.env.local` 의 `SUPABASE_SECRET_KEY` 줄을 임시로 비우고 `pnpm check:supabase` 실행.
   - 기대: `Missing SUPABASE_URL or SUPABASE_SECRET_KEY` 에러 + exit 1.

## 🔁 Rollback Plan

- 본 spec 은 신규 파일 추가가 대부분. 문제 시:
  - PR revert 1건으로 `src/lib/supabase/`, `scripts/check-supabase.ts`, `.env.example`, README 변경, package.json 변경이 모두 되돌려짐.
  - Supabase 프로젝트 자체는 외부 시스템이라 그대로 유지 (재사용 가능).
- 데이터 영향 없음 (마이그레이션·데이터 적재 없음).

## 📦 Deliverables 체크

- [x] task.md 작성 (다음 단계 — 이 파일과 동시 작성)
- [ ] 사용자 Plan Accept 받음
- [ ] (실행 후) 모든 task 완료
- [ ] (실행 후) walkthrough.md / pr_description.md ship
