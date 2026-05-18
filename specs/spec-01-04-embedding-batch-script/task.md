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

## Task 4: 실제 임베딩 적재 + 검증 (커밋 없음)

### 4-1. 1pass + 2pass 실행
- [ ] `pnpm embed:bible` 실행 → 1pass 완료 로그 + 2pass 진행률 관찰
- [ ] 완료 후 `[embed:bible] all 31102 verses embedded.` 확인
- [ ] 종료 검증 (NULL count = 0) PASS 확인

### 4-2. 사후 검증
- [ ] `pnpm check:supabase` → 5단계 모두 PASS, embeddings 행 `PASS (31102/31102 filled)`
- [ ] **재실행 안전성**: `pnpm embed:bible` 재실행 → "이미 적재됨" 메시지 후 즉시 종료 ≤ 2초
- [ ] Commit: 없음

---

## Task 5: README 갱신 (Sonnet sub-agent 위임)

### 5-1. README 패치
- [ ] `## 셋업` 섹션에 새 단계 (현재 11번 `pnpm fetch:bible` 다음): "임베딩 적재: `pnpm embed:bible`" 삽입
- [ ] `## 스크립트` 표에 `pnpm embed:bible` 행 추가
- [ ] Commit: `docs(spec-01-04): add embed:bible step to README`

---

## Task 6: Ship

> 모든 작업 task 완료 후 `/hk-ship` 절차를 따릅니다.

- [ ] 코드 품질 점검: `pnpm exec tsc --noEmit` PASS
- [ ] 코드 품질 점검: `pnpm lint` PASS
- [ ] 통합 smoke 재실행: `pnpm check:supabase` 5단계 PASS
- [ ] **walkthrough.md 작성** (Opus 메인)
- [ ] **pr_description.md 작성** (Opus 메인)
- [ ] **Ship**: `bash .harness-kit/bin/sdd ship`
- [ ] sdd 자동 갱신분 sync commit
- [ ] **Push**: `git push -u origin spec-01-04-embedding-batch-script`
- [ ] **PR 생성**: `gh pr create --base phase-01-data-pipeline --title "feat(spec-01-04): WEB bible 임베딩 적재" --body-file ...`
- [ ] **사용자 알림**: PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 6 (Task 4 는 노 commit) |
| **예상 commit 수** | 5 (Task 1-2, 2, 3, 5, Ship + sync) |
| **현재 단계** | Planning (사용자 Plan Accept 대기) |
| **마지막 업데이트** | 2026-05-18 |
