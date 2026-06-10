# Backlog Queue

> 본 문서는 *대시보드* 입니다. "지금 무엇을 하고 있고, 다음에 무엇을 해야 하는가"를 한눈에 보기 위함.
>
> **자동 갱신 마커**: `active`, `specx`, `done` — 마커 (`<!-- sdd:... -->`) 사이는 sdd 가 관리하므로 그대로 두세요.
> **사람 편집 섹션**: `🧊 Icebox`, `📋 대기 Phase` — 자유 메모.

## 📦 진행 중 Phase

<!-- sdd:active:start -->
(active phase 없음. `bin/sdd phase new <slug>` 로 시작)
<!-- sdd:active:end -->

## 📥 spec-x 대기

<!-- sdd:specx:start -->
없음
<!-- sdd:specx:end -->

## 🧊 Icebox

> 아이디어·보류 항목 보관소. 실행 불가. 관련 항목이 쌓이면 Phase로, 단발이면 spec-x로 승격.
> 이 섹션은 sdd가 건드리지 않습니다. 자유롭게 편집하세요.

<!-- 예시:
- [ ] 아이디어: sdd stale detection 자동화
- [ ] 보류: spec-05-02 (dependency 해소 후 재검토)
-->

- [ ] **전체 31k verse 임베딩 적재** (현재 8,930/31,102 — Genesis~2 Samuel 10권 완료 + 1 Kings 212/816 진행 중; 2026-06-01 기준) — Gemini 무료 tier RPD 1,000 한도 도달. 매일 `pnpm embed:bible` FF 실행으로 점진 적재 중. 즉시 완료가 필요하면:
  - (a) Gemini Tier 1 billing 활성 후 `pnpm embed:bible` 재실행 (분 단위 완료, ~$0.10 미만)
  - (b) v2 phase 에서 OpenAI text-embedding-3-small 등 다른 provider 도입
  - 영향: spec-01-05 cosine 검색 평가 정확도. 현재 1,000 verse 로도 검색 logic 검증 가능하지만 평가셋 정답 verse 가 적재 안 됐을 수 있음

- [ ] **프롬프트 system 채널 구조 분리** (spec-04-02 critique 대안 A; 2026-06-04 기록) — Gemini `config.systemInstruction` 으로 system 지시를 `contents` 와 분리. 사용자 질문이 `[System]` 헤더를 흉내내도 구조적으로 무력화돼 인젝션 방어가 견고해짐(OWASP 1순위 권고). 단 `buildPrompt`/`generateAnswer` 시그니처 변경 → spec-02/03 회귀 범위 큼. 채택 시 ADR `prompt-system-channel-separation`(type: decision) 작성. 후속 spec 또는 phase-05 후보.

- [ ] **공개 배포 + 예산 알림** (phase-04 spec-4-03 이연; 2026-06-06) — Vercel 배포(env 등록 → 공개 URL) + GCP(Gemini)·Supabase 예산 알림 콘솔 설정. 코드 적고 외부 콘솔 작업 위주 → `docs/deploy/` 런북 + 수동 체크리스트 중심. 로컬 검증 충분 후 공개 시점에 spec-x 또는 phase 재개. **예산 알림 대상에 Gemini RPD 모니터링 포함**(spec-04-01 발견: 검색 임베딩이 `embed:bible` 과 같은 RPD 공유 → 앱 quota 보다 RPD 가 먼저 터질 수 있음).

## 📋 대기 Phase

> 다음에 진행할 phase 를 자유롭게 메모합니다 (사람이 직접 편집).
> 자동 갱신되지 않습니다 — Icebox 와 동일한 정책.

**v1 로드맵** (phase-01 진행 중, 이후 순서)

- **phase-02 — search-prompt** (LLM 없는 검색·프롬프트 조립)
  - 한국어 질문 임베딩 → top-K verse 검색 → 프롬프트 템플릿 조립 → 콘솔/스크립트 출력. CLI 또는 임시 API route 수준.
  - Done: 평가셋으로 "top-K 정답 포함률 ≥ X%" 측정 + 프롬프트 출력물이 LLM 투입 직전 형태.
- **phase-03 — auth-ui-llm** (UI + 인증 + Gemini Flash 통합)
  - Supabase Auth (이메일/소셜) 로그인, Next.js App Router 페이지, TanStack Query, API route 가 phase-02 검색 + Gemini Flash 호출 → 한국어 답변 + 영문 근거 verse 렌더링.
  - Done: 로컬에서 로그인 → 한국어 질문 → 답변+근거 표시 엔드투엔드 PASS.
- **phase-04 — quota-deploy** (일일 한도 + 예산 알림 + Vercel 배포)
  - 사용자별 daily quota 테이블·RLS, 프롬프트 인젝션 가드, 면책 표기, Vercel 배포, GCP/Supabase 예산 알림.
  - Done: 공개 URL 에서 외부 사용자 회원가입 → 질문 → 20회 초과 차단 동작.
- **phase-05 후보 — retrieval-quality** ("RAG 깊이를 판다" — 검색 품질 측정·개선) ※번호·착수 순서 미확정, 사용자 결정 필요
  - 척추: **측정 → 개선 → 재측정 루프.** "검색이 얼마나 좋은지 숫자로 재고, 레버 하나 당겨 그 숫자가 오르는지 확인한다."
  - 잘못된 그림 ❌ "리랭킹·하이브리드 기법을 많이 붙이는 게 깊이" → 맞는 그림 ✅ "기법은 둘째. before/after 숫자를 만들 수 있는 게 깊이. 눈금자 없는 기법 추가는 코드 늘리기"
  - 레버 (가치·의존순):
    - **0. 평가 하네스 ⭐선행필수** — 골드셋(한국어 질문→정답 verse) + Recall@k·MRR·nDCG 지표화 → 베이스라인 숫자. (`scripts/eval-search.ts` 강화, `data/` 골드셋, `docs/eval/` 리포트)
    - **1. 크로스링궐 질의변환 ⭐고유** — 한→영 번역 / HyDE(가상답변 임베딩) / multi-query → "변환 후 Recall +Δ". (`src/lib/search/` 신규 + Gemini 호출)
    - **2. 리랭킹** — 코사인 top-20 → cross-encoder/LLM 재정렬 → top-5 → "리랭킹 후 MRR +Δ". (`src/lib/search/rerank.ts` 신규, `cosine.ts` 파이프 수정)
    - **3. 하이브리드 검색** — 벡터 + 키워드(Postgres tsvector/BM25) RRF 융합 → "고유명사 질의 Recall +Δ". (`supabase/migrations/` + `src/lib/search/`)
    - **4. 답변 충실도 평가** — 생성 답변이 실제 인용 verse 에서 나왔나(환각 검출) → faithfulness 점수. (`scripts/eval-prompt.ts`, `src/lib/llm/`)
  - 본체는 코드가 아니라 `docs/eval/phase-05-*-report.md` 의 before/after 표 ("베이스라인 0.62 → 리랭킹 0.78"). 기존 `docs/eval/phase-01-search-report.md`·`phase-02-prompt-report.md` 컨벤션 연장. 면접관 페르소나가 보는 건 이 리포트.
  - calibration: 0번은 타협 불가 선행조건, 1번은 이 프로젝트만의 차별점(한→영 성경), 2·3번은 RAG 정석이라 안전하나 흔함, 4번은 검색 아닌 생성 평가. **0 + (1 또는 2) 만 제대로 해도 포트폴리오 한 챕터.** 전부 할 필요 없음.
  - 제약: ① phase-03(미완)·04(대기) 뒤이거나, 순서 당기려면 명시적 결정 필요. ② 0번 평가 하네스는 전체 코퍼스 적재(31k)가 사실상 선행 — 현재 미적재 verse 때문에 베이스라인 신뢰 불가. 현실 순서: 코퍼스 완납 → 골드셋 → 베이스라인 → 레버. (Icebox "전체 31k verse 임베딩 적재" 항목과 직결)

**v1 이후 (Icebox 후보)** — v1.5 SSO 앱 분리, v2 엔티티 카드 추출, v3 관계 그래프

## ✅ 완료

<!-- sdd:done:start -->
없음
- **phase-01** — 데이터 파이프라인 (data-pipeline) — completed 2026-05-19
- [x] spec-x-phase-doc-html (완료)
- **phase-2** — ? — completed 2026-05-20
- **phase-02** — 검색·프롬프트 조립 (search-prompt) — completed 2026-05-20
- **phase-03** — 인증 · UI · LLM 통합 (auth-ui-llm) — completed 2026-06-02
- **phase-04** — 공개 안전장치 — quota · safety (quota-deploy) — completed 2026-06-10
<!-- sdd:done:end -->

---

## 📖 사용 방법

| 명령 | 동작 |
|---|---|
| `sdd phase new <slug>` | 새 Phase 생성 → 진행 중으로 등록 |
| `sdd phase new <slug> --base` | Phase base branch 모드로 생성 (opt-in) |
| `sdd spec new <slug>` | 진행 중 Phase에 다음 spec 등록 |
| `sdd plan accept` | spec Plan Accept → 실행 모드 진입 |
| `sdd ship` | spec 완료 처리 → Merged 갱신 + state 초기화 + NEXT 안내 |
| `sdd phase done <N>` | Phase 완료 → 완료 섹션으로 이동 |

자세한 사용법: `agent/constitution.md` §3 Work Type Model, `agent/agent.md`
