# Task List: spec-04-01

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (phase-04.md SPEC 표 — sdd 자동 갱신)
- [x] 사용자 Plan Accept

---

## Task 1: DB 마이그레이션 (테이블 + RLS + consume 함수)

> SQL 산출물이라 TDD(테스트 먼저) 대신 "작성 → 적용 → 수동 확인". 원자성/리셋은 시나리오 1 수동 검증.

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-04-01-quota-rls` (시작 지점: `develop`)
- [x] Commit: 없음 (브랜치 생성만)

### 1-2. 마이그레이션 작성 + 적용
- [x] `supabase/migrations/20260603175249_create_user_daily_quotas.sql` 작성 (테이블 + RLS enable + `consume_daily_quota` 함수)
- [x] `supabase db push` 로 원격 DB 적용 (Supabase CLI — 기존 2개 마이그레이션과 동일 방식)
- [x] 적용 후 `supabase migration list` 로 Local/Remote 동기화 확인
- [x] Commit: `feat(spec-04-01): add user_daily_quotas table, RLS, consume function` (`2d18684`)

---

## Task 2: quota 로직 wrapper (TDD)

### 2-1. 테스트 작성 (TDD Red)
- [x] `src/lib/quota/__tests__/check.test.ts` — `createServerSupabase().rpc` mock, 케이스: allowed true/false, rpc error 시 throw(fail-closed), `DAILY_QUOTA_LIMIT` 반영
- [x] 테스트 실행 → Fail 확인 (모듈 없음)
- [x] Commit: `test(spec-04-01): add failing tests for consumeDailyQuota` (`360a4b7`)

### 2-2. 구현 (TDD Green)
- [x] `src/lib/quota/check.ts` — `consumeDailyQuota(userId)` rpc 호출 + 정규화 + fail-closed(throw)
- [x] 테스트 실행 → Pass 확인 (6/6)
- [x] Commit: `feat(spec-04-01): implement consumeDailyQuota wrapper` (`e089894`)

---

## Task 3: askQuestion 통합 + reason/메시지 동기화 (TDD)

### 3-1. 테스트 작성 (TDD Red)
- [x] `actions.test.ts`: `@/lib/quota/check` mock 추가 + quota allowed=false → `quota-exceeded`/검색 미호출 + quota throw → `unknown`/검색 미호출(fail-closed) 케이스
- [x] `messages.test.ts`: `quota-exceeded` 매핑 케이스
- [x] 테스트 실행 → Fail 확인 (4건 Red)
- [x] Commit: `test(spec-04-01): add failing tests for quota-exceeded integration` (`dce0b7f`)

### 3-2. 구현 (TDD Green)
- [x] `actions.ts`: `AskResult.reason` 에 `'quota-exceeded'` 추가 + 입력검증 후 `consumeDailyQuota` 호출 분기(fail-closed)
- [x] `messages.ts`: `quota-exceeded` 문구 추가
- [x] `.env.example`: `DAILY_QUOTA_LIMIT=20` 추가 — 권한 보호로 **사용자가 직접 추가 완료**
- [x] 테스트 실행 → Pass 확인 (전체 45/45 회귀 포함, tsc clean)
- [x] Commit: `feat(spec-04-01): enforce daily quota in askQuestion` (`0c904ec`)

### 3-3. 버그 수정 (수동 검증 중 발견)
- [x] `DAILY_QUOTA_LIMIT=0` 이 `Number(x) || 20` falsy 함정으로 20 으로 폴백되던 버그 + 회귀 테스트 2건(0/비정상값)
- [x] 테스트 8/8, 전체 47/47 PASS
- [x] Commit: `fix(spec-04-01): treat DAILY_QUOTA_LIMIT=0 as zero, not fallback` (`97a2538`)

---

## Task 4: Ship (필수)

> 모든 작업 task 완료 후 `/hk-ship` 절차를 따릅니다.

- [x] 코드 품질 점검: `pnpm exec tsc --noEmit` clean (lint: eslint 미설치 skip)
- [x] 전체 테스트 실행 → 47/47 PASS (`pnpm test`)
- [x] 수동 시나리오 1 (한도 차단) 검증 — 사용자 확인 (limit=0 → quota-exceeded)
- [x] **walkthrough.md 작성** (fail-closed 결정, limit=0 버그, 수동 검증 결과)
- [x] **pr_description.md 작성** (템플릿 준수)
- [ ] **Ship Commit**: `docs(spec-04-01): ship walkthrough and pr description`
- [ ] **Push**: `git push -u origin spec-04-01-quota-rls`
- [ ] **PR 생성**: base = `phase-04-quota-deploy` (just-in-time 생성) — `/hk-pr-gh`
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 4 (작업 3 + Ship) |
| **예상 commit 수** | 5 (마이그레이션 1 + TDD 2쌍 + ship 1) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-06-03 |
