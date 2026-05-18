# Walkthrough: spec-01-04

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

> **스코프 변경 주의 (Constitution §5.6)**: 원래 spec.md DoD = "31,102 verse 전체 적재". 실행 중 무료 tier 한도 발견 → 사용자 결정으로 **1,000/31,102 적재 후 spec 마무리** + 나머지는 backlog Icebox.

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| API 호출 전략 | 배치 (`embedContent({contents:[...]})`) / 단건 | **배치 → 실측 후 단건 (RPD 카운트 발견)** | 처음엔 무료 tier RPM 100배 절약 기대했으나 batch 안 N contents = N requests 카운트로 효과 무 (실측 결정) |
| INSERT 전략 | 2-pass / 1-pass | **2-pass** | 1pass(text 만 INSERT) 1초 미만 → 2pass(embedding UPDATE) 가 진짜 도전. 책임 분리 + DB 가 진행 진실의 출처 |
| 재실행 안전성 | DB skip / progress 파일 / truncate | **DB `embedding IS NULL` skip + ON CONFLICT DO NOTHING** | DB 가 진실의 출처. 외부 파일 동기화 부담 없음. RPD 일일 한도와 자연스럽게 호환 |
| 임베딩 모델 | `text-embedding-004` / `gemini-embedding-001` / OpenAI | **`gemini-embedding-001` + `outputDimensionality:768`** | text-embedding-004 가 2026-01-14 deprecated/shutdown → 신 모델로 마이그레이션. Matryoshka 로 768d 유지하여 spec-01-03 의 vector(768) 스키마 보존 |
| 무료 tier 한도 대응 | BATCH 줄이기 / Tier 1 / 다른 provider / scope 축소 | **scope 축소 (1,000 적재 후 마무리)** + Icebox | 사용자 결정. 학습 페이스로는 무료가 적합, 전체 적재는 v2 또는 Tier 1 활성 후로 미룸 |
| chunk 3회 실패 시 exit code | 항상 exit 1 / quota 면 exit 0 | **quota 면 exit 0 + 메시지** | 무료 tier RPD 도달은 "비정상" 이 아닌 "정상 한도 도달". exit 0 으로 CI/cron 친화. 메시지로 "resume tomorrow" 안내 |
| BATCH_SIZE / DELAY_MS 하드코딩 | const / env override | **env override** (`EMBED_BATCH_SIZE`, `EMBED_DELAY_MS`) | Tier 1 활성 시 코드 수정 없이 `EMBED_BATCH_SIZE=100 EMBED_DELAY_MS=0` 으로 가속 가능 |
| check:supabase 의 embeddings 검증 | FAIL / fail-soft INFO | **fail-soft INFO** | 적재 전·중·완료 모든 상태에서 check 가 PASS 해야 spec-01-04 진행 가능 (닭과 달걀 회피) |
| 디버깅 commit 처리 | amend / 별도 fix commit | **각 발견마다 별도 `fix(spec-01-04)`** | Constitution §9 no-amend. 3건의 fix 가 미래 RCA 에 학습 가치 |

## 💬 사용자 협의

- **주제**: text-embedding-004 deprecated 발견 시 대안 선택
  - **사용자 의견**: A) gemini-embedding-001 + 768 차원
  - **합의**: Matryoshka representation 으로 spec-01-03 스키마 보존. SDK·코드 2줄 수정으로 처리. 추가 마이그레이션 없음.

- **주제**: 무료 tier RPM 100 도달 (1차 발견) 시 대응
  - **사용자 의견**: A) BATCH=1 + sleep 700ms 로 무료 유지. "계속 켜둘거라"
  - **합의**: 5-6시간 예상으로 수용. 노트북 sleep 방지 권고.

- **주제**: 무료 tier RPD 1,000 발견 (2차) 시 대응
  - **사용자 의견**: C) 1,000 verse 만 적재 (오늘 한도 남은 분만)
  - **합의**: 우연히 정확히 RPD 한도 = 1,000 적재 달성. spec scope 를 31,102 → 1,000 으로 축소 + 잔여는 Icebox.

- **주제**: 메모리 (logos-rag phase-01) 의 임베딩 모델 정보 outdated
  - **사용자 의견**: (별도 결정 없음, 자동 갱신)
  - **합의**: ship 후 별도 작업으로 [[project-logos-rag-phase01]] 메모리에 "gemini-embedding-001 + 768d" 로 갱신 + working dir 경로 `rag` → `logos-rag` 도 동시에 갱신.

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: 미도입 — 외부 API mock 부담 크고 통합 smoke 가 더 신뢰
- **결과**: N/A

#### 통합 테스트 (Integration Test Required = yes)
- **명령**: `pnpm embed:bible` (재실행) + `pnpm check:supabase`
- **결과**: ✅ Passed (scope 축소된 DoD 기준)
- **로그 요약**:
```text
# pnpm embed:bible (quota 도달 상태 재실행)
[embed:bible] connecting...
[embed:bible] 1pass — insert text from data/web-bible.json
[embed:bible] 1pass done — inserted 0 verses (31102 already existed)
[embed:bible] 2pass — embed and update NULL embeddings
[embed:bible] 2pass — total to process: 30102 verses
[embed:bible] chunk attempt 1~3 failed (429 RESOURCE_EXHAUSTED)
[embed:bible] chunk skipped after 3 retries: ...
[embed:bible] quota exhausted (free-tier RPD). resume tomorrow with pnpm embed:bible.
# exit 0

# pnpm check:supabase
[check:supabase] connecting...
[check:supabase] SELECT 1 ............ PASS
[check:supabase] pgvector extension .. PASS
[check:supabase] verses table ........ PASS
[check:supabase] embeddings .......... INFO (1000/31102 filled, resume with pnpm embed:bible)
[check:supabase] all checks passed.
```

### 2. 수동 검증

1. **Action**: `pnpm exec tsc --noEmit`
   - **Result**: ✅ 타입 에러 0건
2. **Action**: `pnpm lint`
   - **Result**: ✅ ESLint 0건
3. **Action**: smoke test (`scripts/_smoke-embed.ts` 임시) — `gemini-embedding-001` + `outputDimensionality:768` 호출
   - **Result**: ✅ 영문 + 한국어 2건 input → embeddings 2개, 각 768d
4. **Action**: 재실행 안전성 — `pnpm embed:bible` 두 번 연속
   - **Result**: ✅ 두 번째 실행 시 ON CONFLICT 즉시 skip, NULL 만 처리 시도 → quota 도달로 graceful exit
5. **Action**: 1pass + 2pass 분리 검증 — DB 의 `(book, chapter, verse) UNIQUE` constraint 가 ON CONFLICT 동작 확인
   - **Result**: ✅ 31,102 verse text 모두 적재, 임베딩 1,000 적재 후 한도 도달

## 🔍 발견 사항

- **`text-embedding-004` 2026-01-14 shutdown**: 공식 deprecation. Google AI 권장 대체는 `gemini-embedding-001` (default 3072d). [[project-logos-rag-phase01]] 메모리의 "Gemini text-embedding-004 (768차원)" 결정이 outdated 가 됨 — ship 후 갱신.

- **`@google/genai` 의 `outputDimensionality` 옵션**: Matryoshka representation 으로 출력 차원을 768/1536/3072 중 선택 가능. 짧은 차원도 품질 유지 (full 3072 의 부분집합). 스키마 변경 없이 모델 마이그레이션 가능한 핵심 기능.

- **batch 안 N contents = N requests 카운트**: 직관과 반대. `embedContent({contents: [...100]})` 가 batch 인터페이스라도 quota 카운트는 N. 실측으로만 확인 가능 — Google 문서엔 명시 X. (batch=100 1회 호출 즉시 limit 100 도달이 결정적 증거)

- **무료 tier `embed_content_free_tier_requests` = RPD 1,000**: 에러 detail 의 `quotaId: "EmbedContentRequestsPerDayPerUserPerProjectPerModel-FreeTier"` + `quotaValue: "1000"` 으로 정확히 확인. 분 단위가 아닌 일 단위. 전체 31k 적재 = 31일.

- **graceful exit on quota** 가 운영 가치 ↑: 한도 도달은 비정상이 아닌 정상 사이클. exit 1 이면 CI/cron 이 매번 실패 메일 보냄 → exit 0 + 명확 메시지가 표준 패턴.

- **scope deviation 의 합리적 처리**: spec DoD 를 사후에 "현실 반영" 으로 수정 + 잔여는 Icebox 등록 → 미래의 본인/리뷰어가 "왜 31k 가 안 들어있나" 추적 가능. Constitution §5.6 의 정확한 적용 사례.

- **메모리 동기화 부채 발생**: 이번 spec 의 결정 (모델·dimensions·quota 정책) 이 [[project-logos-rag-phase01]] 와 불일치 → ship 후 별도 메모리 갱신 작업 필요. 추가로 working dir 경로 변경 (`rag` → `logos-rag`) 도 같이 처리.

## 🚧 이월 항목

- **전체 31k verse 임베딩 적재** → `backlog/queue.md` Icebox 등록. promote 조건: (a) Gemini Tier 1 활성 또는 (b) v2 phase 의 provider 결정.
- **[[project-logos-rag-phase01]] 메모리 갱신** → ship 후 별도 작업: 임베딩 모델 정보 + 결정 변경 사항 + working dir 경로.
- **batch quota 카운트 정책 RCA** → `docs/rca/RCA-001-batch-rpd-counted-per-content.md` 후보 (이번이 첫 발견이라 패턴 2회 미충족 — 다음 spec 에서 재발 시 RCA 작성).
- **EMBED_RETRY 정책 개선** → 현재 chunk 3회 실패 = exit. 만약 quota 가 아닌 transient error (network blip) 면 chunk skip 후 continue 가 더 나음. v2 또는 별도 spec.

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent (Opus 4.7 메인 + Sonnet sub-agent for 초안·README) + @pgaey |
| **작성 기간** | 2026-05-17 ~ 2026-05-18 |
| **최종 commit** | ship commit 시 갱신 |
