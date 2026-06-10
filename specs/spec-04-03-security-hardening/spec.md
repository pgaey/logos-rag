# spec-04-03: 회고 Critical 보강 (security-hardening)

## 📋 메타

| 항목 | 값 |
|---|---|
| **Spec ID** | `spec-04-03` |
| **Phase** | `phase-04` |
| **Branch** | `spec-04-03-security-hardening` |
| **상태** | Planning |
| **타입** | Fix |
| **Integration Test Required** | no (RLS 실증은 스크립트 + 수동) |
| **작성일** | 2026-06-04 |
| **소유자** | @pgaey |

## 📋 배경 및 문제 정의

### 현재 상황
phase-04 의 quota+safety 가 develop 에 머지(PR #23)된 뒤, 독립 회고(`docs/review/phase-04-review.md`)가 Critical 2건을 발견했다. 두 안전장치가 **"선언"만 있고 "동작"이 검증되지 않았다.**

### 문제점
- **C1 (RLS 미검증)**: `user_daily_quotas` 에 `ENABLE ROW LEVEL SECURITY` + 정책 0개를 걸었으나, 외부(anon/publishable) 키로 실제 접근 시 차단되는지 **한 번도 확인하지 않았다.** 성공기준 2 가 "동작 검증"을 요구했는데 코드 존재만으로 PASS 처리됨. 앱은 admin(secret key, RLS bypass)로만 접근하므로 RLS 는 앱 경로에서 전혀 행사되지 않는다 — 유일한 보호 대상(외부 키 직접 접근)이 미검증.
- **C2 (sub fail-open)**: `askQuestion` 이 `user.sub as string` 로 타입 단언한다. `getClaims` 는 `claims.sub` 존재를 보장하지 않으므로, `sub` 없는 claims 가 오면 `requireUser()` 는 non-null 을 반환하고 quota rpc 에 `undefined` user_id 가 전달된다 → 모든 sub-없는 토큰이 **동일 quota 버킷 공유** 또는 throw. 타입 단언이 이 경로를 가렸고, fail-closed 원칙과 모순.

### 해결 방안 (요약)
ⓐ `requireUser()` 가 `sub` 없는 claims 를 인증 실패(null)로 취급해 단언 없이 `sub` 를 보장하고(C2), ⓑ anon 키로 `user_daily_quotas` 접근이 실제 차단됨을 스크립트로 1회 실증해 증거화한다(C1).

## 🎯 요구사항

### Functional Requirements
1. **C2-a**: `requireUser()` 가 `claims.sub` 가 없으면 `null` 반환 (sub 있는 claims 만 인증 인정). 단위 테스트로 검증.
2. **C2-b**: `src/app/qa/actions.ts` 의 `user.sub as string` 타입 단언 제거 — `requireUser` 반환 타입에서 `sub: string` 이 보장되도록. 기존 quota 호출(`consumeDailyQuota(user.sub)`)은 단언 없이 컴파일.
3. **C1**: `scripts/verify-rls.ts` 가 anon(publishable) 키 클라이언트로 `user_daily_quotas` 를
   - SELECT → 행 미노출(0 rows; RLS 정책 0개로 행 접근 불가)
   - INSERT → 거부(error)
   를 확인하고 PASS/FAIL 을 출력한다. 실행 결과를 walkthrough 에 증거로 기록.

### Non-Functional Requirements
1. **회귀 없음**: 정상 로그인(`sub` 있는 claims) 흐름·기존 quota·인젝션 동작은 그대로. 기존 `guard.test`·`actions.test` 통과.
2. **fail-closed 일관**: sub 부재 = 인증 실패(차단)로, 기존 fail-closed 방향과 일치.

## 🚫 Out of Scope
- W1 (타임존 안내 불일치), W2 (`remaining` dead field), W3 (인젝션 모델 행동 검증), W4 (messages 죽은 분기) — 본 spec 은 Critical 2건만. Warning 은 별도 판단.
- 배포·예산 알림(구 deploy-budget) — Icebox 이연.
- RLS 를 본인-행 정책으로 바꾸는 것 — 현재 secret-key-only 설계 유지, "외부 차단"만 실증.

## 📑 ADR 후보 (Architecture Decision Records)
- [ ] ADR 가치 있는 결정 있음
- [x] 없음 — 기존 설계의 검증·가드 보강이지 새 결정 아님.

## 🔍 Critique 결과 (선택)
<!-- 본 spec 은 회고(critique 성격)에서 파생됨 — docs/review/phase-04-review.md C1·C2 -->

## ✅ Definition of Done

- [ ] 모든 단위 테스트 PASS (`guard.test` sub 케이스 + 회귀)
- [ ] `verify-rls.ts` 실행 → SELECT 0 rows / INSERT 거부 확인 (증거 walkthrough 기록)
- [ ] `walkthrough.md` 와 `pr_description.md` 작성 및 ship commit
- [ ] `spec-04-03-security-hardening` 브랜치 push 완료
- [ ] 사용자 검토 요청 알림 완료
