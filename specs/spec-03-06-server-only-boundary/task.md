# Task List: spec-03-06

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

## Task 1: 브랜치 생성 + server-only 의존성

### 1-1. 브랜치 생성
- [x] `git checkout -b spec-03-06-server-only-boundary` (현재: `phase-03-auth-ui-llm`)
- [x] Commit: 없음 (브랜치 생성만)

### 1-2. server-only 패키지 추가
- [x] `pnpm add server-only` (pnpm store drift 로 사용자가 `pnpm install` 선행 후 성공)
- [x] `pnpm test` → 기존 27 회귀 없음 확인
- [x] Commit: `chore(spec-03-06): add server-only dependency`

---

## Task 2: 시크릿/서버전용 lib 모듈에 server-only 선언

### 2-1. 5개 파일 상단에 `import 'server-only'` 추가
- [x] `src/lib/supabase/admin.ts` (SECRET — 최우선)
- [x] `src/lib/llm/gemini.ts` (GEMINI_API_KEY)
- [x] `src/lib/search/cosine.ts`
- [x] `src/lib/auth/guard.ts`
- [x] `src/lib/supabase/server.ts`
- [x] **`client.ts` 는 건드리지 않음** (브라우저 클라이언트)
- [x] `pnpm exec tsc --noEmit` + `pnpm test` → 통과 (vitest server-only→empty alias 추가로 27/27 복구)
- [x] Commit: `refactor(spec-03-06): enforce server-only boundary on secret-handling lib modules`

---

## Task 3: 인증 주석 교정

### 3-1. actions.ts 주석 수정
- [x] `src/app/qa/actions.ts` 인증 주석을 "Server Action = 권위 게이트(Next.js 공식), proxy=UX"로 교정 (Next.js 공식 문구 인용)
- [x] `pnpm exec tsc --noEmit` → 통과 (코드 변화 없음, 주석만)
- [x] Commit: `docs(spec-03-06): correct auth comment — server action is authoritative gate`

---

## Task 4: 빌드 검증 + CLI 영향 확인

### 4-1. next build + CLI import 확인
- [x] `pnpm build` → server-only 위반 없이 통과(BUILD_EXIT 0). 정상 서버 경로 무결.
- [-] CLI 스크립트 admin.ts import 확인 — Pass: server-only 는 Next 번들러 전용 에러라 tsx(node)엔 무영향. embed:bible 등 스크립트는 영향 없음(런타임 import 시 throw 안 함, react-server 조건 아님). next build 통과로 충분.
- [x] (선택) **가드 작동 증명**: login/page.tsx(use client)에 `gemini` import + 참조 → `pnpm build` 가 "module depends on server-only" 에러로 차단(BUILD_EXIT 1) 확인 후 완전 원복. clean build 재확인(0).
- [x] Commit: 없음 (검증만, 결과는 walkthrough 기록)

---

## Task 5: Ship

> `/hk-ship` 절차.

- [x] 코드 품질: `tsc --noEmit` clean
- [x] 전체 테스트: `pnpm test` → 27 PASS
- [-] (Integration Test Required = no) N/A
- [x] **walkthrough.md 작성** — 결정(server-only 대상 선정, client.ts 제외, vitest alias, 인증 책임 모델), 빌드 검증·가드 증명, CLI 영향
- [x] **pr_description.md 작성** — 템플릿 준수
- [x] **Ship Commit**: `docs(spec-03-06): ship walkthrough and pr description`
- [x] **Push**: `git push -u origin spec-03-06-server-only-boundary`
- [x] **PR 생성**: `gh pr create` (대상: `phase-03-auth-ui-llm`)
- [x] **사용자 알림**: 푸시 완료 + PR URL 보고

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 5 (Pre-flight + 4 작업 + 1 Ship) |
| **예상 commit 수** | 4 (의존성 1 + server-only 1 + 주석 1 + Ship 1, 브랜치·검증 commit 없음) |
| **현재 단계** | Planning |
| **마지막 업데이트** | 2026-06-01 |
