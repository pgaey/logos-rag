# feat(spec-01-04): WEB bible 임베딩 적재 (scope 축소: 1,000/31,102)

## 📋 Summary

### 배경 및 목적
phase-01 흐름의 4번째 단계 — verses 테이블 의 31,102 verse text 를 `gemini-embedding-001` 로 임베딩하여 embedding(768d) 컬럼에 적재. spec-01-05 의 cosine 검색 기반 평가가 동작하려면 적재가 필요.

### 주요 변경 사항
- [x] `scripts/embed-bible.ts` — 2-pass 전략 (1pass: text INSERT with ON CONFLICT DO NOTHING / 2pass: NULL embedding 만 UPDATE)
- [x] `@google/genai` SDK 도입 + `gemini-embedding-001` + `outputDimensionality:768` (Matryoshka)
- [x] `scripts/check-supabase.ts` 5단계 검증 — embeddings 행 fail-soft INFO/PASS
- [x] **scope 축소 (Constitution §5.6)**: 31,102 → **1,000/31,102** (무료 tier RPD 한도). 잔여는 backlog Icebox
- [x] graceful exit on quota — `quota exhausted (free-tier RPD)` 메시지 + exit 0
- [x] env override (`EMBED_BATCH_SIZE`, `EMBED_DELAY_MS`) → Tier 1 시 코드 수정 없이 가속
- [x] README — 셋업 12번 + 스크립트 표 행 + RPD 한도·Tier 1 안내

### Phase 컨텍스트
- **Phase**: `phase-01` (data-pipeline, base branch → develop)
- **본 SPEC 의 역할**: 인프라(01) ✓ → 데이터(02) ✓ → 스키마(03) ✓ → **적재(04)** ← 본 PR (부분 완료) → 검증(05).

### ⚠️ Scope 축소 명시

원래 DoD = "31,102 verse 전체 임베딩". 실행 중 발견 → 사용자 결정으로 축소:

| 원인 | 발견 시점 | 대응 |
|---|---|---|
| `text-embedding-004` deprecated | 1차 실행 첫 chunk | `gemini-embedding-001 + outputDimensionality:768` (fix `a883155`) |
| batch 안 N contents = N requests (실측) | 2차 실행 첫 chunk | `BATCH_SIZE=1`, `DELAY_MS=700` (fix `686c273`) |
| 무료 tier RPD = 1,000 | 3차 실행 11번째 chunk | graceful exit + scope 축소 + Icebox (fix `288b222`, `615e201`) |

→ **1,000/31,102 (~3.2%) 적재 완료**. 잔여는 `backlog/queue.md` Icebox 의 "전체 31k verse 임베딩 적재" 항목으로 promote 대기.

## 🎯 Key Review Points

1. **2-pass 전략 + DB 가 진실의 출처**
   - 1pass(31k INSERT, ON CONFLICT DO NOTHING) + 2pass(NULL only UPDATE) = 재실행 안전
   - 외부 progress 파일 없음. DB 의 `embedding IS NULL` 한 줄로 이어 적재
   - RPD 일일 한도와 자연스럽게 호환 (오늘 1000, 내일 1000, ...)

2. **graceful exit on quota** (`scripts/embed-bible.ts:152`)
   - 무료 tier 한도 도달 = **정상 사이클**, exit 1 이 아닌 exit 0
   - 메시지 명시 `resume tomorrow with pnpm embed:bible`
   - CI/cron 친화 (한도 도달이 매일 실패 메일을 부르지 않음)

3. **env override 로 Tier 1 가속 가능**
   - `EMBED_BATCH_SIZE=100 EMBED_DELAY_MS=0 pnpm embed:bible` → Tier 1 활성 시 분 단위 완료
   - 코드 수정 없이 환경변수만으로 운영 정책 변경

4. **check:supabase 의 embeddings 검증 = fail-soft INFO**
   - 적재 전·중·완료 모든 상태에서 check 가 PASS (닭과 달걀 회피)
   - 적재 진행률을 한 명령으로 즉시 확인 가능

5. **3건의 fix commit history 보존** (Constitution §9 no-amend)
   - 디버깅 여정 (`a883155` model deprecation → `686c273` batch quota → `288b222` RPD discovery) 이 git log 에 남음
   - 미래 RCA·동료 학습에 활용

## 🧪 Verification

### 자동 테스트
```bash
pnpm exec tsc --noEmit   # 0 errors
pnpm lint                # 0 errors
```

### 통합 테스트
```bash
pnpm check:supabase
# [check:supabase] embeddings .......... INFO (1000/31102 filled, resume with pnpm embed:bible)
# [check:supabase] all checks passed.

pnpm embed:bible
# (quota 도달 상태) → graceful exit 0 + "resume tomorrow" 메시지
```

### 수동 검증 시나리오
1. **smoke test** — `gemini-embedding-001` + `outputDimensionality:768` 호출 → 영문/한국어 2건 input → 각 768d 정상 반환 ✓
2. **재실행 안전성** — `pnpm embed:bible` 두 번 연속 → 두 번째도 ON CONFLICT skip + quota 즉시 도달 → graceful exit 0 ✓
3. **DB 상태** — `SELECT count(*) FROM verses WHERE embedding IS NOT NULL` → 1000 ✓

## 📦 Files Changed

### 🆕 New Files
- `specs/spec-01-04-embedding-batch-script/{spec,plan,task,walkthrough,pr_description}.md`
- `scripts/embed-bible.ts` (220 lines) — 2-pass 적재 + graceful exit + env override

### 🛠 Modified Files
- `package.json` + `pnpm-lock.yaml` — `@google/genai@^2.4.0`, `embed:bible` npm script
- `scripts/check-supabase.ts` — 5번째 검증 (embeddings status) fail-soft INFO
- `README.md` — 셋업 12번 + 스크립트 표 행 + RPD/Tier 1 안내
- `backlog/queue.md` — Icebox 에 "전체 31k 적재 (Tier 1 또는 v2)" 등록
- `backlog/phase-01.md` — sdd 자동 갱신 (spec 표)

### 🗑 Deleted Files
없음

### 🔢 Commit History (10건)
```
4a510ae docs: document RPD 1000 + tier 1 acceleration in README
615e201 chore: icebox 전체 31k 임베딩 적재 (Tier 1 또는 v2)
288b222 fix: graceful exit on free-tier RPD + scope reduction
686c273 fix: respect free-tier RPM 100 (batch=1, sleep=700ms)
a883155 fix: migrate to gemini-embedding-001 (text-embedding-004 deprecated)
649ac04 docs: add embed:bible step to README
a9465cb feat: add embeddings status to check:supabase
5cf7340 feat: add bible embedding batch script
c6c995c chore: scaffold spec/plan/task artifacts
(+ ship commits)
```

## ✅ Definition of Done (수정된 DoD)

- [x] `pnpm embed:bible` 인프라 (script + check 확장) 완비
- [x] 무료 tier 한도까지 적재 완료 (1,000/31,102 = 정확히 RPD 일치)
- [x] `pnpm check:supabase` 5단계 PASS — embeddings 행 INFO 출력
- [x] 재실행 안전성 실측 확인
- [x] Gemini 비용 발생 0
- [x] `pnpm exec tsc --noEmit` / `pnpm lint` PASS
- [x] README 갱신 (단계 + 스크립트 표 + Tier 1 안내)
- [x] backlog Icebox 에 잔여 적재 등록
- [x] `walkthrough.md` 와 `pr_description.md` ship commit
- [x] 브랜치 push 완료 (`spec-01-04-embedding-batch-script` → `phase-01-data-pipeline`)
- [ ] 사용자 PR 머지

## 🔗 관련 자료

- Phase: `backlog/phase-01.md`
- Spec/Plan/Task/Walkthrough: `specs/spec-01-04-embedding-batch-script/`
- 선행 PR: `#1` (bootstrap), `#2` (fetch), `#3` (schema) — 모두 머지됨
- Icebox: `backlog/queue.md` 의 "전체 31k verse 임베딩 적재" 항목
- 관련 외부 자료:
  - [Gemini API 마이그레이션 가이드 (text-embedding-004 → gemini-embedding-001)](https://ai.google.dev/gemini-api/docs/embeddings)
  - [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
