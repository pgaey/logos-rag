# Task List: spec-02-01

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (backlog/phase-02.md SPEC 표 갱신)
- [ ] 사용자 Plan Accept

---

## Task 1: 브랜치 생성

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-02-01-prompt-template` (develop 에서 분기)
- [x] Commit: 없음 (브랜치 생성만)

---

## Task 2: Vitest 설치 및 설정

### 2-1. Vitest 설치
- [x] `pnpm add -D vitest` 실행
- [x] `vitest.config.ts` 생성 (`@/` path alias resolve 포함, `passWithNoTests: true`)
- [x] `package.json` `scripts` 에 `"test": "vitest run"` 추가
- [x] `pnpm test` 실행 → 성공 확인
- [x] Commit: `chore(spec-02-01): setup vitest with path alias`

---

## Task 3: 프롬프트 템플릿 구현 (TDD)

### 3-1. 테스트 작성 (TDD Red)
- [x] `src/lib/prompt/__tests__/template.test.ts` 작성
  - `describe('buildPrompt')` 3개 케이스: 세 섹션 포함 / verse 형식 / 빈 배열 처리
- [x] `pnpm test` → Fail 확인 (buildPrompt 미구현 상태)
- [x] Commit: `test(spec-02-01): add failing unit tests for buildPrompt`

### 3-2. 구현 (TDD Green)
- [x] `src/lib/prompt/template.ts` 작성 (`buildPrompt` 순수 함수)
- [x] `pnpm test` → 3개 테스트 모두 PASS 확인
- [x] Commit: `feat(spec-02-01): implement buildPrompt in prompt/template`

---

## Task 4: Ship

> 모든 작업 task 완료 후 `/hk-ship` 절차를 따릅니다.

- [ ] 타입 체크: `pnpm build` 오류 없음 확인
- [ ] 전체 테스트 실행: `pnpm test` → 모두 PASS
- [ ] **walkthrough.md 작성** (증거 로그)
- [ ] **pr_description.md 작성** (템플릿 준수)
- [ ] **Ship Commit**: `docs(spec-02-01): ship walkthrough and pr description`
- [ ] **Push**: `git push -u origin spec-02-01-prompt-template`
- [ ] **PR 생성**: `phase-02-search-prompt` 를 base 로 PR 생성 (`/hk-pr-gh`)
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 4 |
| **예상 commit 수** | 4 (vitest 설정 / 테스트 / 구현 / ship) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-19 |
