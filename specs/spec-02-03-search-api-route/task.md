# Task List: spec-02-03

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).
> 매 commit 직후 본 파일의 체크박스를 갱신해야 합니다.

## Pre-flight (Plan 작성 단계)

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] 백로그 업데이트 (backlog/phase-02.md SPEC 표 갱신)
- [x] 사용자 Plan Accept

---

## Task 1: 브랜치 생성

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-02-03-search-api-route` (phase-02-search-prompt 에서 분기)
- [x] Commit: 없음 (브랜치 생성만)

---

## Task 2: Next.js Route Handler 확인

### 2-1. 문서 확인 (선행)
- [x] `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` 확인
- [x] `export async function POST(request: Request)` + `Response.json()` API 확인
- [x] Commit: 없음 (탐색 단계)

---

## Task 3: POST /api/search 구현

### 3-1. 구현
- [x] `app/api/search/route.ts` 작성
  - `POST` handler: body 파싱 → 유효성 검사 → searchVerses + buildPrompt → JSON 응답
  - 빈 question → 400 반환 (`{"error":"question is required"}`)
  - 내부 오류 → 500 반환
- [x] `pnpm build` → TypeScript 오류 없음 (`/api/search` Dynamic 라우트 확인)
- [x] curl 스모크: 200 (verses 3건, prompt 628자) + 400 (`question is required`) ✅
- [x] Commit: `feat(spec-02-03): add POST /api/search route handler`

---

## Task 4: Ship

- [ ] 타입 체크: `pnpm build` 오류 없음
- [ ] 전체 테스트: `pnpm test` PASS
- [ ] 통합 테스트: curl 스모크 테스트 200/400 PASS
- [ ] **walkthrough.md 작성**
- [ ] **pr_description.md 작성**
- [ ] **Ship Commit**: `docs(spec-02-03): ship walkthrough and pr description`
- [ ] **Push**: `git push -u origin spec-02-03-search-api-route`
- [ ] **PR 생성**: `phase-02-search-prompt` 를 base 로 PR 생성
- [ ] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 4 |
| **예상 commit 수** | 2 (구현 / ship) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-05-19 |
