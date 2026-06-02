# Walkthrough: spec-03-03

> 구현 완료 후 작성. 리뷰어가 이 문서만 읽고도 변경의 맥락과 결정을 이해할 수 있어야 한다.

## 📋 메타

| 항목 | 값 |
|---|---|
| **Spec ID** | `spec-03-03` |
| **Branch** | `spec-03-03-llm-gemini-client` |
| **상태** | Shipped |
| **작성일** | 2026-05-31 |

## 🎯 무엇을 / 왜 (What & Why)

phase-02 까지 "사용자 질문 → 프롬프트 문자열" 흐름은 완성됐지만, 그 프롬프트를 실제 LLM 에 보내 한국어 답변을 받는 단계가 비어 있었다. 이 spec 은 외부 의존성(`@google/genai` SDK 호출, 환경변수 설정, 타임아웃, 429 백오프, 에러 분류)을 `generateAnswer(prompt)` 한 함수에 격리해, 후속 spec(03-04 Server Action)이 분기 가능한 typed result 만 받아 쓰도록 한다. 라이브 호출 없이 SDK 전체를 mock 으로 대체해 모든 분기를 결정적으로 검증한다.

## 📦 변경 사항 (Changes)

| 파일 | 변경 | 설명 |
|---|---|---|
| `src/lib/llm/gemini.ts` | 신규 | `generateAnswer` + `GenerateAnswerResult`/`ErrorReason` 타입. 입력 가드 → 인증 → 재시도 루프(timeout 경합) → 에러 분류. |
| `src/lib/llm/__tests__/gemini.test.ts` | 신규 | `vi.mock('@google/genai')` 기반 단위 테스트 10 시나리오. |
| `.env.example` | 미반영(이월) | Gemini 설정 변수 4 개 추가 예정이나 에이전트 권한 차단으로 미반영 — Findings 참조. |

## 🔑 주요 결정 (Key Decisions)

- **typed result (throw 안 함)**: 운영성 실패를 모두 `{ ok: false, reason }` discriminated union 으로 반환. 호출자가 분기를 강제당하고, 로깅·테스트가 일관됨. throw 는 SDK import 실패 등 비정상 상태에만.
- **systemInstruction 미사용**: `buildPrompt`(phase-02)가 이미 `[System]` 블록을 프롬프트에 포함하므로 프롬프트 통째로 `contents` 에 전달. 프롬프트 튜닝 책임이 두 곳으로 분산되지 않게 한다.
- **재시도는 429 에만**: 지수 backoff(`500 * 2^attempt`), 최대 `GEMINI_MAX_RETRIES`(기본 2)회. auth/network/timeout/unknown 은 회복 가능성이 낮거나 quota 낭비라 재시도하지 않는다.
- **timeout = AbortController + Promise.race**: SDK 가 신호를 무시하더라도 `Promise.race` 로 결정적으로 timeout 을 감지하고, 동시에 `abortSignal`(타입 확인: `GenerateContentConfig.abortSignal`)로 실제 요청 취소를 시도한다.
- **에러 분류는 status + 메시지 패턴 병행**: SDK 가 typed error 를 보장하지 않으므로 `status`/`code` 숫자와 message 문자열 패턴을 함께 매칭(방어적).
- **시크릿/프롬프트 누설 가드**: `detail` 은 에러 `name: message` 만 200자로 잘라 담는다. API 키 값·프롬프트 본문은 절대 포함하지 않으며 단위 테스트로 검증.
- **로깅 없음**: wrapper 는 silent. 로깅은 호출자 책임(보안 누설 위험 + 테스트 노이즈 회피).

## 🧪 테스트 (Tests)

`vitest run src/lib/llm` → **10/10 PASS** (EXIT 0). `tsc --noEmit` 통과, `eslint src/lib/llm` 무경고. 429/timeout 은 vitest fake timers(`vi.runAllTimersAsync`)로 실시간 대기 없이 검증.

| # | 케이스 | 기대 |
|---|---|---|
| 1 | happy | `{ ok: true, answer }` |
| 2 | 빈 입력(공백만) | `invalid-input`, SDK 미호출 |
| 3 | 입력 한도 초과 | `invalid-input`, SDK 미호출 |
| 4 | API key 누락 | `auth`, SDK 미호출 |
| 5 | 429 1회 → 재시도 성공 | `{ ok: true }`, 2회 호출 |
| 6 | 429 한도까지 지속 | `rate-limit`, 3회 호출(1+2) |
| 7 | timeout | `timeout` |
| 8 | 401/API key invalid | `auth`, 재시도 안 함 |
| 9 | fetch failed | `network`, 재시도 안 함 |
| 10 | 임의 Error | `unknown` + detail 에 프롬프트 누설 없음 |

## ⚠ 발견 사항 / 이월 (Findings / Carry-over)

- **테스트 mock 결함(해소됨)**: 초기 mock 의 `GoogleGenAI` 를 화살표 함수로 정의해 `new` 호출 시 "not a constructor" 로 SDK-호출 테스트가 통과하지 못했다. TDD green 으로 기록된 중간 커밋들(3015854/57cb1c9/f1676f4)은 사실 이 결함으로 미통과 상태였고, 마지막 커밋(383e857)에서 mock 을 일반 함수로 고쳐 비로소 10/10 PASS 를 확인했다. 5-2 구현과 mock 수정을 같은 커밋에 묶었다.
- **`.env.example` 미반영(권한 차단)**: 에이전트가 `.env.example` 경로를 편집할 권한이 없어 변수 4 개(`GEMINI_MODEL`/`GEMINI_TIMEOUT_MS`/`GEMINI_MAX_RETRIES`/`GEMINI_MAX_INPUT_CHARS`)를 추가하지 못했다. 사용자가 직접 추가해야 한다. 단, 모두 코드 기본값을 가지므로 누락돼도 동작은 정상(문서화 목적).
- **라이브 호출 미검증(의도된 이월)**: 실제 Gemini 연결·키 유효성·실응답은 spec-03-04 통합 또는 phase 통합 시나리오 2 에서 확인. 본 spec 은 mock-only.
- **`src/lib/llm/embeddings.ts` 부재**: spec/plan 작성 시 임베딩 모듈을 그 경로로 가정했으나 실제로는 `scripts/embed-bible.ts` 에 존재. 본 spec 결과물엔 영향 없음(독립 신규 모듈).
- **streaming / tool-use / usage 측정**: 모두 Out of Scope. v1.5 이후 검토.

## 🔗 관련 (References)

- 선행: spec-03-01(supabase-auth-setup), spec-03-02(auth-ui-pages)
- 후속: spec-03-04(qa-server-action) — `generateAnswer` 의 첫 사용처
- 입력 출처: `src/lib/prompt/template.ts` `buildPrompt`(phase-02)
- ADR: 없음(결정 규모 작아 본 walkthrough 로 충분)
