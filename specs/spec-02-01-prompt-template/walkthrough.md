# Walkthrough: spec-02-01

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 테스트 프레임워크 선택 | Jest / Vitest | **Vitest 4.1.6** | Next.js 16 + ESM 환경에서 Jest 는 transform 설정 부담이 큼. Vitest 는 설정 최소화 + `@/` path alias resolve 가 간단 |
| `passWithNoTests` 옵션 | true / false | **true** | 테스트 파일 작성 전(TDD Red 이전) 단계에서 `pnpm test` 가 exit code 1 로 실패하는 문제 방지 |
| 프롬프트 섹션 구조 | 단일 문자열 / 역할별 분리 | **단일 문자열 (3섹션 결합)** | phase-03 에서 Gemini Flash SDK 의 `systemInstruction` 필드 분리는 함수 시그니처 변경으로 대응 가능. 현재는 단순화 우선 |
| verse 표기 형식 | `Book Ch:V` / `Book Chapter Chapter:Verse` | **`[Book Ch:V]`** | LLM 이 출처를 인식하기 좋은 형식. 대괄호로 verse 인용 구분 명확 |

### ADR 승격 가이드

- [x] 없음 — 모든 결정은 phase-02 범위 내 결정이며 변경 용이

## 💬 사용자 협의

- **주제**: phase-02 spec 구성 (3개)
  - **사용자 의견**: "응 그렇게 해" — prompt-template / search-cli / search-api-route 구성 동의
  - **합의**: SDD-P (Mode A), base branch `phase-02-search-prompt` 사용, `develop` 최종 머지 대상

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: `pnpm test`
- **결과**: ✅ Passed (3 tests in 166ms)
- **로그 요약**:
```text
 RUN  v4.1.6 /Users/nextpayment/Desktop/Evan/YEACHAN/logos-rag

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  22:01:35
   Duration  166ms (transform 16ms, setup 0ms, import 23ms, tests 2ms)
```

### 2. 수동 검증

1. **Action**: `pnpm build`
   - **Result**: TypeScript 컴파일 성공, 정적 페이지 생성 정상

2. **Action**: TDD Red — `buildPrompt` 없는 상태에서 `pnpm test`
   - **Result**: `Cannot find module '../template'` — 예상대로 Fail

3. **Action**: TDD Green — `template.ts` 구현 후 `pnpm test`
   - **Result**: 3개 테스트 모두 PASS

## 🔍 발견 사항

- Vitest 최초 도입으로 이후 모든 spec 에서 `pnpm test` 를 동일하게 사용 가능
- `buildPrompt` 는 순수 함수이므로 phase-03 에서 Gemini Flash `systemInstruction` 필드 분리 시 래퍼 함수를 추가하면 됨 (이 함수 자체는 변경 불필요)

## 🚧 이월 항목

없음

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent + @pgaey |
| **작성 기간** | 2026-05-19 |
| **최종 commit** | `d485a56` |
