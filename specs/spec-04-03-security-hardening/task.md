# Task List: spec-04-03

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (phase-04.md SPEC 표 — sdd 자동 갱신 + deploy-budget→Icebox 정리)
- [x] 사용자 Plan Accept

---

## Task 1: C2 — sub 가드 (TDD)

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-04-03-security-hardening` (시작 지점: `phase-04-quota-deploy`)
- [x] Commit: 없음 (브랜치 생성만)

### 1-2. 테스트 작성 (TDD Red)
- [x] `guard.test.ts`: claims 있으나 `sub` 없음/빈 문자열 → `null` 케이스
- [x] 테스트 실행 → Fail 확인 (2 fail)
- [x] Commit: `test(spec-04-03): add failing test for sub-less claims guard` (`de8ad4e`)

### 1-3. 구현 (TDD Green)
- [x] `guard.ts`: `sub` 부재 시 null 반환 + 반환 타입 `sub: string` 보장
- [x] `actions.ts`: `user.sub as string` → `user.sub` (단언 제거)
- [x] 테스트 실행 → Pass 확인 (19 PASS, tsc clean)
- [x] Commit: `fix(spec-04-03): reject sub-less claims in requireUser (C2)` (`f1be92c`)

---

## Task 2: C1 — RLS 실증 스크립트

> 코드 수정 아님(설계 유지). anon 키 접근 차단을 실증.

### 2-1. 스크립트 작성 + 실행
- [x] `scripts/verify-rls.ts`: anon 키로 `user_daily_quotas` SELECT(0 rows)/INSERT(거부) 확인
- [x] `package.json`: `verify:rls` 스크립트 추가
- [x] `pnpm verify:rls` 실행 → PASS (SELECT 0 rows + INSERT "violates row-level security policy")
- [x] Commit: `chore(spec-04-03): add RLS verification script (C1)` (`603f61c`)

---

## Task 3: Ship (필수)

- [x] 코드 품질 점검: `pnpm exec tsc --noEmit` clean (lint: eslint 미설치 skip)
- [x] 전체 테스트 실행 → 56/56 PASS (`pnpm test`)
- [x] `verify:rls` 결과 증거 확보 (SELECT 0 rows + INSERT 거부)
- [x] **walkthrough.md 작성** (C1 실증 출력 + C2 회귀)
- [x] **pr_description.md 작성**
- [x] **Ship Commit**: `docs(spec-04-03): ship walkthrough and pr description` (`8370696`)
- [x] **Push**: `spec-04-03-security-hardening`
- [x] **PR 생성**: #24 (base `develop` — 추가 보강이라 직접) — https://github.com/pgaey/logos-rag/pull/24
- [x] **사용자 알림**: PR URL 보고, 머지 대기

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 3 (C2 + C1 + Ship) |
| **실제 commit 수** | 4 (test + C2 + C1 + ship) |
| **현재 단계** | Ship 완료 — PR #24 머지 대기 |
| **마지막 업데이트** | 2026-06-06 |
