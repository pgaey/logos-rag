# feat(spec-03-05): /qa 페이지 — 질문 입력 + 답변·근거 verse 렌더링

## 📋 Summary

### 배경 및 목적
spec-03-04 에서 `askQuestion` Server Action(인증+검색+프롬프트+LLM 통합)이 완성됐으나 이를 호출할 화면이 없었다. 본 spec 이 `/qa` 페이지를 추가해 **로그인 → 한국어 질문 → 한국어 답변 + 영문 근거 verse** 엔드투엔드를 완성한다. phase-03 의 마지막 spec.

### 주요 변경 사항
- [x] `/qa` RSC 페이지 — `requireUser()` 보조 가드(미인증 시 `/login` redirect) + `QaForm` 렌더
- [x] `QaForm` client 컴포넌트 — `useState`+`useTransition` 으로 `askQuestion` 직접 호출, 5종 결과 분기 렌더(답변/verse 카드/오류 메시지), 로딩·빈입력 가드
- [x] `messages.ts` — `AskResult` 실패 reason(5종) → 한국어 안내 순수 함수 (타입 파생으로 동기화 강제)
- [x] reason→메시지 단위 테스트 7종

### Phase 컨텍스트
- **Phase**: `phase-03` (auth-ui-llm)
- **본 SPEC 의 역할**: 검색·LLM·인증을 사용자 화면으로 연결하는 마지막 조각. 머지 시 phase-03 의 엔드투엔드 목표 달성.

## 🎯 Key Review Points

1. **action 호출 방식**: `askQuestion` 이 typed object 인자라 `useActionState` 대신 `useState`+`useTransition` 직접 호출 채택. login(FormData→useActionState)과 다른 이유는 walkthrough 결정 기록 참조.
2. **reason 진실 공급원**: `messages.ts` 의 `Record` 키를 `Extract<AskResult,{ok:false}>['reason']` 으로 타입에서 끌어옴 → actions 의 reason 이 바뀌면 컴파일 에러로 누락 강제. (phase 표 기재는 4종이었으나 실제 코드 5종 — 코드를 진실로 삼음)
3. **인증 다층 방어**: proxy(주) + page `requireUser()`(UX 유도) + action 자체 재검증(권위 게이트). page redirect 는 보안이 아니라 UX.

## 🧪 Verification

### 자동 테스트
```bash
pnpm test
pnpm exec tsc --noEmit
```

**결과 요약**:
- ✅ `messages.test.ts`: 7 tests 통과 (5종 reason 메시지 + 4종 구분 + fallback)
- ✅ 전체 34 tests / 5 files 통과 (회귀 없음)
- ✅ `tsc --noEmit`: 에러 없음
- ⚠ eslint 미설치 — staged-lint hook skip (tsc 로 대체)

### 통합 테스트
Integration Test Required = **no**. 화면 동작은 phase 통합 시나리오 2(수동)에서 검증.

### 수동 검증 시나리오 (phase 통합과 연계)
1. 로그아웃 상태 `/qa` 접근 → `/login` redirect
2. 로그인 후 `/qa` → "천지창조에 대해 알려줘" → 로딩 → 답변(한국어)+근거 카드(영문)
3. 빈 입력 시 버튼 disabled

## 📦 Files Changed

### 🆕 New Files
- `src/app/qa/page.tsx`: `/qa` RSC + 인증 가드
- `src/app/qa/QaForm.tsx`: 질문 폼 client 컴포넌트 + 결과 분기 렌더
- `src/app/qa/messages.ts`: reason→메시지 순수 함수
- `src/app/qa/__tests__/messages.test.ts`: reason 매핑 단위 테스트
- `specs/spec-03-05-qa-page-ui/{spec,plan,task,walkthrough,pr_description}.md`: spec 산출물

### 🛠 Modified Files
- `backlog/phase-03.md`: spec-03-06 Active→Merged 정정 (#18 머지 반영)
- `backlog/queue.md`: active 마커 갱신 + 📋 대기 Phase 에 phase-05 retrieval-quality 아이디어 캡처

## ✅ Definition of Done

- [x] 모든 단위 테스트 통과 (34/34)
- [x] 통합 테스트 N/A (Integration Test Required = no)
- [x] `walkthrough.md` ship commit
- [x] `pr_description.md` ship commit
- [x] type check 통과 (lint 는 eslint 미설치로 skip)
- [ ] 사용자 검토 요청 알림 (PR 생성 후)

## 🔗 관련 자료

- Phase: `backlog/phase-03.md`
- Walkthrough: `specs/spec-03-05-qa-page-ui/walkthrough.md`
- 의존: spec-03-04 (`askQuestion`, `AskResult`)
- PR 대상 브랜치: `phase-03-auth-ui-llm` (phase base branch)
