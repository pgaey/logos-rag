# feat(spec-02-01): implement buildPrompt in prompt/template

> 첫 줄은 commit subject 와 정확히 일치해야 합니다 (`type(spec-...): description`).
> hosted git UI 에 그대로 붙여넣기 좋도록 작성합니다.

## 📋 Summary

### 배경 및 목적
phase-01 에서 `searchVerses()` 로 verse 를 검색할 수 있게 되었지만, 검색 결과를 Gemini Flash 등 LLM 에 투입하려면 시스템 지침 + verse 컨텍스트 + 사용자 질문이 조합된 프롬프트가 필요합니다. 이 PR 은 그 조립 로직 (`buildPrompt`) 을 순수 함수로 구현하고, 프로젝트 최초의 unit test 인프라(Vitest)를 함께 도입합니다.

### 주요 변경 사항
- [x] Vitest 4.1.6 설치 + `vitest.config.ts` (`@/` path alias 포함) + `pnpm test` 명령 추가
- [x] `src/lib/prompt/template.ts` — `buildPrompt(question, verses)` 순수 함수 구현
- [x] `src/lib/prompt/__tests__/template.test.ts` — 3개 unit test (세 섹션 포함 / verse 형식 / 빈 배열 처리)

### Phase 컨텍스트
- **Phase**: `phase-02` (search-prompt)
- **본 SPEC 의 역할**: spec-02-02 (CLI), spec-02-03 (API route) 가 공통으로 의존하는 프롬프트 조립 핵심 모듈 제공

## 🎯 Key Review Points

1. **`buildPrompt` 프롬프트 구조**: `[System]` / `[Relevant Bible Verses]` / `[User Question]` 세 섹션. 영문 시스템 지침 + `[Book Ch:V] text` 형식의 verse 나열. phase-03 에서 Gemini Flash `systemInstruction` 필드 분리 시 이 함수 자체는 변경 없이 래퍼 추가로 대응 가능.
2. **빈 verse 처리**: `verses.length === 0` 이면 `"No relevant verses found."` 표시 — LLM 이 "자료 없음"을 인지하고 솔직히 답변하도록 유도.

## 🧪 Verification

### 자동 테스트
```bash
pnpm test
```

**결과 요약**:
- ✅ `buildPrompt > 세 섹션(시스템/컨텍스트/질문)을 모두 포함한다`: 통과
- ✅ `buildPrompt > verse 를 번호 붙인 [Book Ch:V] 형식으로 나열한다`: 통과
- ✅ `buildPrompt > verses 가 빈 배열이면 No relevant verses found. 를 표시한다`: 통과

### 수동 검증 시나리오
1. `pnpm test` → 3/3 PASS
2. `pnpm build` → TypeScript 오류 없음, 정적 빌드 성공

## 📦 Files Changed

### 🆕 New Files
- `vitest.config.ts`: Vitest 설정 (node 환경, `@/` path alias, `passWithNoTests: true`)
- `src/lib/prompt/template.ts`: `buildPrompt()` 순수 함수
- `src/lib/prompt/__tests__/template.test.ts`: 3개 unit test

### 🛠 Modified Files
- `package.json` (+2): `"test": "vitest run"` 스크립트 + `vitest` devDependency 추가
- `pnpm-lock.yaml`: Vitest 4.1.6 lock 갱신

**Total**: 5 files changed

## ✅ Definition of Done

- [x] 모든 단위 테스트 통과 (3/3)
- [x] `walkthrough.md` ship commit 완료
- [x] `pr_description.md` ship commit 완료
- [x] lint / type check 통과 (`pnpm build` 성공)
- [x] 사용자 검토 요청 알림 완료

## 🔗 관련 자료

- Phase: `backlog/phase-02.md`
- Walkthrough: `specs/spec-02-01-prompt-template/walkthrough.md`
