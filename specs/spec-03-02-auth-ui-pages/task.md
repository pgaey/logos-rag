# Task List: spec-03-02

> 모든 task 는 한 commit 에 대응합니다 (One Task = One Commit).

## Pre-flight

- [x] Spec ID 확정 및 디렉토리 생성
- [x] spec.md 작성
- [x] plan.md 작성
- [x] task.md 작성 (이 파일)
- [x] phase.md SPEC 표 갱신
- [x] Plan Accept (소급 적용 — 구현 후 사후 등록)

---

## Task 1: 로그인·회원가입 페이지 및 Server Action 구현

- [x] `src/app/login/actions.ts` — `authAction` (zod 검증 + Supabase 인증 + 에러 반환)
- [x] `src/app/login/page.tsx` — 탭 UI, `useActionState`, `useFormStatus`, hidden mode 필드
- [x] Commit: `feat(spec-03-02): add login/signup page and authAction`

---

## Task 2: 이메일 인증 콜백 및 에러 페이지

- [x] `src/app/auth/confirm/route.ts` — OTP 검증 콜백
- [x] `src/app/auth/auth-code-error/page.tsx` — 인증 링크 오류 안내
- [x] Commit: `feat(spec-03-02): add auth confirm route and error page`

---

## Task 3: 헤더 인증 상태 + 로그아웃

- [x] `src/app/layout.tsx` — `getClaims()` 유저 이메일 + 로그아웃 Server Action + `redirect`
- [x] Commit: `feat(spec-03-02): update header with auth state and sign-out action`

---

## Task 4: Ship

- [x] 타입 체크 — `npx tsc --noEmit` PASS
- [x] 수동 검증 PASS (로그인 → 헤더 → 로그아웃)
- [x] **walkthrough.md 작성**
- [x] **pr_description.md 작성**
- [x] **Ship Commit**: `docs(spec-03-02): ship walkthrough and pr description`
- [x] **Push**: `git push -u origin spec-03-02-auth-ui-pages`
- [x] **PR 생성**

---

## 진행 요약

| 항목 | 값 |
|---|---|
| **총 Task 수** | 4 |
| **예상 commit 수** | 5 |
| **현재 단계** | Ship |
| **마지막 업데이트** | 2026-05-27 |
