# spec-02-02: 검색·프롬프트 CLI 스크립트

## 📋 메타
| 항목 | 값 |
|---|---|
| **Spec ID** | `spec-02-02` |
| **Phase** | `phase-02` |
| **Branch** | `spec-02-02-search-cli` |
| **상태** | Planning |
| **타입** | Feature |
| **Integration Test Required** | yes |
| **작성일** | 2026-05-19 |
| **소유자** | @pgaey |

## 📋 배경 및 문제 정의

### 현재 상황
spec-02-01 에서 `buildPrompt()` 함수가 완성되어 verse 배열을 LLM 투입 형태로 조립할 수 있다.
그러나 개발 중 실제로 "질문을 넣으면 어떤 프롬프트가 나오는지" 를 콘솔에서 바로 확인할 방법이 없다.
또한 phase-02 의 성공 기준인 "top-K 포함률 ≥ 60%" 를 측정하는 자동화 스크립트가 없다.

### 문제점
- 검색 + 프롬프트 조립 흐름을 end-to-end 로 실행해 볼 수 없어 개발·검증이 느리다.
- 평가셋 실행을 수동으로 해야 하면 phase-02 Done 조건 측정이 불가능하다.

### 해결 방안 (요약)
`scripts/search-prompt.ts` — 질문과 K값을 인자로 받아 verse 검색 + 프롬프트 조립 결과를 콘솔에 출력하는 CLI 스크립트를 작성한다.
`scripts/eval-prompt.ts` — 기존 `eval-set.json` 평가셋을 일괄 실행하고 top-K 포함률 리포트(`docs/eval/phase-02-prompt-report.md`)를 생성한다.

## 📊 개념도

(Mermaid — 필요 없음, 데이터 흐름은 phase.md 에 명시됨)

## 🎯 요구사항

### Functional Requirements
1. `pnpm search:prompt "<질문>" [k]` 실행 시 top-K verse 표(book/ch/v/similarity/text 앞 60자)와 완성 프롬프트 전문을 콘솔에 출력한다
2. `pnpm eval:prompt` 실행 시 `data/eval-set.json` 의 KO 정량 질의 5건을 일괄 실행하고 top-5 포함률을 계산하여 `docs/eval/phase-02-prompt-report.md` 에 저장한다
3. 포함률 계산 기준: top-5 안에 정답 chapter 의 verse 가 있으면 HIT (EXACT는 verse까지 일치)
4. LLM 을 호출하지 않는다 (임베딩 + 검색 + 프롬프트 조립만)

### Non-Functional Requirements
1. `tsx --env-file=.env.local` 패턴으로 실행 (`GEMINI_API_KEY`, `SUPABASE_URL` 등 필요)
2. 연속 API 호출 시 700ms delay (Supabase free tier rate limit 보호)

## 🚫 Out of Scope
- LLM API 호출 (phase-03)
- EN 정량 평가 (KO 포함률만 측정, EN은 phase-01에서 이미 검증)
- 정성 평가 자동화

## 📑 ADR 후보
- [x] 없음

## ✅ Definition of Done
- [ ] `scripts/search-prompt.ts` — `pnpm search:prompt "천지창조"` 실행 시 콘솔 출력 확인
- [ ] `scripts/eval-prompt.ts` — `pnpm eval:prompt` 실행 시 리포트 생성 + KO top-5 포함률 ≥ 60%
- [ ] `pnpm test` 전체 PASS (spec-02-01 vitest 포함)
- [ ] `walkthrough.md` 와 `pr_description.md` 작성 및 ship commit
- [ ] `spec-02-02-search-cli` 브랜치 push 완료
- [ ] 사용자 검토 요청 알림 완료
