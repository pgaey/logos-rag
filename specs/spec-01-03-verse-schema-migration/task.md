# Task List: spec-01-03

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
- [x] phase-01-data-pipeline 최신 (방금 fast-forward)
- [x] `git checkout -b spec-01-03-verse-schema-migration`
- [x] Commit: 없음

### 1-2. pre-flight 산출물 commit
- [x] `git add backlog/phase-01.md backlog/queue.md specs/spec-01-03-verse-schema-migration/`
- [x] Commit: `chore(spec-01-03): scaffold spec/plan/task artifacts`

---

## Task 2: Supabase CLI 셋업 + init + link

### 2-1. 사용자가 직접 수행
- [x] **CLI 설치 우회 경로**: brew 가 libcurl 심볼 불일치로 실패 → `pnpm add -g supabase` + 수동 postinstall + symlink 로 설치 (`supabase 2.98.2`)
- [x] Supabase Dashboard → Account → Access Tokens → PAT 발급
- [x] `supabase login` → 브라우저 verification code 입력 → keychain 저장 성공

### 2-2. 에이전트가 수행
- [x] `supabase projects list` 로 project ref 자동 발견 (`qmxeysejsxwoofmvjtcv`, logos-rag, Seoul)
- [x] `supabase init` → `supabase/{config.toml, .gitignore, .temp/}` 생성
- [x] `supabase link --project-ref qmxeysejsxwoofmvjtcv` 성공
- [x] config.toml 민감정보 스캔 (project_id="rag" 로컬 식별자, api_url=127.0.0.1 로컬 dev studio — 모두 commit 안전)
- [x] Commit: `chore(spec-01-03): init supabase CLI workspace`

---

## Task 3: Migration 파일 작성

### 3-1. `supabase migration new` + SQL 작성
- [x] `supabase migration new create_verses` → `supabase/migrations/20260517144458_create_verses.sql`
- [x] SQL 작성 (CREATE EXTENSION vector + CREATE TABLE verses + UNIQUE constraint + RLS ENABLE + COMMENT)
- [x] Commit: `feat(spec-01-03): add create_verses migration`

---

## Task 4: 마이그레이션 적용 + 검증 (커밋 없음)

### 4-1. 사용자가 직접 수행
- [ ] `supabase db push` 실행 → 마이그레이션 적용 성공 메시지 확인
- [ ] Dashboard → Database → Tables → `verses` 보이는지 수동 확인

### 4-2. 에이전트 검증
- [ ] 임시 SQL: `psql $SUPABASE_DB_URL -c "\d verses"` 또는 pg 로 verses 컬럼 6개 + RLS 활성 확인 (스크립트 확장 전 임시)
- [ ] Commit: 없음

---

## Task 5: Generated types + check:supabase 확장 (Sonnet sub-agent 위임 후보)

### 5-1. Generated types 생성
- [ ] `supabase gen types typescript --linked > src/lib/db/types.ts`
- [ ] 결과 파일에 verses 테이블 타입 포함 확인 (grep verses)

### 5-2. `scripts/check-supabase.ts` 확장
- [ ] 기존 SELECT 1 + pgvector 검사 뒤에 verses 테이블 + 컬럼 6개 검증 한 단계 추가
- [ ] 출력 형식: `[check:supabase] verses table ........ PASS / FAIL`
- [ ] `pnpm exec tsc --noEmit` PASS

### 5-3. 통합 smoke
- [ ] `pnpm check:supabase` → 4단계 PASS 출력 확인

### 5-4. Commit
- [ ] Commit: `feat(spec-01-03): add db types and extend check:supabase with verses verify`

---

## Task 6: README 갱신 (Sonnet sub-agent 위임 후보)

### 6-1. 셋업 섹션
- [ ] Supabase CLI 설치 단계 (brew) 추가
- [ ] Migration 적용 단계 (`supabase login` → `supabase link` → `supabase db push`) 추가
- [ ] 기존 단계 번호 재정렬
- [ ] Commit: `docs(spec-01-03): add supabase CLI + migration steps to README`

---

## Task 7: Ship

> 모든 작업 task 완료 후 `/hk-ship` 절차를 따릅니다.

- [ ] 코드 품질 점검: `pnpm exec tsc --noEmit` PASS
- [ ] 코드 품질 점검: `pnpm lint` PASS
- [ ] 통합 smoke 재실행: `pnpm check:supabase` 4단계 PASS
- [ ] **walkthrough.md 작성** (Opus 메인)
- [ ] **pr_description.md 작성** (Opus 메인)
- [ ] **Ship**: `bash .harness-kit/bin/sdd ship`
- [ ] sdd 자동 갱신분 (phase-01.md, queue.md) sync commit
- [ ] **Push**: `git push -u origin spec-01-03-verse-schema-migration`
- [ ] **PR 생성**: `gh pr create --base phase-01-data-pipeline --title "feat(spec-01-03): verses 스키마 + Supabase CLI 마이그레이션" --body-file ...`
- [ ] **사용자 알림**: PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 7 (Task 1-1, 4 는 노 commit) |
| **예상 commit 수** | 7 (Task 1-2, 2-2, 3, 5, 6, Ship + sync) |
| **현재 단계** | Planning (사용자 Plan Accept 대기) |
| **마지막 업데이트** | 2026-05-17 |
