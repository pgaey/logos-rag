# Walkthrough: spec-x-phase-doc-html

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| HTML 생성 방식 | bash 스크립트 vs 에이전트 스킬 | 에이전트 스킬 | 아키텍처 다이어그램은 파일 파싱만으로 자동 도출 불가. 에이전트가 spec.md·walkthrough.md를 읽고 추론해야 의미 있는 SVG 생성 가능 |
| hk-phase-ship 통합 방법 | 강제 호출 vs 권장 안내 | 권장 안내 (Step 6) | Phase 마무리 시 문서 생성이 필수가 아닌 강력 권장. 강제 호출 시 기존 ship 흐름의 자동 진행 원칙과 충돌 |
| 작업 모드 | SDD-P (phase-02 신설) vs spec-x | spec-x | 기존 앱 개발 로드맵(phase-02~04)을 유지하면서 단발 PR로 완결 가능한 범위 |
| 아키텍처 문서 생성 시점 | 완료 시점만 vs 생성+완료 양쪽 | 생성+완료 양쪽 | 아키텍처는 끝에 기록하는 회고보다 처음에 그리는 설계 도구로서 더 큰 가치. `/hk-phase-arch`(청사진)와 `/hk-phase-doc`(핸드오버)로 역할 분리 |
| spec 단위 아키텍처 문서 | spec마다 생성 vs Phase 단위만 | Phase 단위만 | spec마다 별도 HTML을 만들면 N개 파일이 분산. spec 수준은 spec.md의 개념도(Mermaid)로 충분 |
| hk-phase-arch 호출 방식 | align 자동 실행 vs 사용자 선택 안내 | 사용자 선택 안내 | Phase 생성 직후 강제 실행 시 의도치 않은 파일 생성. 한 줄 안내로 충분 |

### ADR 승격 가이드

- [x] ADR 승격 대상 있음 → spec.md에 후보 기록됨 (`hk-phase-doc-as-agent-skill`, type: decision). 다른 spec들이 이 결정(에이전트 스킬 방식)에 의존하고 장기 유지될 가능성 높으나, 현 시점 spec 수가 적어 ADR 작성은 phase-02 착수 전으로 이월.

## 💬 사용자 협의

- **주제**: Work Mode 선택 (SDD-P vs spec-x)
  - **사용자 의견**: spec-x (단발 PR) 선택
  - **합의**: 기존 앱 개발 로드맵(phase-02~04)을 건드리지 않고 독립 PR로 처리

- **주제**: harness-kit 0.9.1 → 0.13.0 업데이트
  - **사용자 의견**: 세션 중 `--update` 로 업데이트 실행
  - **합의**: 업데이트 후 신규 버전 기준으로 작업 진행. state 복원 확인 완료

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: 해당 없음 (이 spec은 마크다운 슬래시 커맨드 파일 작성이 핵심, 코드 로직 없음)
- **결과**: 수동 검증으로 대체

### 2. 수동 검증

1. **Action**: `ls -la .claude/commands/hk-phase-doc.md`
   - **Result**: 파일 생성 확인 (12571 bytes, 2026-05-19)

2. **Action**: `grep -n "hk-phase-doc" .claude/commands/hk-phase-ship.md`
   - **Result**: line 126에서 `/hk-phase-doc` 참조 확인

3. **Action**: `bash .harness-kit/bin/sdd status`
   - **Result**: harness-kit 0.13.0, Active Spec: spec-x-phase-doc-html, Plan Accept: yes

## 🔍 발견 사항

- harness-kit 0.13.0에서 `sdd specx new <slug>` 명령이 spec-x 전용으로 분리됨 (구 버전의 `sdd spec new`와 다름)
- `hk-phase-ship.md`, `hk-align.md`는 harness-kit 업데이트 시 덮어쓰일 수 있는 파일. 수정 내용이 다음 업데이트에서 유실될 위험 존재 → 향후 harness-kit에 user-hook 영역(예: `hk-phase-ship.user.md`)을 두는 방안 고려 가능
- 아키텍처 문서 생성 시점에 대한 논의에서 "완료 후 회고"보다 "시작 전 청사진"이 더 큰 설계 가치를 가짐을 확인 → `/hk-phase-arch` 신설로 해결

## 🚧 이월 항목

- ADR 작성: `hk-phase-doc-as-agent-skill` (type: decision) — phase-02 착수 전에 작성 권장

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent (Sonnet 4.6) + evan |
| **작성 기간** | 2026-05-19 ~ 2026-05-19 |
| **최종 commit** | `ebfbbf3` |
