# Backlog Queue

> 본 문서는 *대시보드* 입니다. "지금 무엇을 하고 있고, 다음에 무엇을 해야 하는가"를 한눈에 보기 위함.
>
> **자동 갱신 마커**: `active`, `specx`, `done` — 마커 (`<!-- sdd:... -->`) 사이는 sdd 가 관리하므로 그대로 두세요.
> **사람 편집 섹션**: `🧊 Icebox`, `📋 대기 Phase` — 자유 메모.

## 📦 진행 중 Phase

<!-- sdd:active:start -->
- **phase-03** — 인증 · UI · LLM 통합 (auth-ui-llm) — 6 spec — 다음: spec-03-05-qa-page-ui
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

**v1 이후 (Icebox 후보)** — v1.5 SSO 앱 분리, v2 엔티티 카드 추출, v3 관계 그래프

## ✅ 완료

<!-- sdd:done:start -->
없음
- **phase-01** — 데이터 파이프라인 (data-pipeline) — completed 2026-05-19
- [x] spec-x-phase-doc-html (완료)
- **phase-2** — ? — completed 2026-05-20
- **phase-02** — 검색·프롬프트 조립 (search-prompt) — completed 2026-05-20
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
