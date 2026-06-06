fix(spec-04-03): 회고 Critical 보강 (RLS 실증 + sub 가드)

## 📋 Summary

### 배경 및 목적
phase-04 의 독립 회고(`docs/review/phase-04-review.md`)가 두 안전장치가 "선언만 있고 동작 미검증"임을 발견했다. C1(RLS 미검증)·C2(sub fail-open)를 닫는다.

### 주요 변경 사항
- [x] **C2**: `requireUser()` 가 `sub` 없는 claims 를 인증 실패(null)로 취급 → `actions.ts` 의 `user.sub as string` 단언 제거 (fail-closed 일관)
- [x] **C1**: `scripts/verify-rls.ts` 로 anon 키 접근 차단을 실증 (`pnpm verify:rls`)

### Phase 컨텍스트
- **Phase**: `phase-04` (공개 안전장치) — develop 머지 후 추가 보강
- deploy-budget(배포·예산)은 spec 번호 없이 Icebox 이연

## 🎯 Key Review Points

1. **C2 fail-closed**: `sub` 는 quota 버킷 키. 없으면 통과시키면 안 됨(undefined user_id → 버킷 공유/throw). DAL 레이어(`requireUser`)에서 한 번에 차단, 반환 타입 `sub: string` 보장으로 호출부 단언 제거.
2. **C1 실증**: 코드 수정 아님 — RLS 설계(secret-key-only)는 옳고, "외부 키가 실제 막히는지"를 1회 확인. `SELECT 0 rows` + `INSERT violates RLS` 로 PASS.

## 🧪 Verification

### 자동 테스트 (C2)
```bash
pnpm test            # 56/56 PASS (guard.test sub 2건 추가)
pnpm exec tsc --noEmit   # clean (단언 제거 후에도 통과)
```

### RLS 실증 (C1)
```bash
pnpm verify:rls
# ✓ SELECT 0 rows — 외부 키로 행 미노출
# ✓ INSERT 거부됨 (RLS): new row violates row-level security policy
# ✅ RLS 보호 실증 PASS
```

## 📦 Files Changed

### 🆕 New Files
- `scripts/verify-rls.ts`: RLS 외부 차단 실증 도구

### 🛠 Modified Files
- `src/lib/auth/guard.ts`: sub 가드 + 반환 타입 sub 보장
- `src/app/qa/actions.ts`: `user.sub as string` → `user.sub`
- `src/lib/auth/__tests__/guard.test.ts`: sub 없음/빈값 케이스
- `package.json`: `verify:rls` 스크립트
- `backlog/phase-04.md`, `backlog/queue.md`: spec-04-03 정의 + deploy-budget Icebox 정리
- `docs/review/phase-04-review.md`: 회고 결과

## ✅ Definition of Done

- [x] 단위 테스트 56/56 PASS
- [x] `verify:rls` 실증 PASS (증거 walkthrough 기록)
- [x] `walkthrough.md` / `pr_description.md` ship commit
- [x] type check 통과 (lint: eslint 미설치 skip)
- [ ] 사용자 검토 요청 (PR 생성 후)

## 🔗 관련 자료
- 회고: `docs/review/phase-04-review.md` (C1·C2)
- Walkthrough: `specs/spec-04-03-security-hardening/walkthrough.md`
