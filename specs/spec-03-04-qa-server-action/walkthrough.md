# Walkthrough: spec-03-04

> 구현 완료 후 작성하는 결정 기록 + 변경 요약. 리뷰어가 이 문서만 읽고도 의도와 범위를 이해할 수 있어야 한다.

## 📋 메타

| 항목 | 값 |
|---|---|
| **Spec ID** | `spec-03-04` |
| **Branch** | `spec-03-04-qa-server-action` |
| **상태** | Shipped |
| **작성일** | 2026-05-31 |

## 🎯 무엇을 / 왜 (What & Why)

phase-03까지 인증·검색·프롬프트·LLM 부품이 모두 준비됐지만 이를 묶어 "질문 → 답변"을 수행하는 진입점이 없었다. 이 spec은 `askQuestion(input)` Server Action으로 **인증 게이트 → 입력 검증 → 검색 → 프롬프트 조립 → LLM 호출 → typed result 매핑**을 한 곳에 묶는다. 화면(spec-03-05)은 이 함수 하나만 호출하면 되고, 검색·LLM의 이질적 실패(throw / 6종 reason)는 화면이 분기할 단일 `AskResult`(5종)로 정규화된다.

## 📦 변경 사항 (Changes)

| 파일 | 변경 | 설명 |
|---|---|---|
| `src/lib/auth/guard.ts` | 신규 | `requireUser()` — getClaims 기반 공통 인증 가드 헬퍼 |
| `src/lib/auth/__tests__/guard.test.ts` | 신규 | createClient mock, 3 시나리오 |
| `src/app/qa/actions.ts` | 신규 | `askQuestion` + `AskResult` 타입 (`'use server'`) |
| `src/app/qa/__tests__/actions.test.ts` | 신규 | guard/search/llm mock, 11 시나리오 |
| `src/lib/llm/gemini.ts` | 수정(5줄) | `classifyError` export (재사용 목적, 동작 불변) |

## 🔑 주요 결정 (Key Decisions)

- **인증: proxy 주 게이트 + `requireUser()` 보조 가드.** proxy.ts가 모든 HTTP(페이지+Server Action POST)를 matcher로 막는 주 게이트. `requireUser`는 직접 import 호출 대비 보조 + 인증 로직 DRY 집약. "다층 방어" 과장 없이 "로그인 게이트"로만 정당화(검수 반영). RLS·데이터 격리는 명시적 비목표(검색은 service-role 전역).
- **인증 방식: `getClaims()`** (getUser 아님). 코드베이스 전체(proxy.ts:43, layout) 일관 + Supabase 공식이 getUser의 더 빠른 대안으로 권장(Web Crypto 비대칭키 로컬 검증, 2025-07-14 JWT signing keys).
- **인자: typed object + zod.** FormData보다 타입 안정성·테스트 용이. `zod ^4.4.3` 이미 의존성. question 1000자 가드 + k 1~10 클램프(`/api/search`와 동일).
- **이중 가드 금지.** 최종 프롬프트 30k 한도는 `generateAnswer`(`GEMINI_MAX_INPUT_CHARS`)에 위임. question은 검색 쿼리로 충분한 1000자만 가드.
- **에러 분류: `classifyError` 재사용.** searchVerses throw도 generateAnswer와 동일 GoogleGenAI SDK라 같은 분류기로 정규화. 자작 문자열 매칭의 429·resource_exhausted 누락 위험 회피(검수 반영). 이를 위해 `classifyError`를 gemini.ts에서 export.
- **에러 매핑(6종→5종):** rate-limit/timeout은 사용자가 행동 가능(기다림/재시도)하므로 보존. auth(서버 설정)·network·invalid-input(프롬프트 과길이)·unknown은 사용자가 할 수 없는 "일시 오류"라 화면엔 unknown으로 접되, 원인은 `console.error`로 서버 로그에 남김(시크릿/본문 제외).
- **`AskResult` 타입 위치: actions.ts 동일 파일.** Next docs(`use-server.md`) 확인 결과 타입 export 금지 없음(제약은 런타임 값=함수 async·직렬화 가능 인자/반환). 기존 login/actions.ts도 동일 파일 type export 중.

## 🧪 테스트 (Tests)

`pnpm test` → 전체 **27 PASS** (template 3 + gemini 10 + guard 3 + qa 11). `tsc --noEmit` 통과, `eslint src/app/qa src/lib/auth` 무경고.

askQuestion 11 시나리오: 정상 / 미인증 / 빈 질문 / 과길이 / k 클램프 / search throw(429→rate-limit) / search throw(기타→unknown) / generate rate-limit / generate timeout / generate auth→unknown / verses 0건. classifyError는 mock하지 않고 실제 분류 경로 검증.

## ⚠ 발견 사항 / 이월 (Findings / Carry-over)

- **k 클램프 버그(해소)**: 처음 zod `.max(10)` 으로 k 를 검증했으나, zod max 는 *거부(reject)* 라 k=99 가 invalid-input 이 되어버렸다. 의도는 `/api/search` 와 동일한 *클램프(1~10 잘라냄)* 이므로 zod 에서 k 를 빼고 `clampK()` 로 처리. 테스트가 잡음.
- **커밋 유실 사고(해소)**: Task 3 커밋(c59c0a4)이 task.md 만 담고 gemini.ts 의 `classifyError` export 가 누락되어 한때 빌드가 깨진 채 push/PR 됨(tsc TS2459, qa 3 fail). 후속 커밋(2adbaff)에서 export 복구 + 누락된 spec.md/plan.md 동시 커밋. 최종 27/27 PASS, tsc clean 확인 후 정상화.


- **라이브 검증 미수행(의도)**: 실제 Supabase 세션·Gemini 호출은 phase 통합 시나리오 3(smoke-qa.ts)에서. 본 spec은 mock-only.
- **`searchVerses` 반환 non-null 확인**: 검수가 우려한 nullable 가드는 불필요(`Promise<VerseMatch[]>`, RPC error 없으면 non-null). 별도 `?? []` 가드 안 넣음.
- **다음(spec-03-05)**: `/qa` 화면이 `askQuestion`을 어떻게 호출할지(useActionState form vs 직접 호출)는 03-05에서 결정. `askQuestion(input)` 단일 인자라 양쪽 다 래핑 가능.

## 🔗 관련 (References)

- 선행: spec-03-01·02(인증), spec-03-03(generateAnswer)
- 후속: spec-03-05(qa-page-ui) — `askQuestion`/`AskResult`의 첫 사용처
- 입력 부품: `searchVerses`(phase-02), `buildPrompt`(phase-02), `generateAnswer`(spec-03-03)
- 인증 방침 메모리: project_auth_architecture
- ADR: 없음(기존 컨벤션 답습)
