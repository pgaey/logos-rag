# feat(spec-02-02): add search-prompt cli and eval-prompt script

## 📋 Summary

### 배경 및 목적
`buildPrompt()` 함수가 완성된 이후, 개발 중 "질문을 넣으면 어떤 프롬프트가 나오는지" 를 콘솔에서 바로 확인할 방법이 없었습니다. 또한 phase-02 Done 기준인 "KO top-K 포함률 ≥ 60%" 를 자동으로 측정하는 스크립트도 없었습니다. 이 PR 은 두 문제를 해결합니다.

### 주요 변경 사항
- [x] `scripts/search-prompt.ts` — `pnpm search:prompt "<질문>" [k]` CLI: verse 표 + 완성 프롬프트 출력
- [x] `scripts/eval-prompt.ts` — `pnpm eval:prompt`: KO 5건 일괄 평가 + 리포트 저장
- [x] `docs/eval/phase-02-prompt-report.md` — 평가 결과 리포트 (KO 5/5, 100%)
- [x] `package.json` — `search:prompt`, `eval:prompt` 스크립트 추가

### Phase 컨텍스트
- **Phase**: `phase-02` (search-prompt)
- **본 SPEC 의 역할**: 검색+프롬프트 조립 end-to-end 검증 도구 제공. phase-02 통합 테스트 시나리오 1 충족.

## 🎯 Key Review Points

1. **`eval-prompt.ts` 구조**: `eval-search.ts` 의 패턴(judgeHit, sleep, 리포트 생성)을 재활용. KO만 실행, 각 결과에 `buildPrompt` 호출하여 프롬프트 샘플을 리포트에 포함.
2. **100% 포함률**: 기준(≥ 60%) 대비 100% 달성 — phase-01 때와 동일하게 Genesis 적재 범위 내 정답이 모두 적중.

## 🧪 Verification

### 자동 테스트
```bash
pnpm test
```
**결과**: ✅ 3/3 PASS

### 통합 테스트
```bash
pnpm eval:prompt
```
**결과**: ✅ KO: 5/5 (100%) — 기준 60% 초과

### 수동 검증 시나리오
1. `pnpm search:prompt "천지창조" 3` → verse 3건 표 + 완성 프롬프트 콘솔 출력 확인
2. `pnpm eval:prompt` → `docs/eval/phase-02-prompt-report.md` 생성 + 100% 출력

## 📦 Files Changed

### 🆕 New Files
- `scripts/search-prompt.ts`: 검색+프롬프트 CLI
- `scripts/eval-prompt.ts`: KO 평가 스크립트
- `docs/eval/phase-02-prompt-report.md`: 평가 리포트

### 🛠 Modified Files
- `package.json` (+2): `search:prompt`, `eval:prompt` 스크립트 추가

**Total**: 4 files changed

## ✅ Definition of Done

- [x] 모든 단위 테스트 통과 (3/3)
- [x] 통합 테스트 통과 (KO 5/5, 100% ≥ 60%)
- [x] `walkthrough.md` ship commit 완료
- [x] `pr_description.md` ship commit 완료
- [x] `pnpm build` 성공
- [x] 사용자 검토 요청 알림 완료

## 🔗 관련 자료

- Phase: `backlog/phase-02.md`
- Walkthrough: `specs/spec-02-02-search-cli/walkthrough.md`
- 평가 리포트: `docs/eval/phase-02-prompt-report.md`
