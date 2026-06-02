# Task List: spec-03-05

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성 (sdd spec new)
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (phase-03.md SPEC 표 sdd 자동 갱신)
- [x] 사용자 Plan Accept

---

## Task 1: 브랜치 생성

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-03-05-qa-page-ui` (현재 위치: `phase-03-auth-ui-llm`)
- [x] Commit: 없음 (브랜치 생성만) — 단, 보류됐던 아티팩트 등록 + spec-03-06 머지 finalize bookkeeping 은 별도 docs 커밋으로 처리

---

## Task 2: reason→메시지 매핑 TDD

### 2-1. 테스트 작성 (TDD Red)
- [x] `src/app/qa/__tests__/messages.test.ts` — 5종 reason 각각 비어있지 않은 한국어 메시지 반환 + 알 수 없는 값 fallback
- [x] `pnpm test src/app/qa` → Fail 확인 (`Cannot find module '../messages'`)
- [x] Commit: `test(spec-03-05): add reason-to-message mapping tests`

### 2-2. 구현 (TDD Green)
- [x] `src/app/qa/messages.ts` — `messageForReason(reason)` 순수 함수
- [x] `pnpm test src/app/qa` → PASS (18 passed: actions 11 + messages 7)
- [x] Commit: `feat(spec-03-05): add reason-to-message mapping`

---

## Task 3: QaForm client 컴포넌트

### 3-1. 구현
- [x] `src/app/qa/QaForm.tsx` (`'use client'`) — textarea + useTransition으로 askQuestion 직접 호출 + 5종 분기 렌더(답변/verse 카드/메시지) + 로딩·빈입력 가드
- [x] `pnpm exec tsc --noEmit` → 타입 통과 (회귀 없음)
- [x] Commit: `feat(spec-03-05): add QaForm client component`

---

## Task 4: /qa 페이지 (RSC + 인증 가드)

### 4-1. 구현
- [x] `src/app/qa/page.tsx` — requireUser → null이면 redirect('/login') + QaForm 렌더 (헤더/레이아웃은 layout.tsx 전역 제공)
- [x] `pnpm exec tsc --noEmit` → 통과
- [x] Commit: `feat(spec-03-05): add /qa page with auth guard`

---

## Task 5: Ship

> `/hk-ship` 절차.

- [x] 코드 품질: `pnpm exec tsc --noEmit` 통과 (eslint 미설치로 skip)
- [x] 전체 테스트: `pnpm test` → 34/34 PASS
- [x] (Integration Test Required = no) 통합 테스트 N/A — 수동 검증은 phase 통합 시나리오 2
- [x] **walkthrough.md 작성** — 결정 기록(useState+useTransition 채택, 메시지 분리, 인증 가드 재사용), 발견, 이월
- [x] **pr_description.md 작성** — 템플릿 준수
- [x] **Ship Commit**: `docs(spec-03-05): ship walkthrough and pr description`
- [x] **Push**: `git push -u origin spec-03-05-qa-page-ui`
- [x] **PR 생성**: PR #19 (대상: `phase-03-auth-ui-llm`) — https://github.com/pgaey/logos-rag/pull/19
- [x] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 5 (Pre-flight + 4 작업 + 1 Ship) |
| **예상 commit 수** | 5 (messages red/green 2 + QaForm 1 + page 1 + Ship 1, 브랜치 생성 commit 없음) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-31 |
