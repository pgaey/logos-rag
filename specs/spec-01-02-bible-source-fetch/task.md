# Task List: spec-01-02

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
- [x] phase-01-data-pipeline fast-forward 완료 (10 commits)
- [x] `git checkout -b spec-01-02-bible-source-fetch`
- [x] Commit: 없음

### 1-2. pre-flight 산출물 commit
- [x] `git add backlog/phase-01.md backlog/queue.md specs/spec-01-02-bible-source-fetch/`
- [x] Commit: `chore(spec-01-02): scaffold spec/plan/task artifacts` (0714290)

---

## Task 2: 출처 결정 + fetch 스크립트 작성

> **분기점**: Task 2 첫 단계에서 후보 3개 fetch test 후 1개 확정. 사용자에게 결과 보고 + 승인 후 본격 구현.

### 2-1. 출처 후보 fetch test (커밋 없음)
- [x] 후보 A: `gratis-bible/bible` (USFX/XML) — WEB 파일 raw URL 시도
- [x] 후보 B: `wldeh/bible-api` (JSON) — WEB 파일 raw URL 시도
- [x] 후보 C: ebible.org WEB 공식 zip / JSON — 직접 fetch 시도
- [x] 각 후보의 (a) 응답 OK 여부 (b) 파싱 단순성 (c) 책·verse 누락 비교
- [x] **사용자에게 비교 결과 보고 + 1개 선택 받기** → gratis-bible/bible 선택 (OSIS XML 5.2MB, 66권 완전, 각주 오염 없음)

### 2-2. `scripts/fetch-bible.ts` 작성 (Sonnet sub-agent 위임 후보)
- [x] 선택된 출처에서 fetch → parse → 평면 배열 정규화 → 검증 출력 → `data/web-bible.json` write
- [x] (필요 시) `pnpm add fast-xml-parser` 등 파싱 dep 1개 (fast-xml-parser 5.8.0 runtime dep)
- [x] `package.json` 에 `"fetch:bible": "tsx scripts/fetch-bible.ts"` 추가
- [x] `pnpm exec tsc --noEmit` PASS
- [x] Commit: `feat(spec-01-02): add bible fetch + normalize script`

---

## Task 3: 데이터 산출물 생성 + commit

> **Task 2-2 후속 버그 수정 1건 발생**: Sonnet 초안의 OSIS XML 파싱 두 버그 (`isArray:()=>false` + verse 외에도 `return`) 발견·수정 후 별도 commit (`a966d6c fix(spec-01-02): correct OSIS XML parsing`).

### 3-1. 실제 실행
- [x] `pnpm fetch:bible` 실행 → 콘솔 PASS (책 66 / verse 31,102 / NULL 0)
- [x] `data/web-bible.json` 생성 (6,595,522 bytes ≈ 6.6MB — 예상 3-7MB 범위 내)
- [x] 수동 검증: 첫 verse Genesis 1:1 ✓, 마지막 Revelation 22:21 ✓
- [x] `jq` 로 John 3:16 표본 추출 — WEB 표현 확인 ✓

### 3-2. Commit
- [x] Commit: `feat(spec-01-02): add WEB bible data (data/web-bible.json)`

---

## Task 4: README 라이선스 + 스크립트 섹션 갱신 (Sonnet sub-agent 위임 후보)

### 4-1. README 패치
- [ ] `## 라이선스` 섹션 "성경 텍스트" 항목 → WEB 출처 URL + public domain 명시 + 출처 결정 사유 한 줄
- [ ] `## 스크립트` 표에 `pnpm fetch:bible` 행 추가
- [ ] Commit: `docs(spec-01-02): document WEB source and fetch:bible script`

---

## Task 5: Ship

> 모든 작업 task 완료 후 `/hk-ship` 절차를 따릅니다.

- [ ] 코드 품질 점검: `pnpm exec tsc --noEmit` PASS
- [ ] 코드 품질 점검: `pnpm lint` PASS
- [ ] 통합 smoke 재실행: `pnpm fetch:bible` PASS (결정성 확인 — 재실행 후 git diff 0)
- [ ] **walkthrough.md 작성** — 출처 비교·선택 사유, 검증 결과, 발견 사항 (Opus 메인)
- [ ] **pr_description.md 작성** — 템플릿 준수 (Opus 메인)
- [ ] **Ship**: `bash .harness-kit/bin/sdd ship`
- [ ] **Push**: `git push -u origin spec-01-02-bible-source-fetch`
- [ ] **PR 생성**: `gh pr create --base phase-01-data-pipeline --body-file specs/spec-01-02-bible-source-fetch/pr_description.md --title "feat(spec-01-02): WEB bible 원문 fetch + 정규화"`
- [ ] **사용자 알림**: PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 5 (Task 1 의 1-1 만 노 commit, 나머지는 commit) |
| **예상 commit 수** | 5 (Task 1-2, 2, 3, 4, 5) |
| **현재 단계** | Planning (사용자 Plan Accept 대기) |
| **마지막 업데이트** | 2026-05-17 |
