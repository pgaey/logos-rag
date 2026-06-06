# Phase-04 비판적 회고

> 독립 Opus 서브에이전트 감사 (2026-06-06). `/hk-phase-review`. phase 머지(PR #23) 전 실행.

## 🔴 Critical (phase 머지 전 반드시 수정)

| # | 문제 | 위치 | 영향 |
|---|------|------|------|
| C1 | **성공기준 2(RLS 보호)는 실제로 검증된 적이 없음 — 선언만 존재.** phase.md 증거란이 "ENABLE ROW LEVEL SECURITY + 정책 0개"인데, 이는 *코드 존재*일 뿐 *동작 증거*가 아니다. spec NFR2는 "정책 존재 + **동작 검증**"을 요구했으나, anon/publishable 키로 `user_daily_quotas`를 직접 read/write 시도→차단 확인한 흔적이 없다. `consumeDailyQuota`는 항상 admin client(secret key, RLS bypass)로만 접근하므로 앱 코드 경로로는 RLS가 한 번도 행사되지 않는다. | migration L17, 검증결과 #2 | "RLS 보호" PASS 기록됐으나 증거 부재. 정책 0개=모두 거부가 Postgres 기본이라 아마 맞지만, 검증 없이 ✅ 처리는 성공기준 미달. |
| C2 | **`user.sub as string` 타입 단언이 fail-open 구멍을 만든다.** `getClaims`는 `claims.sub` 존재를 보장하지 않는다. `requireUser()`는 claims가 truthy면(빈 객체라도) 반환 → `user`는 non-null이나 `user.sub`가 undefined일 수 있다. 그 경우 rpc에 `p_user_id: undefined/null`이 들어가 null user 행에 quota 누적(모든 sub-없는 토큰이 동일 버킷 공유) 또는 throw. 단언으로 타입 검사를 꺼 이 경로가 무시됨. | actions.ts L85, guard.ts L17 | sub 없는 토큰 시 quota 격리 붕괴 또는 예외. 미검증. fail-closed 가치와 모순. |

## 🟡 Warning (다음에 해결 권장)

| # | 문제 | 위치 | 영향 |
|---|------|------|------|
| W1 | **타임존 경계 — 사용자 안내와 실제 리셋 시점 불일치.** 리셋은 `current_date`(UTC) 기준, 메시지는 "내일 다시". KST 사용자는 실제로 그날 오전 9시(UTC 자정)에 리셋되는데 "내일"로 안내 → 어긋남. | migration L24·39, messages.ts L16 | UX 혼동. 공개 시 컴플레인 소지. |
| W2 | **`remaining` 필드가 정의됐으나 미사용(dead field).** "N회 남음 UI"가 Out of Scope라 소비처 없음. DB 함수 계산·wrapper 정규화·테스트가 미사용 값을 위해 존재. | check.ts L46 | 죽은 코드. 무해하나 복잡도 미정당. |
| W3 | **인젝션 가드 "효과"는 자동·수동 모두 미검증.** 단위 테스트는 sanitize 문자열 변환만. 모델 행동 검증은 "Gemini quota 소진"으로 생략 → 성공기준 3은 "문자 지움"만 증명, "인젝션 막힘"은 0회 확인. spec-03·04 두 phase 연속 모델 검증 회피 패턴. | spec-04-02 walkthrough §2 | best-effort 방어선이 실제 작동하는지 미검증. |
| W4 | `messageForReason`의 `?? FALLBACK`은 타입상 도달 불가 분기(과잉 방어). | messages.ts L27 | 경미. |

## 📊 목표 달성도

| # | 성공 기준 | 결과 | 증거 |
|---|----------|:---:|------|
| 1 | quota 차단(자동) | ✅ | `actions.test` quota-exceeded + 검색·LLM 미호출. 실증거 있음. |
| 2 | RLS 보호 | ⚠️ 선언만 | C1: ENABLE RLS 코드만. anon 직접 접근 차단 동작 검증 없음. |
| 3 | 인젝션 가드(자동) | ⚠️ 부분 | sanitize 문자열 변환 7건(실증거). 방어 효과는 0회 검증(W3). |
| 4 | 면책+quota UI(수동) | ✅ | 면책 사용자 확인 + quota-exceeded 메시지. |
| 5 | 공개 e2e | ⏸ 이연 | 정당한 이연(계정·결제 + 로컬 1·2 검증). 단 "공개해도 안전한 상태"가 목표였으니 "공개 가능 준비 완료"로 재서술이 정직. |

## 🧪 테스트 품질

**(a) `consume_daily_quota` 원자성 — 안전하다고 판정.** `INSERT ... ON CONFLICT DO UPDATE`가 충돌 행에 row-level lock 획득 → 동일 user 동시 트랜잭션은 블록 → 후속 `UPDATE ... WHERE request_count < p_limit`는 최신값에서 실행. 이중 카운트·한도 초과 허용 없음. `remaining` off-by-one 없음(post-increment RETURNING). **단 단위 테스트로 검증 불가 — "SQL 읽고 맞다"가 검증 전부. "검증됨"이 아니라 "추론상 안전".**

**(b) sanitize**: 정규식 ReDoS 없음(고정 대안), 정상 질문 보존 테스트 있음, 제어문자 범위 정확. 견고. 공백/유니코드 변형은 의도적 비대상.

**(c) fail-closed**: rpc error/빈 배열 throw, actions throw→unknown 검증. 진짜 구멍은 C2(인증 레이어 빈틈).

## 🐛 숨은 버그 / 엣지 케이스

- **`Number('')===0`**: env에 `DAILY_QUOTA_LIMIT=`(빈값)·공백만 써도 limit=0(전면 차단)이 되는 위험한 의외성. 테스트는 `'0'`만, `''`는 미검증.
- **`user.sub as string`**: C2. 안전하지 않음. getClaims는 sub 보장 안 함.
- **타임존**: 함수 로직은 UTC 일관(기능 버그 아님), 문제는 안내 문구 불일치(W1).
- **RLS bypass**: service role은 RLS 완전 우회 → 앱 코드에서 RLS 결코 행사 안 됨. 실질 가치는 "secret key 안 흘리면 외부 노출 안 됨" 정적 보장뿐.

## 👤 사용자 피드백 반영도 — 6/6 추적 가능 (phase 강점)

| # | 피드백 | 반영 | 증거 |
|---|--------|:---:|------|
| 1 | fail-open → fail-closed | ✅ | check.ts throw + actions catch→unknown |
| 2 | `DAILY_QUOTA_LIMIT=0` falsy 버그 | ✅ | `97a2538` + 회귀 테스트 |
| 3 | critique 6건 | ✅ | spec FR/NFR + template.ts 반영, 7번 Icebox |
| 4 | 배포 이연 | ✅ | phase.md 결정기록 + queue.md Icebox |
| 5 | quota vs Gemini RPD 발견 | ✅ | walkthrough + queue.md "RPD 모니터링" |

## 🤖 에이전트 행동 품질

| # | 문제 | 빈도 | 개선 |
|---|------|:---:|------|
| 1 | RLS "동작 검증" 요구를 코드 존재만으로 ✅ | 1 | anon 키 SELECT→error 확인 30초 단계를 Done에. |
| 2 | 모델 행동 검증 "quota 소진"으로 반복 생략 | 2 | embed 없이 LLM 1회 호출 최소 스크립트로 우회 가능. |
| 3 | walkthrough가 결정 근거 담음(diff 나열 아님) | — | 양호. |

## ⚙️ 프로세스 마찰점

| # | 마찰 | 원인 | 제안 |
|---|------|------|------|
| 1 | `baseBranch: null`인데 base branch 운영 | sdd state가 base 모드 미기록 | `sdd phase done`이 baseBranch 읽어 동작 결정 시 오작동 가능. phase done 전 확인. |
| 2 | `phase-4`/`phase-04` 표기 혼재 | 수기 편집 | 표기 통일. |
| 3 | queue.md done 블록 잔재 | sdd done과 수기 충돌 | done 블록 정리. |
| 4 | ship 후 stash→checkout→pull→pop 반복 | base 모드 수동 동기화 | sdd 서브커맨드 흡수 검토. |

## 💡 프로세스 교훈 (KIT)

| Keep | Improve | Try |
|------|---------|-----|
| 결정 번복·critique 추적 반영. 수동 검증이 단위 테스트 공백 잡은 루프. | "코드 존재 = 검증됨" 등치 금지. state(baseBranch)와 실태 동기화. | RLS anon 키 SELECT→거부 1회 실증. `''`/공백 env 엣지 테스트. requireUser sub 보장 가드. |

## 🤖 에이전트 소견

진짜 강점은 사용자 피드백·critique의 추적 가능한 반영과 DB 함수 원자성 설계(`ON CONFLICT DO UPDATE` row lock으로 race 정확히 닫음), sanitize 효능을 과대평가하지 않고 "포맷 위생"으로 정직히 재명명한 절제. 진짜 약점은 두 핵심 안전장치(RLS·인젝션)가 "선언"에 그치고 "동작"이 한 번도 검증되지 않은 것(C1, W3) + `user.sub as string` 단언이 fail-closed 가치와 모순되는 인증 fail-open 구멍(C2). 머지 전 C1(RLS 30초 실증)·C2(sub 가드)는 닫기를 권장.
