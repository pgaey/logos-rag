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
- [x] `.env.example` 작성 (사용자 직접 — Write/Bash hook 차단으로 위임)
- [x] `.gitignore` 에 `!.env.example` 예외 추가
- [x] `git status` 로 `.env.example` 이 untracked 확인
- [x] Commit: `chore(spec-01-01): add .env.example template`

---

## Task 4: Supabase 클라이언트 모듈

### 4-1. 서버·브라우저 팩토리 작성
- [x] `src/lib/supabase/server.ts` 작성
- [x] `src/lib/supabase/client.ts` 작성
- [x] `pnpm exec tsc --noEmit` PASS
- [x] Commit: `feat(spec-01-01): add supabase server/client factories`

---

## Task 5: 검증 스크립트

### 5-1. 구현 방식 변경 (plan 편차 — Constitution §5.6)
- Supabase JS 는 PostgREST 경유라 `pg_catalog` 미노출 → **`pg` 직접 연결로 전환**
- 추가 dep: `pg`, `@types/pg`
- 추가 환경변수: `SUPABASE_DB_URL` (Session pooler URI)
- plan.md 의 Dependencies / 환경변수 / 검증 스크립트 섹션 갱신 완료

### 5-2. `scripts/check-supabase.ts` 작성 + npm script 등록
- [x] `scripts/check-supabase.ts` 작성 (`pg` Client 로 SELECT 1 + pg_extension 조회)
- [x] `package.json` 의 `scripts` 에 `"check:supabase": "tsx --env-file=.env.local scripts/check-supabase.ts"` 추가
- [x] `pnpm exec tsc --noEmit` PASS
- [x] `.env.example` 에 `SUPABASE_DB_URL` placeholder 추가 (사용자 직접)
- [x] Commit: `feat(spec-01-01): add supabase connection check script with pg`

---

## Task 6: 사용자 수동 셋업 + 검증 실행 (커밋 없음)

### 6-1. 사용자가 직접 수행
- [x] Supabase 프로젝트 생성 + pgvector extension 활성화 (Dashboard → Database → Extensions)
- [x] `sb_publishable_*` / `sb_secret_*` 키 발급 (보안 사고 후 rotate 1회 수행)
- [x] Google AI Studio 에서 Gemini API key 발급
- [x] `.env.local` 채움 (4 변수 + SUPABASE_DB_URL Session pooler URI)

### 6-2. 에이전트가 검증
- [x] `pnpm check:supabase` 실행 → 3줄 PASS + exit 0
- [x] 시나리오 1 (`grep` 으로 secret key 누출 확인) — `pnpm build` → `.next/{static,server}` 에서 `sb_secret_` / `SUPABASE_SECRET_KEY` 검색 결과 0건
- [x] 시나리오 2 (env 누락 에러) — `pnpm exec tsx scripts/check-supabase.ts` (no env-file) → `Missing SUPABASE_DB_URL in .env.local` + exit 1
- [x] Commit: 없음 (검증만)

---

## Task 7: README 셋업 가이드

### 7-1. `README.md` 업데이트 (Sonnet sub-agent 위임)
- [x] 9개 섹션 (제목 / 한 줄 소개 / 기술 스택 / 셋업 / 환경변수 / 개발 워크플로 / 브랜치 보호 / 스크립트 / 라이선스)
- [x] Commit: `docs(spec-01-01): add setup guide to README`

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
