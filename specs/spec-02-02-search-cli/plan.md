# Implementation Plan: spec-02-02

## 📋 Branch Strategy
- 신규 브랜치: `spec-02-02-search-cli`
- 시작 지점: `phase-02-search-prompt` (spec-02-01 머지 후 분기)
- 첫 task 가 브랜치 생성을 수행함

## 🛑 사용자 검토 필요 (User Review Required)

> [!IMPORTANT]
> - [ ] **spec-02-01 머지 선행 필수**: `spec-02-01-prompt-template` 이 `phase-02-search-prompt` 에 머지된 후 이 spec 을 시작해야 한다.
> - [ ] **package.json 스크립트 추가**: `"search:prompt"`, `"eval:prompt"` 두 스크립트를 추가한다.

> [!WARNING]
> - [ ] 기존 `eval:search` 패턴과 충돌 없음 — 신규 스크립트 추가만

## 🎯 핵심 전략 (Core Strategy)

### 주요 결정

| 컴포넌트 | 전략 | 이유 |
|:---:|:---|:---|
| **search-prompt.ts** | `process.argv` 로 질문·K값 수신, `searchVerses` + `buildPrompt` 순차 호출 | 단순 CLI, 프레임워크 불필요 |
| **eval-prompt.ts** | `eval-search.ts` 구조 재활용, KO 정량만 실행 | 중복 코드 최소화, 기존 패턴 일관성 |
| **리포트 경로** | `docs/eval/phase-02-prompt-report.md` | phase-01 리포트(`phase-01-search-report.md`)와 동일 디렉토리 |

### 📑 ADR 후보
- [x] 없음

## 📂 Proposed Changes

### [CLI 스크립트]

#### [NEW] `scripts/search-prompt.ts`
```typescript
// 실행: pnpm search:prompt "<question>" [k=5]
// 1. process.argv 파싱 (question, k)
// 2. searchVerses(question, k) 호출
// 3. verse 결과 표 출력 (book/ch/v/similarity/text[:60])
// 4. buildPrompt(question, verses) 호출
// 5. "=== 완성 프롬프트 ===" 구분선 후 전문 출력
```

#### [NEW] `scripts/eval-prompt.ts`
```typescript
// 실행: pnpm eval:prompt
// 1. data/eval-set.json 로드
// 2. quantitative.ko 5건 순차 실행 (700ms delay)
// 3. judgeHit 판정 (eval-search.ts 동일 로직)
// 4. 각 결과에 buildPrompt 호출 → 프롬프트 샘플 리포트 포함
// 5. docs/eval/phase-02-prompt-report.md 저장
// 6. 콘솔: "KO: X/5 (Y%)"
```

#### [MODIFY] `package.json`
```json
"search:prompt": "tsx --env-file=.env.local scripts/search-prompt.ts",
"eval:prompt": "tsx --env-file=.env.local scripts/eval-prompt.ts"
```

## 🧪 검증 계획 (Verification Plan)

### 수동 검증 시나리오
1. `pnpm search:prompt "천지창조" 3` — verse 3건 + 프롬프트 출력 확인
2. `pnpm eval:prompt` — `docs/eval/phase-02-prompt-report.md` 생성 + KO 포함률 ≥ 60% 확인

### 통합 테스트 (Integration Test Required = yes)
```bash
pnpm eval:prompt
# 성공 기준: KO top-5 포함률 ≥ 60%
```

## 🔁 Rollback Plan
- 신규 파일만 추가, package.json 스크립트만 추가
- 롤백: 브랜치 삭제 후 package.json revert

## 📦 Deliverables 체크
- [ ] task.md 작성
- [ ] 사용자 Plan Accept 받음
- [ ] (실행 후) 모든 task 완료
- [ ] (실행 후) walkthrough.md / pr_description.md ship
