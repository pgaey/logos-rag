# spec-03-02: 로그인 · 회원가입 · 헤더 인증 상태 UI

## 📋 메타

| 항목 | 값 |
|---|---|
| **Spec ID** | `spec-03-02` |
| **Phase** | `phase-03` |
| **Branch** | `spec-03-02-auth-ui-pages` |
| **상태** | Done |
| **타입** | Feature |
| **Integration Test Required** | no |
| **작성일** | 2026-05-27 |
| **소유자** | @pgaey |

## 📋 배경 및 문제 정의

### 현재 상황
spec-03-01 에서 Supabase Auth + `@supabase/ssr` 헬퍼 + proxy(middleware) 세션 검증이 완성되었다. 그러나 실제 사용자가 로그인·회원가입을 할 수 있는 UI 가 없고, 헤더에 로그인 상태가 표시되지 않아 인증 흐름을 손으로 검증할 수 없는 상태다.

### 문제점
- `/login` 페이지 없음 → 사용자 진입 불가
- 이메일 인증 콜백 라우트 없음 → 회원가입 후 이메일 인증 불가
- `layout.tsx` 헤더가 항상 "로그인" 링크만 표시 → 로그인 상태 미반영
- 로그아웃 버튼 미구현

### 해결 방안 (요약)
Next.js App Router Server Action 방식으로 로그인·회원가입 폼을 구현하고, `layout.tsx` 에서 `getClaims()` 로 유저 상태를 서버 렌더링 시 반영한다. 이메일 인증 콜백과 에러 페이지도 함께 구성한다.

## 🎯 요구사항

### Functional Requirements
1. `/login` 페이지 — 이메일/비밀번호 로그인·회원가입 탭 통합 UI
2. 로그인·회원가입 Server Action (`authAction`) — zod 검증 + Supabase 호출 + 에러 반환
3. `/auth/confirm` — 이메일 OTP 인증 콜백 라우트
4. `/auth/auth-code-error` — 인증 링크 오류 안내 페이지
5. `layout.tsx` 헤더 — 로그인 시 이메일 표시 + 로그아웃 Server Action
6. 로그인 성공 후 `revalidatePath('/', 'layout')` 캐시 초기화

### Non-Functional Requirements
1. 서버 렌더링 시 헤더 깜빡임 없음 (SSR 기반 인증 상태)
2. 클라이언트 상태 없이 `getClaims()` 로 서버에서 유저 확인

## 🚫 Out of Scope

- Google OAuth (Icebox 이월)
- `/auth/callback` OAuth 세션 교환 실제 구현 (scaffold 만 존재)
- 비밀번호 재설정 플로우

## 📑 ADR 후보

- [ ] 없음

## ✅ Definition of Done

- [x] 단위 테스트 해당 없음 (UI + 인증 플로우, 수동 검증)
- [x] 수동 시나리오 PASS (로그인 → 헤더 이메일 표시 → 로그아웃 → 헤더 초기화)
- [x] `walkthrough.md` 와 `pr_description.md` 작성 및 ship commit
- [x] `spec-03-02-auth-ui-pages` 브랜치 push 완료
- [x] 사용자 검토 요청 알림 완료
