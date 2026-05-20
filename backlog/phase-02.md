# phase-02: 검색·프롬프트 조립 (search-prompt)

> 본 phase 의 모든 SPEC 을 한 파일에 요점/방향성으로 나열합니다.
> *구체적* 작업 내용은 `specs/spec-02-{seq}-{slug}/spec.md` 에서 다룹니다.
>
> 본 문서는 "이번 phase 에서 무엇을 어디까지 할 것인가" 를 한 번에 보기 위한 *업무 지도* 입니다.

## 📋 메타

| 항목 | 값 |
|---|---|
| **Phase ID** | `phase-02` |
| **상태** | Planning |
| **시작일** | 2026-05-19 |
| **목표 종료일** | TBD (학습 페이스) |
| **소유자** | @pgaey |
| **Base Branch** | `phase-02-search-prompt` (opt-in) → **최종 머지 대상: `develop`** |

## 🎯 배경 및 목표

### 현재 상황
phase-01 에서 KJV 1,000 verse 를 Supabase pgvector 에 적재하고, `searchVerses(query, k)` 함수로 한국어·영문 질의를 받아 cosine 유사도 top-K verse 를 반환하는 검색 인프라가 완성되었습니다 (평가 결과 EN/KO 모두 100%). 그러나 이 검색 결과를 LLM 에 투입하려면 단순 verse 배열이 아니라 **시스템 지침 + 컨텍스트 + 질문 이 조합된 프롬프트** 가 필요합니다. 또한 이 흐름을 개발 중에 콘솔 또는 API 로 빠르게 확인하고 평가할 수 있는 도구가 없습니다.

### 목표 (Goal)
한국어 질문을 입력받아 verse 검색 → 프롬프트 조립을 수행하고, 그 출력물이 Gemini Flash 등 LLM 에 바로 투입 가능한 형태로 완성된 상태. CLI 스크립트와 임시 API route 두 인터페이스를 통해 검증 가능.

### 성공 기준 (Success Criteria) — 정량 우선
1. `buildPrompt(question, verses)` 가 시스템 지침 + verse 컨텍스트 + 질문을 포함한 프롬프트 문자열을 반환하고 **unit test PASS**
2. `pnpm search:prompt "<질문>"` 실행 시 top-K verse 목록과 완성 프롬프트가 콘솔에 출력됨 (LLM 호출 없음)
3. `pnpm eval:prompt` 실행 시 Genesis 범위 내 정량 질의 **top-5 포함률 ≥ 60%** (phase-01 기준 유지)
4. `POST /api/search` 가 `{ question, k }` 입력을 받아 `{ verses, prompt }` JSON 을 반환함 (LLM 없음)

## 🧩 작업 단위 (SPECs)

> 본 표는 phase 의 *작업 지도* 입니다. SPEC 은 *요점 + 방향성 + 참조* 까지만 적습니다.
> 자세한 spec/plan/task 는 `specs/spec-02-{seq}-{slug}/` 에서 작성합니다.
> sdd 가 `<!-- sdd:specs:start --> ~ <!-- sdd:specs:end -->` 사이를 자동 갱신하므로 마커는 그대로 두세요.

<!-- sdd:specs:start -->
| ID | 슬러그 | 우선순위 | 상태 | 디렉토리 |
|---|---|:---:|---|---|
| `spec-02-01` | prompt-template | P1 | Merged | `specs/spec-02-01-prompt-template/` |
| `spec-02-02` | search-cli | P1 | Merged | `specs/spec-02-02-search-cli/` |
| `spec-02-03` | search-api-route | P2 | Merged | `specs/spec-02-03-search-api-route/` |
<!-- sdd:specs:end -->

> 상태 허용값: `Backlog` / `In Progress` / `Merged`
> sdd가 ship 시 자동으로 `Merged`로 갱신합니다. `In Progress`는 active spec에 자동 마킹됩니다.

### spec-02-01 — prompt-template

- **요점**: `src/lib/prompt/template.ts` — `buildPrompt(question, verses)` 순수 함수 작성 + unit test
- **방향성**: 함수 입력은 사용자 질문(string)과 `VerseMatch[]`; 출력은 시스템 지침(한국어 답변 + 영문 verse 인용 요청) + verse 컨텍스트 블록 + 질문이 조합된 단일 문자열. LLM 의존성 없는 순수 함수로 구현하여 독립 테스트 가능. Jest 또는 Vitest 로 입력/출력 스냅샷 검증.
- **참조**:
  - `src/lib/search/cosine.ts` — `VerseMatch` 타입 참조
- **연관 모듈**: `src/lib/prompt/template.ts`, `src/lib/prompt/__tests__/template.test.ts`

### spec-02-02 — search-cli

- **요점**: `scripts/search-prompt.ts` CLI 스크립트 + `pnpm eval:prompt` 평가 명령
- **방향성**: `tsx scripts/search-prompt.ts "<question>" [k=5]` 로 실행. 내부적으로 `searchVerses` + `buildPrompt` 호출 후 결과를 콘솔에 출력 (verse 표 + 프롬프트 전문). 추가로 `scripts/eval-prompt.ts` 가 평가셋 질의를 일괄 실행하고 top-K 포함률을 마크다운 리포트(`docs/eval/phase-02-prompt-report.md`)로 저장.
- **참조**:
  - `scripts/eval-search.ts` — 평가 스크립트 구조 참조
  - `data/eval-set.json` — 기존 평가셋 재활용
- **연관 모듈**: `scripts/search-prompt.ts`, `scripts/eval-prompt.ts`, `docs/eval/`

### spec-02-03 — search-api-route

- **요점**: `app/api/search/route.ts` — `POST /api/search` API route (LLM 없음, phase-03 연동 대비)
- **방향성**: Next.js App Router Route Handler. `{ question: string, k?: number }` body 수신 → `searchVerses` + `buildPrompt` 호출 → `{ verses: VerseMatch[], prompt: string }` JSON 응답. 입력 유효성 검사 (question 빈값 거부). 테스트: `curl` 또는 `scripts/test-api.ts` 로 엔드포인트 스모크 테스트.
- **참조**:
  - `src/lib/search/cosine.ts`, `src/lib/prompt/template.ts`
  - Next.js App Router Route Handler 문서 (`node_modules/next/dist/docs/` 확인 필수)
- **연관 모듈**: `app/api/search/route.ts`, `src/lib/prompt/template.ts`

## 📌 결정 기록 (Review)

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 프롬프트 언어 | 영문 only / 한국어+영문 혼용 | **한국어 답변 요청 + 영문 verse 인용** | phase-03 에서 Gemini Flash 에 투입 시 한국어 답변·영문 근거 렌더링이 목표이므로 프롬프트도 동일 형태 선제 반영 |
| API route LLM 포함 여부 | 포함 / 미포함 | **미포함 (phase-03 에서 추가)** | phase-02 범위는 "LLM 없는 검색·프롬프트 조립"으로 명시. LLM 호출은 phase-03 Auth·UI 와 함께 통합 |

## 🧪 통합 테스트 시나리오 (간결)

> 본 phase 의 Done 조건 중 하나. `pnpm eval:prompt` 가 시나리오 1·2 를 자동 실행하고 리포트를 생성합니다.
> **현재 적재 상태**: 1,000 / 31,102 verse (Genesis 1~34만). phase-01 편차 인계.

### 시나리오 1: 한국어 질의 → top-K 포함률 (정량)
- **Given**: verses 테이블에 Genesis 1~34 의 1,000 verse 가 768d 임베딩과 함께 적재
- **When**: 평가셋 한국어 5 query 를 `searchVerses(query, 5)` 로 검색
- **Then**: top-5 안에 정답 chapter 의 verse 가 포함되는 비율 ≥ 60%
- **연관 SPEC**: spec-02-02

### 시나리오 2: 프롬프트 조립 형태 검증 (정성)
- **Given**: 한국어 질문과 top-5 verse 결과
- **When**: `buildPrompt(question, verses)` 호출
- **Then**: 출력 프롬프트가 ① 시스템 지침 포함, ② verse 텍스트 인용 포함, ③ 사용자 질문 포함임을 사람이 확인
- **연관 SPEC**: spec-02-01, spec-02-02

### 시나리오 3: API 엔드포인트 스모크 테스트 (정량)
- **Given**: Next.js 개발 서버 실행 중
- **When**: `POST /api/search` with `{ "question": "천지창조", "k": 3 }`
- **Then**: 200 응답, `verses` 배열 3건, `prompt` 문자열 비어있지 않음
- **연관 SPEC**: spec-02-03

### 통합 테스트 실행
```bash
pnpm eval:prompt
# → docs/eval/phase-02-prompt-report.md 생성
# → 콘솔: KO: X/5 (%)
```

## 🔗 의존성

- **선행 phase**: `phase-01` (verses 테이블 + searchVerses 함수)
- **외부 시스템**:
  - Supabase (pgvector 검색 — read-only)
  - Google AI Studio (Gemini Developer API key — 임베딩 전용, LLM 호출 없음)
- **연관 ADR**: 없음

## 📝 위험 요소 및 완화

| 위험 | 영향 | 완화책 |
|---|---|---|
| 프롬프트 템플릿 설계가 phase-03 LLM 통합 시 변경 필요 | 재작업 | 템플릿을 순수 함수로 캡슐화하여 교체 용이하게 유지 |
| Next.js App Router API Route Handler 변경 사항 | 구현 오류 | `node_modules/next/dist/docs/` 실제 문서 확인 후 코드 작성 |
| Supabase free tier 연결 제한 (개발 중 반복 호출) | 503 오류 | CLI/API 테스트 시 DELAY_MS 700ms 유지 (eval-search 선례) |

## 🏁 Phase Done 조건

- [ ] 모든 SPEC 이 `phase-02-search-prompt` 로 merge (3/3)
- [ ] `phase-02-search-prompt` 가 `develop` 으로 merge (`/hk-phase-ship` 시 `--base develop`)
- [x] 시나리오 1 top-K 포함률 ≥ 60% (phase-01 기준 인계, 실측 후 갱신)
- [ ] 시나리오 2 프롬프트 조립 형태 사용자 확인 OK
- [ ] 시나리오 3 API 스모크 테스트 PASS
- [ ] 사용자 최종 승인

## 📊 검증 결과 (phase 완료 시 작성)

<!-- 통합 테스트 로그, 성공 기준 측정값, 회귀 점검 결과 등을 여기 첨부 -->
