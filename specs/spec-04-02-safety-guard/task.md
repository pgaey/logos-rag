# Task List: spec-04-02

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (phase-04.md SPEC 표 — sdd 자동 갱신)
- [x] 사용자 Plan Accept (+ critique 반영 6건, Icebox 대안 A 기록)

---

## Task 1: 프롬프트 인젝션 가드 (TDD)

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-04-02-safety-guard` (시작 지점: `phase-04-quota-deploy`)
- [x] Commit: 없음 (브랜치 생성만)

### 1-2. 테스트 작성 (TDD Red)
- [x] `template.test.ts`: sanitize(헤더 흉내 중화/제어문자 제거/정상 질문 보존) + SYSTEM_INSTRUCTION 방어 문구 + 기존 회귀
- [x] 테스트 실행 → Fail 확인 (7 fail)
- [x] Commit: `test(spec-04-02): add failing tests for prompt injection guard` (`c16fea0`)

### 1-3. 구현 (TDD Green)
- [x] `template.ts`: `sanitizeQuestion` 추가 + `SYSTEM_INSTRUCTION` 강화 + `buildPrompt` 적용
- [x] 테스트 실행 → Pass 확인 (10/10)
- [x] Commit: `feat(spec-04-02): sanitize user question and harden system instruction` (`f8e18fa`)

---

## Task 2: 면책 표기 (UI, 수동)

> UI 텍스트라 TDD 대신 수동 확인. client component 라 jsdom/RTL 미설치 → 렌더 단위 테스트 없음.

### 2-1. 면책 표기 추가
- [x] `QaForm.tsx`: 입력란 하단 면책 텍스트 상시 표시
- [x] `pnpm dev` 로 `/qa` 면책 노출 수동 확인 — 사용자 확인 완료 ("2번 보인다")
- [x] Commit: `feat(spec-04-02): add AI disclaimer to QaForm` (`1b31ae0`)

---

## Task 3: Ship (필수)

- [x] 코드 품질 점검: `pnpm exec tsc --noEmit` clean (lint: eslint 미설치 skip)
- [x] 전체 테스트 실행 → 54/54 PASS (`pnpm test`)
- [x] 면책 수동 확인 (사용자 "2번 보인다")
- [x] **walkthrough.md 작성**
- [x] **pr_description.md 작성**
- [ ] **Ship Commit**: `docs(spec-04-02): ship walkthrough and pr description`
- [ ] **Push**: `git push -u origin spec-04-02-safety-guard`
- [ ] **PR 생성**: base = `phase-04-quota-deploy`
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 3 (가드 + 면책 + Ship) |
| **예상 commit 수** | 4 (TDD 1쌍 + 면책 1 + ship 1) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-06-04 |
