# feat(spec-03-03): gemini flash 답변 생성 래퍼 generateAnswer 추가

> 형식: `<type>(spec-{phaseN}-{seq}): <한 줄 설명>` — 모두 소문자

## 📌 요약 (Summary)

프롬프트 문자열을 Gemini Flash 에 보내 한국어 답변을 받는 `generateAnswer(prompt)` 를 추가한다. 외부 SDK 의존성·설정·타임아웃·429 백오프·에러 분류를 한 함수에 격리하고, 호출자가 분기를 강제당하는 typed result(`GenerateAnswerResult`)로 반환한다. 라이브 호출 없이 SDK 전체를 mock 으로 검증한다.

## 🔄 변경 사항 (What Changed)

- `src/lib/llm/gemini.ts` 신규: `generateAnswer` + `GenerateAnswerResult`/`ErrorReason` discriminated union. 입력 길이 가드 → 인증 검사 → (timeout 경합 포함) SDK 호출 → 429 지수 backoff 재시도 → 에러 분류.
- `src/lib/llm/__tests__/gemini.test.ts` 신규: `@google/genai` 전체 mock, 10 시나리오(happy/입력가드/인증/429 재시도/timeout/에러 분류).
- `.env.example`: 변수 4 개(`GEMINI_MODEL`/`GEMINI_TIMEOUT_MS`/`GEMINI_MAX_RETRIES`/`GEMINI_MAX_INPUT_CHARS`) 추가 예정 — **권한 차단으로 미반영, 머지 전 수동 추가 필요**(모두 코드 기본값 존재).

## 🧪 테스트 (Testing)

- `vitest run src/lib/llm` → 10/10 PASS (EXIT 0)
- `tsc --noEmit` 통과, `eslint src/lib/llm` 무경고
- 라이브 호출 없음 — SDK 전체 mock. 429/timeout 은 vitest fake timers 로 검증
- 라이브 연결 검증은 spec-03-04 / phase 통합으로 이월(의도)

## 📋 리뷰 포인트 (Review Focus)

- **에러 분류 매핑**(`classifyError`): status/메시지 패턴이 적절한지, 429 만 재시도하는 정책이 타당한지
- **timeout 구현**: `AbortController` + `Promise.race` 조합과 `finally` 정리(`clearTimeout`)
- **누설 가드**: `detail`(에러 name/message 200자)과 silent 로깅 정책이 시크릿/프롬프트를 노출하지 않는지
- **systemInstruction 미사용 결정**: 프롬프트 통째 전달이 `buildPrompt` 책임 분리와 일관되는지
- **커밋 히스토리 주의**: 중간 TDD green 커밋들은 테스트 mock 결함으로 실제 미통과였고 마지막 커밋(383e857)에서 해소됨 — walkthrough 의 Findings 참조

## 🔗 관련 (Related)

- Phase: phase-03 / Base: `phase-03-auth-ui-llm` (← 머지 대상, main·develop 직접 머지 금지)
- 선행/후속 spec: spec-03-01, spec-03-02 / 후속 spec-03-04(qa-server-action, 첫 사용처)
