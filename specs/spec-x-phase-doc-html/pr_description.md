# feat(spec-x-phase-doc-html): Phase 완료 시 SVG 다이어그램 HTML 핸드오버 문서 자동 생성

> 첫 줄은 commit subject와 정확히 일치합니다.

## 📋 Summary

### 배경 및 목적

Phase 완료 후마다 신입 개발자·팀원이 "이 Phase에서 무엇을 했는가"를 파악하려면 여러 markdown 파일을 직접 뒤져야 했습니다. 핸드오버 HTML도 수동으로 작성하고 있어 품질이 들쭉날쭉하고 비용이 발생했습니다. `/hk-phase-doc` 슬래시 커맨드를 추가하여 이 과정을 자동화합니다.

### 주요 변경 사항

- [x] **신규**: `.claude/commands/hk-phase-doc.md` — Phase 완료 시 SVG 다이어그램 HTML 생성 슬래시 커맨드
- [x] **수정**: `.claude/commands/hk-phase-ship.md` — Step 6 추가 (`/hk-phase-doc` 호출 안내)

### Phase 컨텍스트

- **Phase**: spec-x (독립 단발 PR)
- **본 SPEC의 역할**: 앱 개발 로드맵(phase-02~04)과 무관하게, harness-kit 워크플로우에 문서 자동화 기능을 추가

## 🎯 Key Review Points

1. **`.claude/commands/hk-phase-doc.md`**: 에이전트가 따라야 할 HTML+SVG 생성 지침의 명확성. Phase 번호 결정 로직, 읽어야 할 파일 목록, SVG 3종 생성 가이드라인, 완료 보고 형식이 충분한지 확인.

2. **`hk-phase-ship.md` Step 6**: 기존 ship 흐름(Step 1~5)에 영향 없이 권장 안내만 추가되었는지 확인. 강제 호출이 아닌 `> /hk-phase-doc 호출 안내` 형태로 선택적임.

## 🧪 Verification

### 자동 테스트

해당 없음 — 마크다운 슬래시 커맨드 파일이므로 코드 로직 없음.

### 수동 검증 시나리오

1. **스킬 파일 존재 확인**: `ls -la .claude/commands/hk-phase-doc.md` → ✅ 파일 존재
2. **ship 통합 확인**: `grep -n "hk-phase-doc" .claude/commands/hk-phase-ship.md` → ✅ line 126에서 참조 확인
3. **스킬 활성화 확인**: Claude Code 세션에서 `/hk-phase-doc` 입력 시 스킬 목록에 나타남

## 📦 Files Changed

### 🆕 New Files

- `.claude/commands/hk-phase-doc.md`: Phase 완료 후 SVG 다이어그램 HTML 핸드오버 문서 생성 슬래시 커맨드
- `specs/spec-x-phase-doc-html/spec.md`: Spec 요구사항 정의
- `specs/spec-x-phase-doc-html/plan.md`: 실행 계획
- `specs/spec-x-phase-doc-html/task.md`: 태스크 목록
- `specs/spec-x-phase-doc-html/walkthrough.md`: 작업 기록
- `specs/spec-x-phase-doc-html/pr_description.md`: PR 설명 (이 파일)

### 🛠 Modified Files

- `.claude/commands/hk-phase-ship.md` (+18): Step 6 "핸드오버 문서 생성" 섹션 추가
- `backlog/queue.md` (+2): spec-x-phase-doc-html 대기 항목 추가

**Total**: 8 files changed

## ✅ Definition of Done

- [x] `.claude/commands/hk-phase-doc.md` 스킬 파일 생성 완료
- [x] `.claude/commands/hk-phase-ship.md` Step 6 통합 완료
- [x] 수동 검증 PASS (파일 존재, 참조 확인)
- [x] `walkthrough.md` 작성 완료
- [x] `pr_description.md` 작성 완료 (이 파일)

## 🔗 관련 자료

- Spec: `specs/spec-x-phase-doc-html/spec.md`
- Walkthrough: `specs/spec-x-phase-doc-html/walkthrough.md`
- 관련 스킬: `.claude/commands/hk-phase-ship.md`
