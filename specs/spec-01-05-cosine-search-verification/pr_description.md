# feat(spec-01-05): cosine 검색 RPC + 평가셋 (정량 100% PASS)

## 📋 Summary

### 배경 및 목적
phase-01 의 마지막 spec. spec-01-04 까지 만들어진 verses + 768d 임베딩 위에 **cosine 검색 인프라** (Postgres RPC + TS wrapper) 와 **평가셋 기반 검증 메커니즘** 을 올려, phase-01 의 핵심 가설 ("한국어 질문 → 영문 verse 의미 검색 가능") 을 정량·정성으로 측정합니다.

### 주요 변경 사항
- [x] **`match_verses` Postgres RPC** — `query_embedding vector(768), match_count int → top-K rows with similarity`. cosine distance `<=>` + `WHERE embedding IS NOT NULL`
- [x] **`src/lib/search/cosine.ts`** — `searchVerses(query, k)` TS wrapper. generated types 활용, `any` 0건
- [x] **`data/eval-set.json`** — 정량 10건 (영문 5 + 한국어 5, Genesis 1~34) + 정성 3건 (out-of-range: 1Cor 13 / Ps 23 / Lk 10)
- [x] **`scripts/eval-search.ts` + `pnpm eval:search`** — 평가셋 → match_verses → 정량 hit rate + 정성 dump → 마크다운 리포트
- [x] **`pnpm check:supabase` 6단계** — match_verses 함수 존재 검증 추가 (fail-hard)
- [x] **phase-01.md 갱신** — 시나리오 1·2·3 재작성 (1,000 verse + Genesis 범위 전제) + 결정 기록 표에 deviation 3 행 추가
- [x] **`docs/phase-01-overview.html`** — phase-01 전체 architecture 시각화 (SVG 3개 + 카드 + 결정 트레일)
- [x] **README** — `pnpm eval:search` 단계 + 환경변수 표의 SUPABASE_URL caveat

### Phase 컨텍스트
- **Phase**: `phase-01` (data-pipeline, base → develop)
- **본 SPEC 의 역할**: phase-01 의 마지막. 인프라(01) ✓ → 데이터(02) ✓ → 스키마(03) ✓ → 적재(04) ✓ → **검색·검증(05)** ← 본 PR. 머지 후 phase-01 종료 → develop → main.

## 🎯 Key Review Points

1. **검색 인프라** (`match_verses` migration + `cosine.ts`)
   - Postgres RPC + TS wrapper 의 1:1 매핑. `Database['public']['Functions']['match_verses']['Returns'][number]` 타입 활용 → `any` 0건
   - `<=>` (cosine distance) → `1 - distance` = similarity (0~1 직관)
   - `WHERE embedding IS NOT NULL` 로 부분 적재 상태 대응
   - **fix 1건**: pgvector operator 도 extensions 스키마 → `SET search_path = extensions, public` 추가 (spec-01-03 의 `extensions.vector` 패턴 연장선)

2. **평가 paradigm** (Constitution §5.6 deviation 의 합리적 적용)
   - spec-01-04 의 scope 축소 (1,000 / 31,102 적재) → phase-01 의 원래 통합 테스트 시나리오 무효화
   - 새 paradigm: Genesis 범위 안 **정량 (정답 verse 적재 보장)** + 범위 밖 **정성 (사람 판단)**
   - phase-01.md 통합 테스트·Done 조건도 같이 갱신 (phase 단위 deviation)
   - 정량 매칭 정책: chapter 일치 = HIT, verse 까지 정확 = EXACT (paraphrase 관대화)

3. **검증 결과: 정량 100% PASS** (목표 60% 대폭 초과)
   - EN 5/5 (3 EXACT + 2 HIT)
   - KO 5/5 (3 EXACT + 2 HIT) ← **cross-lingual 작동 검증**
   - 정성 3건 모두 의미 합리적 (사용자 판단 OK)

4. **버그 발견 + caveat 추가** (`/rest/v1/` URL 함정)
   - Supabase JS 첫 실전 호출에서 모든 query "Invalid path specified" — 사용자 `.env.local` 의 `NEXT_PUBLIC_SUPABASE_URL` 끝에 `/rest/v1/` 가 붙어 있었음
   - **이전 모든 spec 이 pg 직접 연결만 사용해서 처음 발견** = 검출 부채
   - 해결: 사용자 환경 수정 + README §환경변수 표에 caveat 추가 (재발 방지)

5. **HTML overview** (`docs/phase-01-overview.html`)
   - phase 단위 architecture doc 첫 사례. SVG 3개 (전체 흐름 / verse 변환 / spec-01-05 미리보기) + 카드 + 결정 트레일 + 이후 로드맵
   - 사용자 학습 자료에서 출발했으나 후속 phase 도 같은 패턴 적용 가능

## 🧪 Verification

### 자동 테스트
```bash
pnpm exec tsc --noEmit   # 0 errors
pnpm lint                # 0 errors
```

### 통합 테스트
```bash
pnpm check:supabase
# 6단계 모두 PASS (embeddings INFO, match_verses fn PASS)

pnpm eval:search
# EN: 5/5 (100%), KO: 5/5 (100%), 합산: 10/10 (100%)
# 정성 3건: Gen 29:20 / Gen 28:21 / Gen 21:19 (사용자 판단 OK)
# 리포트: docs/eval/phase-01-search-report.md
```

### 수동 검증 시나리오
1. **정량 query** — 영문/한국어 paraphrase 모두 top-5 안 정답 chapter 매칭 ✓
2. **정성 query** — out-of-range (신약·시편) 도 Genesis 안에서 의미 가까운 verse 반환 ✓
3. **재실행 안정성** — `pnpm eval:search` 재실행 시 유사한 결과 (Gemini embedding 미세 변동 ±5%)

## 📦 Files Changed

### 🆕 New Files
- `specs/spec-01-05-cosine-search-verification/{spec,plan,task,walkthrough,pr_description}.md`
- `supabase/migrations/20260518133909_add_match_verses_function.sql`
- `src/lib/search/cosine.ts` — TS wrapper
- `scripts/eval-search.ts` — 평가 스크립트
- `data/eval-set.json` — 평가셋 (정량 10 + 정성 3)
- `docs/eval/phase-01-search-report.md` — 평가 리포트 (자동 생성)
- `docs/phase-01-overview.html` — phase-01 architecture 시각화 (SVG 3개 + 카드)

### 🛠 Modified Files
- `package.json` — `eval:search` npm script
- `src/lib/db/types.ts` — match_verses Function 타입 추가 (regen)
- `scripts/check-supabase.ts` — 6번째 검증 (match_verses fn)
- `README.md` — 셋업 13번 + 환경변수 SUPABASE_URL caveat + 스크립트 표
- `backlog/phase-01.md` — 시나리오 1·2·3 재작성 + 결정 기록 3 행 + Done 조건 측정 결과
- `backlog/queue.md` — sdd 자동 갱신

### 🔢 Commit History (~10건)
```
103c944 chore: scaffold spec/plan/task + phase-01 overview html
0ca6c11 feat: add match_verses RPC migration
ce4baaa fix: set search_path for pgvector operators + regen types
a86544e chore: add evaluation set
d8ea310 feat: add cosine search wrapper and eval script
deca738 feat: verify match_verses fn in check:supabase
4604da3 docs: commit eval report + update phase-01 scenarios
c69f2e2 docs: add eval:search step + supabase URL caveat to README
(+ ship commits)
```

## ✅ Definition of Done

- [x] match_verses RPC migration commit + db push 적용 + types 갱신
- [x] `src/lib/search/cosine.ts` TS wrapper + tsc PASS
- [x] `data/eval-set.json` (정량 10 + 정성 3) commit
- [x] `pnpm eval:search` 실행 성공 — 콘솔 + 리포트
- [x] 정량 정확도 ≥ 60% (실측 100%)
- [x] 정성 리포트 사용자 판단 OK
- [x] `pnpm check:supabase` 6단계 PASS
- [x] tsc / lint PASS
- [x] README 셋업 + 환경변수 caveat
- [x] phase-01.md 통합 테스트 시나리오 + Done 조건 갱신
- [x] `walkthrough.md` 와 `pr_description.md` ship commit
- [x] 브랜치 push 완료 (`spec-01-05-cosine-search-verification` → `phase-01-data-pipeline`)
- [ ] 사용자 PR 머지 → phase-01 종료

## 🔗 관련 자료

- Phase: `backlog/phase-01.md`
- Spec/Plan/Task/Walkthrough: `specs/spec-01-05-cosine-search-verification/`
- 평가 리포트: `docs/eval/phase-01-search-report.md`
- phase 개요 HTML: `docs/phase-01-overview.html`
- 선행 PR: #1 (bootstrap) · #2 (fetch) · #3 (schema) · #4 (embed) 모두 머지됨

## 🏁 Next Step

PR 머지 후:
1. `phase-01-data-pipeline` → **`develop`** PR 생성 (`/hk-phase-ship` 또는 `gh pr create --base develop`)
2. `develop` → **`main`** PR (v1 milestone)
3. **phase-02** `search-prompt` 진입 — LLM 없이 검색 + 프롬프트 조립
