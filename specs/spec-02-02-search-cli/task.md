# Task List: spec-02-02

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
- [x] `git checkout -b spec-02-02-search-cli` (phase-02-search-prompt 에서 분기)
- [x] Commit: 없음 (브랜치 생성만)

---

## Task 2: search-prompt CLI 스크립트

### 2-1. 구현
- [x] `scripts/search-prompt.ts` 작성
  - `process.argv` 파싱 (question 필수, k 기본값 5)
  - `searchVerses` + `buildPrompt` 호출
  - verse 표 + 완성 프롬프트 콘솔 출력
- [x] `package.json` 에 `"search:prompt"` 스크립트 추가
- [x] Commit: `feat(spec-02-02): add search-prompt cli script`

---

## Task 3: eval-prompt 평가 스크립트

### 3-1. 구현
- [x] `scripts/eval-prompt.ts` 작성
  - `eval-search.ts` 의 judgeHit, 리포트 생성 패턴 재활용
  - KO 정량 5건 실행 + 각 결과에 buildPrompt 호출
  - `docs/eval/phase-02-prompt-report.md` 저장
- [x] `package.json` 에 `"eval:prompt"` 스크립트 추가
- [x] `pnpm eval:prompt` 실행 → KO 5/5 (100%) ✅ PASS
- [x] Commit: `feat(spec-02-02): add eval-prompt script with phase-02 report`

---

## Task 4: Ship

- [ ] 타입 체크: `pnpm build` 오류 없음
- [ ] 전체 테스트: `pnpm test` PASS
- [ ] 통합 테스트: `pnpm eval:prompt` KO ≥ 60% PASS
- [ ] **walkthrough.md 작성**
- [ ] **pr_description.md 작성**
- [ ] **Ship Commit**: `docs(spec-02-02): ship walkthrough and pr description`
- [ ] **Push**: `git push -u origin spec-02-02-search-cli`
- [ ] **PR 생성**: `phase-02-search-prompt` 를 base 로 PR 생성
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 4 |
| **예상 commit 수** | 3 (CLI / eval / ship) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-19 |
