# feat(spec-x-phase-doc-html): Phase SVG 다이어그램 HTML 문서 자동화 (생성 시점 + 완료 시점)

> 첫 줄은 commit subject와 정확히 일치합니다.

## 📋 Summary

### 배경 및 목적

Phase 라이프사이클 양 끝에서 문서화 자동화가 부재했습니다:
- **시작 시점**: Phase 생성 후 아키텍처 청사진이 없어 설계 검증 없이 구현에 돌입
- **완료 시점**: Phase 완료 후 핸드오버 HTML을 수동 작성하는 반복 비용

두 슬래시 커맨드로 Phase 전체 라이프사이클을 커버합니다.

### 주요 변경 사항

- [x] **신규** `.claude/commands/hk-phase-arch.md` — Phase 생성 직후 아키텍처 청사진 HTML 생성 (`docs/phase-{N}-arch.html`). 점선/회색 SVG로 "계획됨" 상태 시각화. spec-x 제외.
- [x] **신규** `.claude/commands/hk-phase-doc.md` — Phase 완료 후 핸드오버 HTML 생성 (`docs/phase-{N}-handover.html`). 완료 상태 SVG + 신입 개발자 온보딩 섹션.
- [x] **수정** `.claude/commands/hk-phase-ship.md` — Step 6: Phase ship 완료 후 `/hk-phase-doc` 호출 안내 추가
- [x] **수정** `.claude/commands/hk-align.md` — Step 6: SDD-P 확정 후 `sdd phase new` 직후 `/hk-phase-arch` 호출 안내 추가

### Phase 컨텍스트

- **Phase**: spec-x (독립 단발 PR)
- **라이프사이클 커버리지**:
  ```
  sdd phase new → /hk-phase-arch  →  docs/phase-{N}-arch.html     [DRAFT BLUEPRINT]
  (구현 진행)
  /hk-phase-ship → /hk-phase-doc  →  docs/phase-{N}-handover.html [FINAL HANDOVER]
  ```

## 🎯 Key Review Points

1. **`hk-phase-arch.md`**: DRAFT 스타일(점선·회색)이 hk-phase-doc(완료·초록)과 명확히 구분되는지. spec-x 제외 조건이 명시되어 있는지.

2. **`hk-phase-doc.md`**: SVG 3종(타임라인·컴포넌트·데이터플로우) 생성 가이드라인이 에이전트가 의미 있는 다이어그램을 만들기에 충분한지. placeholder 금지 조항이 명확한지.

3. **`hk-align.md` Step 6**: 강제 실행이 아닌 "한 줄 안내" 수준으로 제한되어 있는지. SDD-P 모드에만 적용됨이 명시되어 있는지.

## 🧪 Verification

### 수동 검증 시나리오

1. `ls .claude/commands/hk-phase-arch.md` → ✅ 파일 존재
2. `ls .claude/commands/hk-phase-doc.md` → ✅ 파일 존재
3. `grep "hk-phase-doc" .claude/commands/hk-phase-ship.md` → ✅ Step 6 확인
4. `grep "hk-phase-arch" .claude/commands/hk-align.md` → ✅ Step 6 확인

## 📦 Files Changed

### 🆕 New Files

- `.claude/commands/hk-phase-arch.md`: Phase 생성 직후 아키텍처 청사진 HTML 생성 슬래시 커맨드
- `.claude/commands/hk-phase-doc.md`: Phase 완료 후 핸드오버 HTML 생성 슬래시 커맨드
- `specs/spec-x-phase-doc-html/` (spec, plan, task, walkthrough, pr_description)

### 🛠 Modified Files

- `.claude/commands/hk-phase-ship.md` (+18): Step 6 추가
- `.claude/commands/hk-align.md` (+12): Step 6 추가
- `backlog/queue.md` (+2): spec-x 완료 이동

**Total**: 9 files changed

## ✅ Definition of Done

- [x] `hk-phase-arch.md` 스킬 생성 완료
- [x] `hk-phase-doc.md` 스킬 생성 완료
- [x] `hk-phase-ship.md` Step 6 통합 완료
- [x] `hk-align.md` Step 6 통합 완료
- [x] `walkthrough.md` 작성 완료
- [x] `pr_description.md` 작성 완료

## 🔗 관련 자료

- Spec: `specs/spec-x-phase-doc-html/spec.md`
- Walkthrough: `specs/spec-x-phase-doc-html/walkthrough.md`
