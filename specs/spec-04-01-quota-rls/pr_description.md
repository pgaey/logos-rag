feat(spec-04-01): 사용자별 일일 질문 quota 도입

## 📋 Summary

### 배경 및 목적
phase-03 까지 로그인만 하면 `askQuestion` 을 횟수 제한 없이 호출할 수 있었다. 공개 시 한 사용자의 대량 호출이 Gemini 비용/무료 tier 한도를 소진해 다른 모든 사용자를 먹통으로 만들 수 있다. 사용자별 일일 한도를 두어 검색·LLM(비싼 작업) 직전에 차단한다.

### 주요 변경 사항
- [x] `user_daily_quotas` 테이블 + RLS(정책 0개, secret-key-only) + 원자적 `consume_daily_quota` DB 함수 (lazy 일일 리셋)
- [x] `consumeDailyQuota` wrapper — admin client 로 rpc 호출, fail-closed(조회 실패 시 throw)
- [x] `askQuestion` 통합 — 인증·입력검증 후/검색 전 quota 차감, 초과 시 `quota-exceeded` 반환(비싼 작업 미호출)
- [x] `AskResult.reason` 에 `quota-exceeded` 추가 + 사용자 안내 메시지

### Phase 컨텍스트
- **Phase**: `phase-04` (공개 안전장치·배포)
- **본 SPEC 의 역할**: phase-04 의 첫 안전장치 — "공개하면 생기는 비용·악용 문제" 중 비용 폭주를 막는다.

## 🎯 Key Review Points

1. **원자성**: `consume_daily_quota` 가 `INSERT ... ON CONFLICT DO UPDATE`(행 lock) + 조건부 `UPDATE`(< limit) 를 한 함수에서 처리 → 동시요청 race 방지. (`supabase/migrations/20260603175249_*.sql`)
2. **fail-closed**: rpc 조회 실패 시 throw → `askQuestion` 이 `unknown` 으로 차단(거짓 `quota-exceeded` 아님). 비용 청구 방지 우선 (사용자 결정).
3. **`DAILY_QUOTA_LIMIT=0` 처리**: `Number(x) || 20` 의 falsy 함정 회피 — 0(전면 차단)을 유효값으로. (`src/lib/quota/check.ts`)
4. **RLS = 정책 0개**: quota 는 admin client(secret key)로만. 클라 직접 접근 차단(`verses` 컨벤션).

## 🧪 Verification

### 자동 테스트
```bash
pnpm test
pnpm exec tsc --noEmit
```
**결과 요약**:
- ✅ `consumeDailyQuota` 8건 (허용/차단/한도전달/env/limit=0/비정상값/fail-closed throw)
- ✅ `askQuestion` quota 3건 (초과→quota-exceeded, throw→unknown, 통과→진행)
- ✅ `messageForReason` quota-exceeded 매핑
- ✅ 전체 47/47 PASS, tsc clean

### 수동 검증 시나리오
1. **시나리오 1 (한도 차단)**: `DAILY_QUOTA_LIMIT=0` → 질문 1회 → "오늘 질문 한도를 모두 사용했어요" + 검색·LLM 미호출 → PASS (사용자 확인)
2. **마이그레이션 적용**: `supabase db push` → `migration list` Local/Remote 동기화 확인

## 📦 Files Changed

### 🆕 New Files
- `supabase/migrations/20260603175249_create_user_daily_quotas.sql`: quota 테이블 + RLS + DB 함수
- `src/lib/quota/check.ts`: `consumeDailyQuota` wrapper
- `src/lib/quota/__tests__/check.test.ts`: wrapper 단위 테스트 8건
- `specs/spec-04-01-quota-rls/*`: spec/plan/task/walkthrough/pr
- `backlog/phase-04.md`: phase-04 작업 지도

### 🛠 Modified Files
- `src/app/qa/actions.ts`: quota 통합 + `quota-exceeded` reason
- `src/app/qa/messages.ts`: quota-exceeded 안내 문구
- `src/app/qa/__tests__/actions.test.ts`, `messages.test.ts`: quota 케이스
- `.env.example`: `DAILY_QUOTA_LIMIT=20`
- `backlog/queue.md`: phase-04 active (sdd 자동)

**Total**: 11 files changed

## ✅ Definition of Done

- [x] 모든 단위 테스트 통과 (47/47)
- [x] 수동 시나리오 1 PASS
- [x] `walkthrough.md` / `pr_description.md` ship commit
- [x] type check 통과 (lint: eslint 미설치 skip)
- [ ] 사용자 검토 요청 (PR 생성 후)

## 🔗 관련 자료
- Phase: `backlog/phase-04.md`
- Walkthrough: `specs/spec-04-01-quota-rls/walkthrough.md`
