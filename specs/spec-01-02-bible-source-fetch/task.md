# Task List: spec-01-02

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성 (sdd 자동)
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] phase-01.md SPEC 표 자동 갱신 (sdd 자동)
- [ ] 사용자 Plan Accept

---

## Task 1: 브랜치 생성 + pre-flight 산출물 commit

### 1-1. spec 브랜치 분기
- [ ] phase-01-data-pipeline 최신 확인 (이미 fast-forward 됨)
- [ ] `git checkout -b spec-01-02-bible-source-fetch`
- [ ] Commit: 없음

### 1-2. pre-flight 산출물 commit
- [ ] `git add specs/spec-01-02-bible-source-fetch/ backlog/phase-01.md` (phase.md 의 spec 표가 sdd 에 의해 갱신됨)
- [ ] Commit: `chore(spec-01-02): scaffold spec/plan/task artifacts`

---

## Task 2: 출처 결정 + fetch 스크립트 작성

> **분기점**: Task 2 첫 단계에서 후보 3개 fetch test 후 1개 확정. 사용자에게 결과 보고 + 승인 후 본격 구현.

### 2-1. 출처 후보 fetch test (커밋 없음)
- [ ] 후보 A: `gratis-bible/bible` (USFX/XML) — WEB 파일 raw URL 시도
- [ ] 후보 B: `wldeh/bible-api` (JSON) — WEB 파일 raw URL 시도
- [ ] 후보 C: ebible.org WEB 공식 zip / JSON — 직접 fetch 시도
- [ ] 각 후보의 (a) 응답 OK 여부 (b) 파싱 단순성 (c) 책·verse 누락 비교
- [ ] **사용자에게 비교 결과 보고 + 1개 선택 받기**

### 2-2. `scripts/fetch-bible.ts` 작성 (Sonnet sub-agent 위임 후보)
- [ ] 선택된 출처에서 fetch → parse → 평면 배열 정규화 → 검증 출력 → `data/web-bible.json` write
- [ ] (필요 시) `pnpm add -D fast-xml-parser` 등 파싱 dep 1개
- [ ] `package.json` 에 `"fetch:bible": "tsx scripts/fetch-bible.ts"` 추가
- [ ] `pnpm exec tsc --noEmit` PASS
- [ ] Commit: `feat(spec-01-02): add bible fetch + normalize script`

---

## Task 3: 데이터 산출물 생성 + commit

### 3-1. 실제 실행
- [ ] `pnpm fetch:bible` 실행 → 콘솔 PASS 확인 (책 66 / verse 31,000+ / NULL 0)
- [ ] `data/web-bible.json` 생성 확인 (~3-7MB)
- [ ] 수동 검증: 첫 verse Genesis 1:1, 마지막 Revelation 22:21
- [ ] `jq` 로 John 3:16 등 표본 verse 1-2개 추출 확인

### 3-2. Commit
- [ ] Commit: `feat(spec-01-02): add WEB bible data (data/web-bible.json)`

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
