# Implementation Plan: spec-04-03

## 📋 Branch Strategy

- 신규 브랜치: `spec-04-03-security-hardening`
- 시작 지점: `phase-04-quota-deploy` (base 모드, 현재 develop 최신과 동기화됨)
- 첫 task 가 브랜치 생성을 수행함

## 🛑 사용자 검토 필요 (User Review Required)

> [!IMPORTANT]
> - [ ] **C2 가드의 부작용**: `requireUser()` 가 `sub` 없는 claims 를 `null`(인증 실패)로 본다. 정상 Supabase JWT 는 항상 `sub` 를 포함하므로 실사용 영향 없음 — 다만 "claims 는 있는데 sub 없음" 같은 비정상 토큰은 이제 로그인 만료로 처리됨(의도된 fail-closed).
> - [ ] **C1 은 코드 수정이 아니라 "실증"**: RLS 설계(secret-key-only 유지)는 그대로. anon 키로 접근이 막히는지 *확인만* 한다. 막히지 않으면(예상 밖) 그때 정책 추가를 재논의.

> [!WARNING]
> - [ ] **`verify-rls.ts` 는 실 Supabase 에 anon 키로 read/insert 시도** — read-only SELECT 는 무해, INSERT 는 RLS 로 거부될 것(데이터 변경 없음). 실패(행 생성됨)면 보안 결함 신호.

## 🎯 핵심 전략 (Core Strategy)

### 주요 결정

| 컴포넌트 | 전략 | 이유 |
|:---:|:---|:---|
| **C2 sub 가드 위치** | `requireUser()`(DAL 레이어) 한 곳 | 모든 action 이 requireUser 에 위임하므로 여기서 sub 보장하면 호출부 단언 불필요. |
| **requireUser 반환 타입** | `sub: string` 보장으로 좁힘 | `actions.ts` 의 `as string` 제거 → 타입이 런타임 가드와 일치. |
| **C1 실증 수단** | `scripts/verify-rls.ts`(anon 키) | 단위 테스트로는 실 RLS 검증 불가. 실 DB 대상 1회 실증 + 증거. |

### 📑 ADR 후보
- [x] 없음

## 📂 Proposed Changes

### C2 — sub 가드

#### [MODIFY] `src/lib/auth/guard.ts`
- `requireUser()` 가 `claims.sub` 부재 시 `null` 반환:
  ```text
  const claims = data?.claims
  // sub(사용자 고유 id)는 quota 버킷 키. 없으면 인증으로 인정하지 않는다(fail-closed).
  if (!claims || typeof claims.sub !== 'string' || claims.sub.length === 0) return null
  return claims
  ```
- 반환 타입을 `sub: string` 보장 형태로 좁힘(또는 좁은 타입 캐스트를 가드 안에서 1회).

#### [MODIFY] `src/lib/auth/__tests__/guard.test.ts`
- 신규 케이스: `claims` 는 있으나 `sub` 없음/빈 문자열 → `null`.
- 기존 케이스(sub 있는 claims → 반환, data null → null) 회귀 유지.

#### [MODIFY] `src/app/qa/actions.ts`
- `consumeDailyQuota(user.sub as string)` → `consumeDailyQuota(user.sub)` (단언 제거). requireUser 타입이 sub 보장하면 컴파일 OK.

### C1 — RLS 실증

#### [NEW] `scripts/verify-rls.ts`
- `@supabase/supabase-js` 의 `createClient(url, PUBLISHABLE_KEY)`(anon 컨텍스트, 쿠키 없음).
- `user_daily_quotas` 에 대해:
  ```text
  SELECT * → data.length === 0 이어야 PASS (RLS 정책 0개로 행 미노출)
  INSERT {user_id, ...} → error 이어야 PASS (RLS 거부)
  ```
- 결과를 ✓/✗ 로 출력, 하나라도 FAIL 이면 exit 1.

#### [MODIFY] `package.json`
- `"verify:rls": "tsx --env-file=.env.local scripts/verify-rls.ts"` 스크립트 추가.

## 🧪 검증 계획 (Verification Plan)

### 단위 테스트 (필수)
```bash
pnpm test    # guard.test sub 케이스 + 전체 회귀
pnpm exec tsc --noEmit
```

### 통합 테스트 (Integration Test Required = no)
- 자동 통합 없음. C1 은 스크립트 실증으로 대체.

### 수동 검증 시나리오
1. `pnpm verify:rls` → `SELECT 0 rows` ✓ + `INSERT 거부` ✓ 출력 — 기대: 둘 다 PASS (RLS 외부 차단 실증). 결과를 walkthrough 에 기록.
2. (회귀) 로컬 로그인 → `/qa` 질문 정상 동작 — sub 가드가 정상 사용자를 막지 않음 확인.

## 🔁 Rollback Plan

- C2: `guard.ts` 변경 revert 시 기존 동작 복귀(단언도 되돌림). 외부 영향 없음.
- C1: 스크립트 추가뿐 — DB/앱 무변경. 삭제만으로 롤백.

## 📦 Deliverables 체크

- [ ] task.md 작성 (다음 단계)
- [ ] 사용자 Plan Accept 받음
- [ ] (실행 후) 모든 task 완료
- [ ] (실행 후) walkthrough.md / pr_description.md ship
