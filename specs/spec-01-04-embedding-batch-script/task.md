# Task List: spec-01-04

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

## Task 1: 브랜치 생성 + pre-flight 산출물 commit

### 1-1. spec 브랜치 분기
- [x] phase-01-data-pipeline 최신 (fast-forward 후 분기)
- [x] `git checkout -b spec-01-04-embedding-batch-script`

### 1-2. pre-flight 산출물 commit
- [x] `git add backlog/phase-01.md backlog/queue.md specs/spec-01-04-embedding-batch-script/`
- [x] Commit: `chore(spec-01-04): scaffold spec/plan/task artifacts` (c6c995c)

---

## Task 2: 의존성 + 스크립트 작성 (Sonnet sub-agent 위임)

### 2-1. 의존성 + npm script
- [x] `pnpm add @google/genai`
- [x] `package.json` 의 `scripts` 에 `"embed:bible": "tsx --env-file=.env.local scripts/embed-bible.ts"` 추가

### 2-2. `scripts/embed-bible.ts` 작성
- [x] 환경변수 검증 (`SUPABASE_DB_URL`, `GEMINI_API_KEY`)
- [x] pg Client 연결
- [x] 1pass: `data/web-bible.json` → 다건 INSERT (chunk 1000건씩, ON CONFLICT DO NOTHING)
- [x] 2pass: SELECT NULL → batchEmbedContents (100) → Promise.all UPDATE → progress log + sleep + backoff
- [x] 종료 검증: NULL count = 0
- [x] `pnpm exec tsc --noEmit` PASS

### 2-3. Commit
- [x] Commit: `feat(spec-01-04): add bible embedding batch script`

---

## Task 3: check:supabase 확장 (Sonnet sub-agent 위임)

### 3-1. `scripts/check-supabase.ts` 에 5번째 검증 추가
- [x] `verses` 테이블의 total / NULL embedding count 조회
- [x] fail-soft 출력: `INFO (table empty)` / `INFO (X/Y filled)` / `PASS (Y/Y filled)`
- [x] exit code 항상 0 (INFO 는 informational)

### 3-2. 통합 smoke
- [x] `pnpm check:supabase` 실행 → 5단계 출력. 적재 전이라 embeddings 행은 `INFO (table empty)` 예상

### 3-3. Commit
- [x] Commit: `feat(spec-01-04): add embeddings status to check:supabase`

---

## Task 4: 실제 임베딩 적재 + 검증

> **3건의 fix commit 발생** (Constitution §5.6 deviation):
> 1. `a883155` text-embedding-004 deprecated → gemini-embedding-001 마이그레이션
> 2. `686c273` batch 안 N contents 가 N requests 카운트 발견 → BATCH_SIZE=1, DELAY_MS=700
> 3. `288b222` embed_content_free_tier_requests = RPD 1,000 발견 → graceful exit + scope 축소
> 4. `615e201` icebox 등록 (전체 31k 적재)
> 5. `4a510ae` README RPD 안내

### 4-1. 1pass + 2pass 실행 (사용자 결정: 무료 tier 유지)
- [x] `pnpm embed:bible` 실행 → 1pass `inserted 0 verses (31102 already existed)`
- [x] 2pass 진행 — 무료 tier RPD 1,000 한도까지 적재 후 graceful exit
- [x] DB 상태: **1,000/31,102 verse 임베딩 완료** (정확히 RPD 한도와 일치)

### 4-2. 사후 검증
- [x] `pnpm check:supabase` → 5단계 PASS, embeddings 행 `INFO (1000/31102 filled, resume with pnpm embed:bible)`
- [x] **재실행 안전성**: re-run → 1pass 즉시 ON CONFLICT skip + 2pass 즉시 quota 도달 → graceful exit 0
- [x] backlog Icebox 에 "전체 31k 적재 (Tier 1 또는 v2)" 등록
- [x] Commit: 없음 (검증)

---

## Task 5: README 갱신

### 5-1. 기본 추가 (Sonnet sub-agent — 649ac04)
- [x] `## 셋업` 12번에 `pnpm embed:bible` 단계 삽입, 13번 `pnpm dev` 로 번호 재정렬
- [x] `## 스크립트` 표 행 추가
- [x] Commit: `docs(spec-01-04): add embed:bible step to README` (649ac04)

### 5-2. RPD + Tier 1 안내 보충 (Opus 직접 — 4a510ae)
- [x] 셋업 12번에 무료 tier RPD 1,000 + Tier 1 가속 옵션 + graceful exit 메시지 명시
- [x] 스크립트 표 의 embed:bible 설명에 모델명 (gemini-embedding-001) + env override 안내
- [x] Commit: `docs(spec-01-04): document RPD 1000 + tier 1 acceleration in README` (4a510ae)

---

## Task 6: Ship

> 모든 작업 task 완료 후 `/hk-ship` 절차를 따릅니다.

- [x] 코드 품질 점검: `pnpm exec tsc --noEmit` PASS
- [x] 코드 품질 점검: `pnpm lint` PASS
- [x] 통합 smoke 재실행: `pnpm check:supabase` 5단계 (embeddings INFO 포함) PASS
- [x] **walkthrough.md 작성** — 디버깅 여정 3건 (deprecation / RPM / RPD) + scope 축소 결정 풍부 기록
- [x] **pr_description.md 작성** — Key Review Points 강조 (scope 축소·graceful exit·env override)
- [x] **Ship**: `bash .harness-kit/bin/sdd ship`
- [x] sdd 자동 갱신분 sync commit
- [x] **Push**: `git push -u origin spec-01-04-embedding-batch-script`
- [x] **PR 생성**: `gh pr create --base phase-01-data-pipeline ...`
- [x] **사용자 알림**: PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 6 (Task 4 는 노 commit) |
| **실제 commit 수** | 10 (5 정상 + 3 fix + 1 icebox + 1 README 보충 → Ship 까지 12 예상) |
| **현재 단계** | Shipped (PR 대기) |
| **마지막 업데이트** | 2026-05-18 |
