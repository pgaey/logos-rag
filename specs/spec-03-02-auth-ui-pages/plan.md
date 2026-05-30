# Implementation Plan: spec-03-02

## 📋 Branch Strategy

- 브랜치: `spec-03-02-auth-ui-pages`
- 시작 지점: `spec-03-01-supabase-auth-setup` merge 이후 main

## 🎯 핵심 전략

### 주요 결정

| 컴포넌트 | 전략 | 이유 |
|:---:|:---|:---|
| **로그인 폼** | Server Action (`authAction`) | `revalidatePath` + `redirect` 서버 제어, 캐시 깜빡임 없음 |
| **로그인/회원가입 통합** | 단일 `authAction` + hidden `mode` 필드 | 같은 폼 공유 UI에서 action 분기가 더 단순 |
| **유저 상태 표시** | `layout.tsx` 서버 컴포넌트에서 `getClaims()` | SSR 기반, 헤더 깜빡임 없음 |
| **로그아웃** | 인라인 Server Action + `form action` | 별도 파일 불필요, layout 안에 자연스럽게 위치 |
| **입력 검증** | zod (`z.string().email()`, `z.string().min(6)`) | 서버 단일 검증, 클라이언트 regex 중복 제거 |

### 📑 ADR 후보

- [ ] 없음

## 📂 변경 파일

### [NEW] `src/app/login/page.tsx`
로그인·회원가입 탭 UI. `useActionState` + `useFormStatus` 패턴.

### [NEW] `src/app/login/actions.ts`
`authAction` Server Action. zod 검증 → Supabase 인증 → 에러 반환 또는 redirect.

### [NEW] `src/app/auth/confirm/route.ts`
이메일 OTP 인증 콜백. `verifyOtp()` 호출 후 redirect.

### [NEW] `src/app/auth/auth-code-error/page.tsx`
인증 링크 오류 안내 페이지.

### [MODIFY] `src/app/layout.tsx`
`getClaims()` 로 유저 이메일 조회 + 헤더 렌더링 + 로그아웃 Server Action.

## 🧪 검증 계획

### 수동 검증 시나리오
1. 미인증 → `/qa` 접근 → `/login` redirect 확인
2. 회원가입 → 이메일 인증 → 로그인 → 헤더 이메일 표시 확인
3. 로그아웃 → 헤더 초기화 → 보호 경로 접근 차단 확인

## 🔁 Rollback Plan

- 브랜치 삭제로 완전 롤백 가능. `layout.tsx` 만 main 과 다르므로 영향 최소.

## 📦 Deliverables 체크

- [x] task.md 작성
- [x] 구현 완료
- [x] 수동 검증 PASS
- [x] walkthrough.md / pr_description.md ship
