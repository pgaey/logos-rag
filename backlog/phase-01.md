# phase-01: 데이터 파이프라인 (data-pipeline)

> 본 phase 의 모든 SPEC 을 한 파일에 요점/방향성으로 나열합니다.
> *구체적* 작업 내용은 `specs/spec-01-{seq}-{slug}/spec.md` 에서 다룹니다.
>
> 본 문서는 "이번 phase 에서 무엇을 어디까지 할 것인가" 를 한 번에 보기 위한 *업무 지도* 입니다.

## 📋 메타

| 항목 | 값 |
|---|---|
| **Phase ID** | `phase-01` |
| **상태** | Planning |
| **시작일** | 2026-05-16 |
| **목표 종료일** | TBD (학습 페이스) |
| **소유자** | @pgaey |
| **Base Branch** | `phase-01-data-pipeline` (opt-in) → **최종 머지 대상: `develop`** (GitFlow 변형) |

## 🎯 배경 및 목표

### 현재 상황
logos-rag 는 한국어 질문 → 영문 KJV 의미 검색 → Gemini Flash 답변 흐름의 풀스택 RAG 포트폴리오. 본격적인 LLM 통합·UI·인증·배포 전에, **검색 인프라가 의도대로 동작하는지 LLM 없이 검증 가능한 단계** 가 필요합니다. 이 phase 는 그 토대를 세웁니다: public domain 영문 성경 텍스트를 verse 단위로 청킹·임베딩하여 Supabase pgvector 에 적재하고, cosine 검색이 의미 유사 verse 와 한국어 cross-lingual 질의에 합리적으로 응답하는지를 평가셋으로 확인합니다.

### 목표 (Goal)
KJV (또는 WEB) 전체 verse 가 Supabase `verses` 테이블에 768차원 임베딩과 함께 적재되어 있고, cosine 유사도 검색이 영문·한국어 입력 모두에 대해 의미적으로 유사한 verse 를 top-K 로 반환하는 상태.

### 성공 기준 (Success Criteria) — 정량 우선
1. KJV (또는 WEB) **31,000+ verse** 가 `verses` 테이블에 적재됨 (book/chapter/verse 메타 포함, 누락 0건)
2. 모든 verse 가 **768차원 (`gemini-embedding-004`) 임베딩 보유** (NULL 0건)
3. 임의 verse 10개로 top-5 cosine 검색 시, 평가자가 보기에 **의미 유사 verse 가 최소 1건 포함** 비율 ≥ 80%
4. 한국어 자연어 문장 10개로 cross-lingual top-5 검색 시, 의미 관련 영문 verse **최소 1건 포함** 비율 ≥ 60% (LLM 없이 임베딩만으로)
5. 전체 적재 비용 **무료 tier 내 (≤ $0)** — Gemini text-embedding-004 free tier RPM 제한 안에서 배치 처리

## 🧩 작업 단위 (SPECs)

> 본 표는 phase 의 *작업 지도* 입니다. SPEC 은 *요점 + 방향성 + 참조* 까지만 적습니다.
> 자세한 spec/plan/task 는 `specs/spec-01-{seq}-{slug}/` 에서 작성합니다.
> sdd 가 `<!-- sdd:specs:start --> ~ <!-- sdd:specs:end -->` 사이를 자동 갱신하므로 마커는 그대로 두세요.

<!-- sdd:specs:start -->
| ID | 슬러그 | 우선순위 | 상태 | 디렉토리 |
|---|---|:---:|---|---|
| `spec-01-01` | bootstrap-supabase | P? | Merged | `specs/spec-01-01-bootstrap-supabase/` |
| `spec-01-02` | bible-source-fetch | P? | Merged | `specs/spec-01-02-bible-source-fetch/` |
| `spec-01-03` | verse-schema-migration | P? | Merged | `specs/spec-01-03-verse-schema-migration/` |
| `spec-01-04` | embedding-batch-script | P? | Active | `specs/spec-01-04-embedding-batch-script/` |
<!-- sdd:specs:end -->

> 상태 허용값: `Backlog` / `In Progress` / `Merged`
> sdd가 ship 시 자동으로 `Merged`로 갱신합니다. `In Progress`는 active spec에 자동 마킹됩니다.

### spec-01-01 — bootstrap-supabase

- **요점**: Supabase 프로젝트 연결·pgvector 활성화·환경변수 wiring·연결 smoke test. 추가로 GitFlow 준비 (`develop` 브랜치 생성).
- **방향성**: `@supabase/supabase-js` 의존성 설치 → `.env.local` 변수 정의 (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `GEMINI_API_KEY`) → 서버사이드 클라이언트 모듈 (`src/lib/supabase/server.ts`) → `pgvector` extension 활성화 (Dashboard 수동 또는 SQL) → 간단한 health check 라우트/스크립트로 연결 검증. `develop` 브랜치를 main 에서 분기 후 push.
- **참조**:
  - `.harness-kit/agent/constitution.md` §10 Git Law (브랜치 보호)
- **연관 모듈**: `src/lib/supabase/`, `.env.local`, `scripts/health-check.ts` (or API route)

### spec-01-02 — bible-source-fetch

- **요점**: KJV 또는 WEB raw text 를 신뢰 가능한 public domain 출처에서 받아 정규화된 JSON (verse 단위) 으로 저장.
- **방향성**: 후보 출처 비교 (예: `aruljohn/Bible-kjv` GitHub repo, `scrollmapper/bible_databases`, `bible-api.com` dump). 라이선스 확인 (public domain 명시) → 다운로드 스크립트 (`scripts/fetch-bible.ts`) → `{ book, chapter, verse, text }` 배열로 정규화하여 `data/bible.kjv.json` (또는 WEB) 으로 commit. 데이터 파일은 git LFS 없이 직접 커밋 (수 MB 수준 예상).
- **참조**:
  - KJV public domain 상태 (영국 외 지역에서 public domain; 영국은 Crown copyright)
- **연관 모듈**: `scripts/fetch-bible.ts`, `data/`

### spec-01-03 — verse-schema-migration

- **요점**: `verses` 테이블 + `(book, chapter, verse)` 유니크 + 768d `vector` 컬럼 + 인덱스 (`ivfflat` or `hnsw`) Supabase migration 작성·적용.
- **방향성**: Supabase CLI 도입 검토 (or Dashboard SQL 에디터 수동). 마이그레이션 파일 `supabase/migrations/<timestamp>_create_verses.sql`. RLS 비활성화 (서버 전용 테이블이므로 secret key 로만 접근). 인덱스 종류·차원·리스트 수는 spec 안에서 결정.
- **참조**:
  - pgvector 공식 문서 (인덱스 선택 가이드)
- **연관 모듈**: `supabase/migrations/`, (선택) `src/lib/db/types.ts`

### spec-01-04 — embedding-batch-script

- **요점**: 로컬 Node 스크립트로 verse 배열 → Gemini `text-embedding-004` → `verses` 테이블 upsert. 배치·rate limit·재시도·진행률 표시.
- **방향성**: `@google/genai` SDK (Gen AI 통합 SDK) 사용. 배치 크기 100, RPM 제한에 맞춰 sleep, 실패 시 지수 backoff 3회. 진행률은 stdout 에 `N/31102` 형태. **로컬 실행 전용** (Vercel 서버리스 타임아웃 회피). 한 번 적재되면 재실행 시 이미 임베딩된 verse 는 skip.
- **참조**:
  - Gemini Developer API rate limit 문서 (free tier RPM/RPD)
- **연관 모듈**: `scripts/embed-bible.ts`, `src/lib/embedding/gemini.ts`

### spec-01-05 — cosine-search-verification

- **요점**: Postgres RPC (SQL 함수) 로 cosine 검색 인터페이스 정의 + 평가셋 10+10 으로 성공 기준 3·4 측정.
- **방향성**: `match_verses(query_embedding vector(768), match_count int)` SQL 함수 → 호출용 TypeScript 래퍼 (`src/lib/search/cosine.ts`) → 평가 스크립트 (`scripts/eval-search.ts`) 가 정답 후보를 표시하고 결과를 마크다운 리포트로 저장 → phase 통합 테스트로 사용.
- **참조**:
  - 평가셋은 spec 안에서 작성 (예: "사랑은 오래 참고…" → 1 Corinthians 13)
- **연관 모듈**: `supabase/migrations/`, `src/lib/search/`, `scripts/eval-search.ts`

## 📌 결정 기록 (Review)

> Phase PR review 중 발생한 결정·합의·발견을 누적합니다. Spec walkthrough 의 결정 기록과 동일 패턴이며 Phase 레벨 living decision log 역할 (→ agent.md §6.3.2).

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 임베딩 모델 | Gemini 004 / OpenAI 3-small / Voyage multilingual-2 | **Gemini text-embedding-004** | Gemini Flash 와 키 통합, 무료 tier 풍부, multilingual 지원 |
| 청킹 단위 | verse / 단락 / chapter / sliding window | **verse 단위 + 메타 포함** | 답변 시 근거 인용이 자연스럽고, 검색 시 인접 verse 확장으로 컨텍스트 보강 가능 |
| 일일 질문 한도 (phase-04 에서 구현) | 10 / 20 / 50 | **20** | 데모·포트폴리오용으로 적당, Gemini Flash free tier 여유 |
| v1.5 SSO 구조 | 모노리포 즉시 분리 / 단일 앱 / 미결 | **단일 Next 앱 + `src/lib/auth/` 모듈 캡슐화** | v1 학습 초점 유지, 분리 비용은 모듈 경계로 사전 완화 |
| Phase PR 최종 머지 대상 | main / develop | **develop** | GitFlow 변형 — main = 배포 가능 안정본, develop = 통합 브랜치. Vercel: main=Production, develop=Preview 와 매핑 |
| Phase base branch 사용 | yes / no | **yes** (`phase-01-data-pipeline`) | spec PR 들이 phase 브랜치로 누적 → phase 단위 통합 테스트 후 develop 진입. 학습 목적으로 한 번 경험 |
| 성경 텍스트 출처 | KJV / WEB | **spec-01-02 에서 비교 후 결정** | 둘 다 public domain. WEB 은 현대 영어, KJV 는 고전. 임베딩 품질 영향 검토 후 선택 |
| Supabase CLI 도입 | yes / Dashboard 수동 | **spec-01-03 에서 결정** | CLI = migration 버전 관리·재현성 ↑, 학습 부담 ↑ |
| pgvector 인덱스 종류 | ivfflat / hnsw / 없음 | **spec-01-03 에서 결정** | 31k row 규모에선 인덱스 없이도 동작 가능. hnsw 가 recall 우수하나 빌드 시간 ↑ |

## 🧪 통합 테스트 시나리오 (간결)

> 본 phase 의 Done 조건 중 하나. spec-01-05 의 평가 스크립트가 시나리오 1·2 를 자동 실행하고 리포트를 생성합니다.

### 시나리오 1: 영문 verse → 의미 유사 영문 verse 검색
- **Given**: `verses` 테이블에 KJV 전체 + 768d 임베딩 적재 완료
- **When**: 임의 verse 10개 (예: John 3:16, 1 Cor 13:4, Psalm 23:1 …) 의 임베딩으로 `match_verses(embedding, 5)` 호출
- **Then**: 각 결과 top-5 안에 평가자 기준 "의미 유사" verse 가 최소 1건 포함되는 비율 ≥ 80%
- **연관 SPEC**: spec-01-03, spec-01-04, spec-01-05

### 시나리오 2: 한국어 자연어 → cross-lingual 영문 verse 검색
- **Given**: 시나리오 1 의 상태 + Gemini `text-embedding-004` 한국어 입력 가능 확인
- **When**: 한국어 질문 10개 (예: "사랑이란 무엇인가", "두려워하지 말라", "선한 사마리아인 비유" …) 를 임베딩하여 `match_verses(embedding, 5)` 호출
- **Then**: top-5 안에 의미 관련 영문 verse 가 최소 1건 포함되는 비율 ≥ 60%
- **연관 SPEC**: spec-01-04, spec-01-05

### 통합 테스트 실행
```bash
# 본 phase 의 평가 스크립트 (spec-01-05 에서 작성)
pnpm tsx scripts/eval-search.ts
# → docs/eval/phase-01-search-report.md 생성
```

## 🔗 의존성

- **선행 phase**: 없음 (첫 phase)
- **외부 시스템**:
  - Supabase (Postgres + pgvector + Auth — 이번 phase 는 DB·pgvector 만 사용)
  - Google AI Studio (Gemini Developer API key, `text-embedding-004` 모델)
  - KJV/WEB public domain 텍스트 출처 (spec-01-02 에서 확정)
- **연관 ADR**: 없음 (선결 결정 4건은 본 문서 결정 기록 표에 인라인 캡처)

## 📝 위험 요소 및 완화

| 위험 | 영향 | 완화책 |
|---|---|---|
| 성경 텍스트 출처 라이선스 모호 | 법적 리스크 | spec-01-02 에서 public domain 명시 출처만 채택, README 에 출처/라이선스 명시 |
| Gemini text-embedding-004 free tier rate limit 초과 | 적재 실패·재시도 비용 | 배치 크기 + sleep + 지수 backoff, 진행률 저장으로 중단 시 재개 가능 |
| Supabase 무료 tier 용량 (500MB) 초과 | 적재 실패 | 31k verse × 768d float = ~95MB, 인덱스 포함 ~150MB 예상 — 여유 충분. 사전 계산값을 spec-01-03 에 기록 |
| verse 단독 임베딩의 의미 손실 (1 verse = 짧은 문장) | 검색 품질 저하 | 시나리오 1·2 의 정량 기준 미달 시 phase 회고에서 sliding window 도입 또는 chapter 메타 결합 검토 (icebox 등록) |
| Vercel 서버리스 함수 타임아웃 | 임베딩 적재 실패 | 임베딩 배치는 **로컬 실행 전용** 으로 명시 (spec-01-04). Vercel 함수는 검색 read-only 만 |
| GitFlow 운영 미숙 | 잘못된 브랜치에 머지 | phase.md 메타에 `develop` 명시, spec-01-01 에서 `develop` 브랜치 생성 + GitHub 보호 룰 추가 |

## 🏁 Phase Done 조건

- [ ] 모든 SPEC 이 `phase-01-data-pipeline` 으로 merge
- [ ] `phase-01-data-pipeline` 가 `develop` 으로 merge (`/hk-phase-ship` 시 `gh pr create --base develop` 수동 override)
- [ ] 시나리오 1·2 정량 기준 통과 (성공 기준 3·4 충족)
- [ ] 성공 기준 정량 측정 결과를 본 문서 하단 "검증 결과" 섹션에 기록
- [ ] 사용자 최종 승인

## 📊 검증 결과 (phase 완료 시 작성)

<!-- 통합 테스트 로그, 성공 기준 측정값, 회귀 점검 결과 등을 여기 첨부 -->
