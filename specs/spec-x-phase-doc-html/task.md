# Task List: spec-x-phase-doc-html

> 모든 task는 한 commit에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [-] 백로그 업데이트 (spec-x는 phase.md SPEC 표 없음 — 해당 없음)
- [x] 사용자 Plan Accept

---

## Task 1: 브랜치 생성

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-x-phase-doc-html`
- [x] Commit: 없음 (브랜치 생성만)

---

## Task 2: `hk-phase-doc` 슬래시 커맨드 스킬 작성

Phase 완료 시 호출하는 새 슬래시 커맨드. 에이전트가 Phase 산출물을 읽고 HTML+SVG 핸드오버 문서를 생성하도록 상세 지침을 담는다.

### 2-1. 스킬 파일 작성
- [ ] `.claude/commands/hk-phase-doc.md` 신규 생성
  - Phase 번호 결정 로직 (`$ARGUMENTS` 우선, fallback: sdd status)
  - 읽어야 할 파일 목록 (phase.md, spec.md ×N, walkthrough.md ×N)
  - HTML 7개 섹션 구조 정의
  - SVG 3종 생성 가이드라인 (타임라인, 컴포넌트, 데이터플로우)
  - 출력 경로 지정 (`docs/phase-{N}-handover.html`)
  - 완료 보고 형식
- [ ] Commit: `feat(spec-x-phase-doc-html): add hk-phase-doc skill`

---

## Task 3: `hk-phase-ship` 통합

Phase ship 완료 후 핸드오버 문서 생성을 안내하는 Step 6 추가.

### 3-1. hk-phase-ship 수정
- [ ] `.claude/commands/hk-phase-ship.md` Step 5 말미에 Step 6 섹션 추가
  - `hk-phase-doc` 호출 안내 문구
  - 권장(강제 아님) 표시
- [ ] Commit: `feat(spec-x-phase-doc-html): integrate hk-phase-doc into hk-phase-ship`

---

## Task 4: Ship

> 모든 작업 task 완료 후 `/hk-ship` 절차를 따릅니다.

- [ ] 수동 검증: `ls -la .claude/commands/hk-phase-doc.md`
- [ ] 수동 검증: `grep -n "hk-phase-doc" .claude/commands/hk-phase-ship.md`
- [ ] **walkthrough.md 작성** (증거 로그)
- [ ] **pr_description.md 작성** (템플릿 준수)
- [ ] **Ship Commit**: `docs(spec-x-phase-doc-html): ship walkthrough and pr description`
- [ ] **Push**: `git push -u origin spec-x-phase-doc-html`
- [ ] **PR 생성**: `/hk-pr-gh` 로 생성 (사용자 승인 후)
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 4 (브랜치 + 스킬 + 통합 + Ship) |
| **예상 commit 수** | 3 |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-19 |
