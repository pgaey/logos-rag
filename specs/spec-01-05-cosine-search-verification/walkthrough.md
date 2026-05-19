# Walkthrough: spec-01-05

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

> **스코프 주의**: 본 spec 은 cosine 검색 인프라(RPC + wrapper) + 평가셋 + 리포트. 정량 100% 달성했으나 적재 범위 1,000 verse 한정. 전체 31k 적재 후 재측정은 backlog Icebox.

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 검색 인터페이스 | Postgres RPC / 직접 SQL / 외부 검색 서비스 | **Postgres RPC `match_verses`** | Supabase JS `.rpc()` 친화, generated types 자동, phase-02/03 재사용 |
| 함수 시그니처 | `match_threshold` 포함 / 단순 (count 만) | **`match_count` 만** | spec 범위 최소. threshold 필터는 후속 spec 또는 wrapper 단계에서 |
| cosine 연산자 | `<=>` (cosine distance) / `<->` (L2) / `<#>` (inner) | **`<=>`** | pgvector 표준, normalize 무관, gemini-embedding-001 권장 |
| similarity 계산 | distance 그대로 / `1 - distance` | **`1 - distance`** | "큰 값 = 가까움" 직관 친화. 0~1 범위 (실전) |
| embedding NULL 처리 | 모두 검색 / NULL 제외 | **`WHERE embedding IS NOT NULL`** | 부분 적재 상태 대응 필수. NULL 도 검색하면 random row 반환 위험 |
| 평가 paradigm | 전체 적재 가정 / Genesis 범위 정량 + 범위 밖 정성 | **후자 (옵션 D)** | 적재 1,000 verse 한정 — 정답 verse 가 적재 안 됐으면 정량 측정 의미 없음. 범위 밖은 사람 판단 |
| 정량 매칭 정책 | EXACT only / chapter 매칭 OK | **chapter 매칭 = HIT, verse 까지 = EXACT** | 평가셋의 일부 query 가 사건 paraphrase (e.g. "노아의 방주" → 7:11~24 어디든 OK). 너무 엄격하면 false negative |
| eval-search 의 chunk 간 sleep | 0 / 700ms / RPD 보수적 | **700ms** | embed:bible 과 동일. 13 query × 0.7s = 9초. 무료 tier 한도 안 안전 |
| 평가 실패 시 동작 | 전체 중단 / 개별 query ERROR + 계속 | **개별 ERROR + 계속** | 부분 결과도 가치. 마지막에 error 수 표시 |
| URL 형식 함정 | code 에서 자동 정제 / 환경변수 수정 + README caveat | **환경변수 수정 + README caveat** | code 가 사용자 환경 잘못 보정하면 진짜 문제 가림. 사용자 환경 정상화가 정답 |
| HTML overview 위치 | spec-x 별도 PR / spec-01-05 의 docs 산출물 / 미commit | **spec-01-05 docs 산출물 (옵션 2)** | 사용자 학습 자료, phase 단위 문서 첫 사례. 후속 phase 도 같은 패턴 가능 |

## 💬 사용자 협의

- **주제**: 평가 전략 (1,000 verse 만 적재된 상태에서)
  - **사용자 의견**: D) Genesis 범위 정량 + 범위 밖 정성
  - **합의**: 적재 범위 안에서만 정량 측정, 범위 밖은 사람 판단. spec 의 핵심 평가 paradigm.

- **주제**: HTML overview 의 commit 처리
  - **사용자 의견**: 2) spec-01-05 의 docs 산출물로 commit
  - **합의**: spec-01-05 brunch 의 Task 1 pre-flight 에 포함. plan.md 의 Proposed Changes 에 명시.

- **주제**: 평가셋 검토 (Task 4)
  - **사용자 의견**: 1) OK — 그대로 commit
  - **합의**: 한국어 5건 표현 자연스러움 확인. 정답 verse 모두 적재 범위 안.

- **주제**: 평가 결과 판단
  - **사용자 의견**: 2) 정성 리포트 먼저 자세히 확인 → 검토 후 OK → 진행
  - **합의**: 정량 100% + 정성 3건 의미 합리적. spec Done.

- **주제**: similarity 점수 의미 (학습 질의)
  - **사용자 표현**: "코사인 그걸로 대충 한다는거지"
  - **합의**: 정확. 값 범위 (-1~1, 실전 0~1), 1=동일, 0.7~0.9=같은 주제, <0.5=약한 관계 정도 가이드 제공. phase-02 의 threshold 정책에 연결됨.

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: 미도입 — 외부 API + DB mock 부담 ↑, 통합 smoke 가 더 신뢰
- **결과**: N/A

#### 통합 테스트 (Integration Test Required = yes)
- **명령**: `pnpm check:supabase` + `pnpm eval:search`
- **결과**: ✅ 모두 PASS
- **로그 요약**:
```text
# pnpm check:supabase (6단계)
[check:supabase] SELECT 1 ............ PASS
[check:supabase] pgvector extension .. PASS
[check:supabase] verses table ........ PASS
[check:supabase] embeddings .......... INFO (1001/31102 filled, ...)
[check:supabase] match_verses fn ..... PASS
[check:supabase] all checks passed.

# pnpm eval:search
[eval:search] === 정량 EN (5 queries) ===  → 3 EXACT + 2 HIT
[eval:search] === 정량 KO (5 queries) ===  → 3 EXACT + 2 HIT
[eval:search] === 정성 KO (3 queries) === → Gen 29:20, Gen 28:21, Gen 21:19
[eval:search] EN: 5/5 (100%), KO: 5/5 (100%), 합산: 10/10 (100%)
```

### 2. 수동 검증

1. **Action**: `pnpm exec tsc --noEmit` + `pnpm lint`
   - **Result**: ✅ 0 errors
2. **Action**: 정성 3건 사람 판단 (out-of-range query 의 Genesis 안 결과 합리성)
   - **Result**: ✅ 모두 합리적
     - "사랑은 오래 참고" → Gen 29:20 (야곱이 라헬을 위해 7년 봉사·사랑 묘사)
     - "여호와는 나의 목자" → Gen 28:21 (야곱의 서원, 인도·돌봄 의미)
     - "선한 사마리아인" → Gen 21:19 (하갈에게 우물 보여줌, 자비·도움 의미)

## 🔍 발견 사항

- **`extensions.vector` 의 operator 도 schema-qualified 필요**: 첫 db push 실패 — `<=>` operator 가 extensions 스키마 안에 정의. 함수에 `SET search_path = extensions, public` 추가가 표준 패턴 (spec-01-03 의 `extensions.vector(768)` 타입 캐스팅과 동일 root cause).

- **NEXT_PUBLIC_SUPABASE_URL 의 `/rest/v1/` 함정**: Supabase JS 첫 실전 호출에서 모든 query "Invalid path specified" 실패. 원인 = 사용자가 Dashboard 의 PostgREST endpoint URL (`https://...supabase.co/rest/v1/`) 을 base URL 자리에 복붙. Supabase JS 는 base URL 만 받고 path 는 자동 추가. **이전 모든 spec 이 pg 직접 연결만 사용해서 처음 발견** — 검출 부채. README 의 환경변수 표에 caveat 추가로 재발 방지.

- **임베딩의 cross-lingual 능력 강함**: 한국어 paraphrase ("태초에 하나님이 천지를 창조하셨다") 가 영문 verse (Genesis 1:1) 를 top-1 으로 찾음. gemini-embedding-001 의 multilingual 학습 결과. logos-rag 의 핵심 가설 (한→영 의미 검색 가능) 1,000 verse 규모에서 정량 검증 완료.

- **out-of-distribution 도 의미 매칭됨**: 신약 query 가 Genesis 안에서 의미 가까운 verse 를 찾음 (사랑→야곱-라헬, 목자→야곱 서원, 자비→하갈-이스마엘). 임베딩이 specific text 가 아닌 **abstract concept** 도 매칭한다는 증거. phase-02 에서 threshold 정책 설계 시 참고.

- **chapter 매칭 vs verse 매칭**: 사건 paraphrase ("노아의 방주") 의 정답이 chapter 안 어디든 가능 → 평가 매칭을 chapter 단위로 관대화. EXACT/HIT 두 단계 구분으로 정밀도와 재현률 둘 다 측정.

- **similarity 0.9+ vs 0.6+ 의미 차이**: 동일 인용 (Gen 1:1 그대로) 은 ~0.95, paraphrase 는 ~0.85, out-of-distribution 은 ~0.6~0.7. phase-02 의 검색 threshold 정책 (예: "0.6 미만 = 답변 거부") 설계에 직결되는 baseline.

- **HTML overview 의 phase 단위 문서 첫 사례**: 사용자 학습 자료 요청으로 시작했지만 결과적으로 phase 단위 architecture doc 의 패턴 확립. 후속 phase 도 동일 형식으로 누적 가능. docs/eval/ 과 함께 docs/ 하위가 점진적으로 정리됨.

## 🚧 이월 항목

- **전체 31k 적재 후 평가 재측정** → `backlog/queue.md` Icebox 의 "전체 31k 임베딩 적재" 항목과 함께. 평가 paradigm 도 시나리오 1·2 의 정답 verse 확장 가능 (전 정경 query)
- **pgvector 인덱스 추가** → 1k row 에선 brute force ~10ms 충분. 30k 후 측정 시 느려지면 spec-x (`ivfflat` lists=sqrt(N))
- **match_verses 의 match_threshold 파라미터** → phase-02 의 검색 threshold 정책 설계 시 함께 추가
- **평가셋 확장** → 현재 13건. v2 단계에서 50건 이상으로 늘려 정량 신뢰도 ↑
- **Vitest 도입** → cosine.ts 가 첫 unit test 대상 후보. 이후 spec 의 비즈니스 로직 누적 시 본격 도입
- **README 의 phase-01 완료 섹션** → phase-01 종료 후 별도 spec-x 에서 status badge·아키텍처 요약 추가 가능

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent (Opus 4.7 메인 + Sonnet sub-agent for wrapper·eval-script·check·README) + @pgaey |
| **작성 기간** | 2026-05-18 |
| **최종 commit** | ship commit 시 갱신 |
