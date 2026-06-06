# Walkthrough: spec-04-03

> phase-04 회고 Critical 2건(C1 RLS 미검증, C2 sub fail-open) 보강.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| C2 가드 위치 | 호출부마다 / `requireUser`(DAL) | **`requireUser` 한 곳** | 모든 action 이 위임 → 여기서 sub 보장하면 호출부 단언 불필요. |
| requireUser 반환 타입 | 그대로 / `sub: string` 보장 | **`sub: string` 보장** (`as typeof claims & { sub: string }`) | `actions.ts` 의 `as string` 제거 → 타입이 런타임 가드와 일치(tsc 통과 확인). |
| C1 처리 | 정책 추가 / 실증만 | **실증만** | RLS 설계(secret-key-only)는 옳음 — 외부 차단이 *실제 동작하는지* 확인이 빠졌을 뿐. 스크립트로 1회 실증. |

### ADR 승격 가이드
- [x] 없음 — 기존 설계의 검증·가드 보강.

## 💬 사용자 협의

- **주제**: 회고 Critical 처리 시점
  - **사용자 의견**: "develop 머지는 이미 했으니, phase 에서 추가 작업하고 develop 에 다시 PR 보내자"
  - **합의**: phase-04 재개 → spec-04-03(security-hardening) 으로 C1·C2 보강 → phase 브랜치 → develop 추가 PR. deploy-budget 은 spec 번호 없이 Icebox 유지.

## 🧪 검증 결과

### 1. 자동화 테스트 (C2)
- **명령**: `pnpm test`
- **결과**: ✅ 56/56 PASS (6 files) — `guard.test` sub 케이스 2건 추가
- **타입**: `pnpm exec tsc --noEmit` clean — `user.sub as string` 단언 제거 후에도 통과(`sub: string` 보장 작동)

### 2. RLS 실증 (C1)
- **명령**: `pnpm verify:rls` (anon/publishable 키로 `user_daily_quotas` 접근 시도)
- **결과**: ✅ PASS
```text
✓ SELECT 0 rows — 외부 키로 행 미노출 (RLS 보호 동작)
✓ INSERT 거부됨 (RLS): new row violates row-level security policy for table "user_daily_quotas"

✅ RLS 보호 실증 PASS — 외부 키 접근 차단 확인
```
→ "정책 0개 = 외부 키 모두 거부"가 실제로 동작함을 1회 실증. 회고 C1 의 "동작 증거 부재" 해소.

## 🔍 발견 사항

- **C2 는 실사용 영향 0, 그러나 원칙 일관성↑**: 정상 Supabase JWT 는 항상 sub 포함이라 정상 사용자는 영향 없음. 비정상 토큰만 fail-closed 차단 — 타입 단언으로 가렸던 인증 빈틈을 런타임 가드로 닫음.
- **C1 은 코드 0줄 변경**: RLS 는 이미 옳게 설계돼 있었고, 빠진 건 "확인" 뿐이었다. 스크립트가 영구 회귀 도구로 남음(`pnpm verify:rls`).
- 회고 Warning(W1 타임존·W2 dead field·W3 인젝션 효과)은 미처리 — 별도 판단 대상.

## 🚧 이월 항목

- W1 타임존 안내 불일치, W2 `remaining` dead field, W3 인젝션 모델 행동 검증 → 필요 시 후속
- 배포·예산(구 deploy-budget) → Icebox

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent + @pgaey |
| **작성 기간** | 2026-06-06 |
| **최종 commit** | (ship commit 시 기록) |
