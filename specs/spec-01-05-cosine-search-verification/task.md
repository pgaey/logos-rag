# Task List: spec-01-05

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성 (sdd 자동)
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] phase-01.md SPEC 표 자동 갱신 (sdd 자동)
- [x] 사용자 Plan Accept

---

## Task 1: 브랜치 + pre-flight commit (HTML overview 포함)

- [x] `git checkout -b spec-01-05-cosine-search-verification`
- [x] `git add backlog/ specs/spec-01-05-cosine-search-verification/ docs/phase-01-overview.html`
- [x] Commit: `chore(spec-01-05): scaffold spec/plan/task + phase-01 overview html`

> phase-01 overview HTML 은 사용자 요청으로 사전 생성됨. spec-01-05 의 docs 산출물로 포함 (plan.md "Proposed Changes / docs/phase-01-overview.html" 참조).

---

## Task 2: match_verses 마이그레이션

- [x] `supabase migration new add_match_verses_function` → `supabase/migrations/20260518133909_add_match_verses_function.sql`
- [x] SQL 작성 (cosine `<=>`, `1 - distance` similarity, `WHERE embedding IS NOT NULL`)
- [x] Commit: `feat(spec-01-05): add match_verses RPC migration`

---

## Task 3: 마이그레이션 적용 + types 재생성 (Opus 직접)

> **버그 1건**: 첫 push 시 `operator does not exist: extensions.vector <=> extensions.vector` — pgvector 의 `<=>` operator 도 extensions 스키마. 함수에 `SET search_path = extensions, public` 추가 후 재push 성공.

- [x] `supabase db push` → 성공 (search_path fix 후)
- [x] `supabase gen types typescript --linked > src/lib/db/types.ts` → match_verses 타입 포함 확인 (`Args: { match_count, query_embedding }`, `Returns: VerseMatch[]`)
- [x] `pnpm exec tsc --noEmit` PASS
- [x] Commit: `fix(spec-01-05): set search_path for pgvector operators + regen types`

---

## Task 4: 평가셋 작성 (Opus 직접 — 도메인 판단 필요)

- [x] `data/eval-set.json` 작성:
  - quantitative.en 5건 (Genesis 1:1, 4:8, 7:11, 11:4, 22:9 — 모두 적재 범위)
  - quantitative.ko 5건 (Genesis 1:1, 4:8, 7:11, 28:12, 22:9 — 자연스러운 한국어)
  - qualitative_ko 3건 (1Cor 13, Ps 23, Lk 10 — out-of-range, 사람 판단)
- [x] 사용자 검토 OK (1번 선택 — 그대로 commit)
- [x] Commit: `chore(spec-01-05): add evaluation set (Genesis quantitative + OoR qualitative)`

---

## Task 5: TS wrapper + 평가 스크립트 (Sonnet sub-agent)

- [x] `src/lib/search/cosine.ts` 작성 (Database['public']['Functions']['match_verses'] 타입 활용)
- [x] `scripts/eval-search.ts` 작성 (정량 hit rate + 정성 dump → 마크다운 리포트)
- [x] `package.json` 의 `scripts` 에 `"eval:search": "tsx --env-file=.env.local scripts/eval-search.ts"`
- [x] `pnpm exec tsc --noEmit` PASS
- [x] Commit: `feat(spec-01-05): add cosine search wrapper and eval script`

---

## Task 6: check:supabase 확장 (Sonnet sub-agent)

- [x] 6번째 검증 추가 (match_verses 함수 pg_proc 조회). FAIL 시 exit 1
- [x] `pnpm check:supabase` 6단계 PASS 확인
- [x] Commit: `feat(spec-01-05): verify match_verses fn in check:supabase`

---

## Task 7: 평가 실행 + 정성 사용자 판단 (커밋 없음)

> **버그 1건**: 1차 실행 시 모든 query "Invalid path specified in request URL" 실패. 원인 = `.env.local` 의 `NEXT_PUBLIC_SUPABASE_URL` 끝에 `/rest/v1/` 가 붙어 있었음 (사용자가 base URL 대신 PostgREST endpoint URL 을 복붙). 사용자가 base URL 로 수정 후 재실행 성공. 이전 모든 spec 이 pg 직접 연결만 사용해서 처음 발견.

- [x] `pnpm eval:search` 1회 실행 (URL fix 후) → 콘솔 요약 + 리포트 생성 확인
- [x] 정량 hit rate: **EN 5/5 (100%) + KO 5/5 (100%) = 10/10 (100%)**
- [x] 정성 3건 사람 판단 — 모두 의미 합리적 (Gen 29:20, 28:21, 21:19)
- [x] Commit: 없음

---

## Task 8: 평가 결과 commit + phase-01.md 갱신

- [x] `docs/eval/phase-01-search-report.md` 생성된 파일 commit
- [x] phase-01.md 통합 테스트 시나리오 — 1,000 verse + Genesis 범위 전제로 시나리오 1·2·3 재작성
- [x] phase-01.md 결정 기록 표 — spec-01-04 (모델 마이그, 적재 범위) + spec-01-05 (평가 paradigm) deviation 3 행 추가
- [x] phase-01.md Done 조건 — 시나리오 1·2·3 측정 결과 inline 기록 + 체크박스 갱신
- [x] Commit: `docs(spec-01-05): commit eval report + update phase-01 scenarios`

---

## Task 9: README 갱신 (Sonnet sub-agent)

- [x] `## 셋업` 13번 (`pnpm eval:search`) 삽입, 14번 `pnpm dev` 로 번호 재정렬
- [x] `## 환경변수` 표의 `NEXT_PUBLIC_SUPABASE_URL` 행에 "/rest/v1/ 함정" caveat 추가 (Task 7 사고 방지)
- [x] `## 스크립트` 표에 `pnpm eval:search` 추가
- [x] Commit: `docs(spec-01-05): add eval:search step + supabase URL caveat to README` (c69f2e2)

---

## Task 10: Ship

- [x] 코드 품질: tsc / lint PASS
- [x] 통합 smoke: `pnpm check:supabase` 6단계 PASS
- [x] walkthrough.md 작성 — 결정 11건 + 사용자 협의 5건 + 검증 + 발견 6건
- [x] pr_description.md 작성 — Key Review Points 5건
- [x] `bash .harness-kit/bin/sdd ship`
- [x] sync commit
- [x] `git push -u origin spec-01-05-cosine-search-verification`
- [x] `gh pr create --base phase-01-data-pipeline ...`
- [x] 사용자 알림 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 10 (Task 7 는 노 commit) |
| **예상 commit 수** | 9 |
| **현재 단계** | Shipped (PR 대기) |
| **마지막 업데이트** | 2026-05-18 |
