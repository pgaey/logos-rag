# Walkthrough: spec-04-01

> 사용자별 일일 질문 한도(quota) 도입 — 공개 시 비용 폭주/한도 소진 방지.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| RLS 정책 형태 | secret-key-only(정책 0개) / 본인-행 정책 | **secret-key-only + admin client** | quota 는 서버만 변경해야 하고(클라가 자기 카운트 조작 금지), "N회 남음" 클라 직접조회는 범위 외. `verses` 컨벤션 연장. |
| 원자성 | JS 로직(select→compare→update) / DB 함수 | **DB 함수 `consume_daily_quota`** | check+increment 를 한 트랜잭션에 묶어 동시요청 race 차단. `match_verses` RPC 패턴 연장. |
| rpc 조회 실패 시 | fail-open(통과) / fail-closed(차단) | **fail-closed (throw → `unknown`)** | 비용 청구 방지가 최우선(사용자 결정 2026-06-03). DB 장애를 거짓 `quota-exceeded`("내일 다시")로 오인 안내하지 않고 `unknown`("일시 오류")으로 정직하게 차단. |
| `DAILY_QUOTA_LIMIT=0` 처리 | (초기 버그) `Number(x) \|\| 20` | **`Number.isInteger(x) && x>=0` 검사** | 0(전면 차단)은 유효값인데 falsy 라 20 으로 새던 버그. 수동 검증 중 발견 → 회귀 테스트 추가. |

### ADR 승격 가이드
- [ ] ADR 승격 대상 있음
- [x] 없음 — `quota-server-only-rls`(convention) 후보는 phase-04 결정 기록에 누적으로 충분. cross-spec 의존이 약해 ADR 미승격(비강제).

## 💬 사용자 협의

- **주제**: phase-04 범위
  - **사용자 의견**: 배포·예산알림은 외부 콘솔 비중이 큼
  - **합의**: 앱 내부 로직(quota/가드/면책)만 정식 spec, 배포·알림은 경량 문서 spec(spec-04-03)
- **주제**: rpc 실패 정책 (fail-open vs fail-closed)
  - **사용자 의견**: "비용 청구를 원하지 않으니 fail-closed 로, 나중에 바꾸더라도"
  - **합의**: fail-closed 채택. plan 의 초기 fail-open 결정을 뒤집고 반영.
- **주제**: 마이그레이션 적용 방식
  - **합의**: 프로젝트가 Supabase CLI(`config.toml`) 사용 → `supabase db push` 로 적용 (IaC 정신에 부합).
- **주제**: 수동 시나리오 1 (한도 차단) 검증
  - **합의**: 사용자가 `DAILY_QUOTA_LIMIT=0` 으로 dev 재시작 후 질문 1회 → quota-exceeded 차단 확인(검색·LLM 미호출). PASS.

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: `pnpm test`
- **결과**: ✅ Passed (47 tests, 6 files)
- **로그 요약**:
```text
 Test Files  6 passed (6)
      Tests  47 passed (47)
```
- 신규: `src/lib/quota/__tests__/check.test.ts` 8건(허용/차단/한도전달/env반영/limit=0/비정상값/fail-closed throw 2종), `actions.test.ts` quota 3건, `messages.test.ts` quota-exceeded 1건.

#### 타입 체크
- **명령**: `pnpm exec tsc --noEmit`
- **결과**: ✅ clean

### 2. 수동 검증

1. **Action**: `supabase db push --dry-run` → 실제 push
   - **Result**: `20260603175249_create_user_daily_quotas.sql` 적용. `supabase migration list` 로 Local/Remote 동기화 확인.
2. **Action**: (사용자) `DAILY_QUOTA_LIMIT=0`, dev 재시작 후 로그인 → 질문 1회
   - **Result**: "오늘 질문 한도를 모두 사용했어요. 내일 다시 시도해 주세요." 표시. 검색·LLM 미호출 = 시나리오 1 PASS.

## 🔍 발견 사항

- **rate-limit vs quota-exceeded 혼동**: 수동 검증 중 `limit=2` 에서 `rate-limit` 이 떴는데, 이는 quota 차단이 아니라 **검색 단계 Gemini 임베딩 429** 였다. 검색용 임베딩 호출과 `pnpm embed:bible` 이 **같은 Gemini 무료 RPD 를 공유**하기 때문. → 운영에선 앱 quota(20) 보다 Gemini RPD 가 먼저 터질 수 있음. spec-04-03(예산 알림) 또는 Icebox 거리.
- **`DAILY_QUOTA_LIMIT=0` falsy 버그**: 수동 검증이 단위 테스트 공백(`'0'` 미검증)을 잡아냈다. `fix` 커밋 + 회귀 테스트로 마감.

## 🚧 이월 항목

- "오늘 N회 남음" 잔여 횟수 UI 표시 (Out of Scope) → 필요 시 후속 spec
- 앱 quota vs Gemini RPD 선후 관계 / 예산 알림 → spec-04-03

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent + @pgaey |
| **작성 기간** | 2026-06-03 |
| **최종 commit** | (ship commit 시 기록) |
