# Task List: spec-01-01

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (phase-01.md SPEC 표 자동 갱신됨)
- [ ] 사용자 Plan Accept

---

## Task 1: 브랜치 생성 + pre-flight 아티팩트 commit

### 1-1. spec 브랜치 분기
- [x] develop 최신 (이미 origin/develop 와 동기)
- [x] `git checkout -b spec-01-01-bootstrap-supabase`
- [x] Commit: 없음 (브랜치 생성만)

### 1-2. pre-flight 산출물 commit (plan 보완)
- [x] `git add backlog/ specs/`
- [x] Commit: `chore(spec-01-01): scaffold phase-01 + spec-01-01 planning artifacts`

---

## Task 2: 의존성 설치

### 2-1. Supabase JS + tsx 설치
- [x] `pnpm add @supabase/supabase-js` → `@supabase/supabase-js@^2.105.4`
- [x] `pnpm add -D tsx` → `tsx@^4.22.0`
- [x] `pnpm-lock.yaml` 변경 확인
- [x] Commit: `chore(spec-01-01): add @supabase/supabase-js and tsx`

---

## Task 3: 환경변수 템플릿

### 3-1. `.env.example` 생성
- [ ] `.env.example` 작성 (plan.md "Proposed Changes / 환경변수 템플릿" 내용 그대로)
- [ ] `.gitignore` 의 `.env*` 룰이 `.env.local` 은 제외하지만 `.env.example` 은 포함하도록 동작하는지 확인 — Next 기본 패턴은 `.env*` 이므로 `.env.example` 도 무시됨 → 룰을 `.env*.local` + `.env` 로 좁히거나, `!.env.example` 예외 추가 필요. **`!.env.example`** 예외 한 줄 추가.
- [ ] `git status` 로 `.env.example` 이 추적됨을 확인
- [ ] Commit: `chore(spec-01-01): add .env.example template`

---

## Task 4: Supabase 클라이언트 모듈

### 4-1. 서버·브라우저 팩토리 작성
- [ ] `src/lib/supabase/server.ts` 작성 (plan.md 스니펫 기준)
- [ ] `src/lib/supabase/client.ts` 작성 (plan.md 스니펫 기준)
- [ ] `pnpm exec tsc --noEmit` 로 type check PASS 확인
- [ ] Commit: `feat(spec-01-01): add supabase server/client factories`

---

## Task 5: 검증 스크립트

### 5-1. `scripts/check-supabase.ts` 작성 + npm script 등록
- [ ] `scripts/check-supabase.ts` 작성
  - 단계 1: `createServerSupabase()` → `rpc` 또는 `from('pg_extension').select('extname').limit(0)` 로 `SELECT 1` 대용 (Supabase JS 는 raw SQL 미지원 → `pg_extension` 조회로 연결 + 권한 동시 검증)
  - 단계 2: `pg_extension.extname='vector'` 행 존재 확인
  - 콘솔 출력 형식은 plan.md 참조
  - 실패 시 `process.exit(1)`
- [ ] `package.json` 의 `scripts` 에 `"check:supabase": "tsx --env-file=.env.local scripts/check-supabase.ts"` 추가
- [ ] `pnpm exec tsc --noEmit` PASS
- [ ] Commit: `feat(spec-01-01): add supabase connection check script`

---

## Task 6: 사용자 수동 셋업 + 검증 실행 (커밋 없음)

### 6-1. 사용자가 직접 수행
- [ ] Supabase 프로젝트 생성 + pgvector extension 활성화 (Dashboard → Database → Extensions)
- [ ] `sb_publishable_*` / `sb_secret_*` 키 발급
- [ ] Google AI Studio 에서 Gemini API key 발급
- [ ] `cp .env.example .env.local` → 4개 변수 실제 값으로 채움

### 6-2. 에이전트가 검증
- [ ] `pnpm check:supabase` 실행 → 3줄 PASS + exit 0 확인
- [ ] 수동 검증 시나리오 1 (`grep` 으로 secret key 누출 확인) — `pnpm build` 후 `.next/` 검색
- [ ] 수동 검증 시나리오 2 (env 미설정 시 에러 메시지) — 임시로 secret 빼고 재실행, 복원
- [ ] Commit: 없음 (검증만)

---

## Task 7: README 셋업 가이드

### 7-1. `README.md` 업데이트
- [ ] 프로젝트 한 줄 소개 (`logos-rag — 한국어 질문으로 영문 KJV 의미 검색·답변 RAG 포트폴리오`)
- [ ] "셋업" 섹션: 1) Supabase 프로젝트 + pgvector, 2) AI Studio Gemini key, 3) `.env.local` 채우기, 4) `pnpm install && pnpm check:supabase`
- [ ] 환경변수 표 (이름 / 용도 / 노출 컨텍스트)
- [ ] 브랜치 보호 룰 안내 (GitHub 웹에서 main·develop 보호 필수)
- [ ] Commit: `docs(spec-01-01): add setup guide to README`

---

## Task 8: Ship

> 모든 작업 task 완료 후 `/hk-ship` 절차를 따릅니다.

- [ ] 코드 품질 점검: `pnpm exec tsc --noEmit` PASS
- [ ] 코드 품질 점검: `pnpm lint` PASS
- [ ] 통합 smoke 재실행: `pnpm check:supabase` PASS
- [ ] **walkthrough.md 작성** (변경 요약 + 결정 기록 + 검증 증거)
- [ ] **pr_description.md 작성** (템플릿 준수)
- [ ] **Ship Commit**: `docs(spec-01-01): ship walkthrough and pr description`
- [ ] **Base branch 자동 생성 확인**: sdd ship 이 `phase-01-data-pipeline` 을 develop 에서 분기·push
- [ ] **Push**: `git push -u origin spec-01-01-bootstrap-supabase`
- [ ] **PR 생성**: `gh pr create --base phase-01-data-pipeline` (또는 `/hk-pr-gh`). PR target 이 `phase-01-data-pipeline` 인지 명시
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 8 (Task 1·6 은 commit 없음, 실제 commit task = 6) |
| **예상 commit 수** | 6 (Task 2, 3, 4, 5, 7, 8) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-16 |
