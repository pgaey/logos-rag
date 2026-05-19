# spec-x-phase-doc-html: Phase 완료 시 SVG 다이어그램 HTML 핸드오버 문서 자동 생성

## 📋 메타

| 항목 | 값 |
|---|---|
| **Spec ID** | `spec-x-phase-doc-html` |
| **Phase** | `spec-x` (Phase 비소속) |
| **Branch** | `spec-x-phase-doc-html` |
| **상태** | Planning |
| **타입** | Feature |
| **Integration Test Required** | no |
| **작성일** | 2026-05-19 |
| **소유자** | evan |

## 📋 배경 및 문제 정의

### 현재 상황

harness-kit의 Phase 완료 흐름(`/hk-phase-ship`)은 성공 기준 검증 → 통합 테스트 → go/no-go → PR 생성으로 마무리된다. Phase 완료 후 신입 개발자 또는 팀원이 "이 Phase에서 무엇을 했는가"를 파악하려면 `backlog/phase-{N}.md`, `specs/*/walkthrough.md` 등 여러 파일을 직접 뒤져야 한다. 현재 `docs/phase-01-handover.html` 같은 핸드오버 문서는 수동으로 개별 작성하고 있다.

### 문제점

- Phase 완료마다 핸드오버 HTML을 수동으로 작성하는 반복 비용 발생
- 문서화 품질이 작성자의 숙련도와 시간에 따라 들쭉날쭉함
- 신입 개발자가 Phase의 전체 그림을 한눈에 파악할 단일 진입점이 없음
- SVG 다이어그램 없이 텍스트만으로는 아키텍처·흐름 이해에 한계가 있음

### 해결 방안 (요약)

`/hk-phase-doc` 슬래시 커맨드(스킬)를 신설하고, `hk-phase-ship` 완료 시 자동으로 호출하도록 통합한다. 이 스킬은 Phase 산출물(phase.md, 각 spec의 spec.md·walkthrough.md)을 읽고, SVG 다이어그램(스펙 타임라인·아키텍처 컴포넌트·데이터 플로우)이 인라인으로 포함된 단일 HTML 파일을 `docs/phase-{N}-handover.html`로 생성한다.

## 📊 개념도

```mermaid
sequenceDiagram
    participant U as 사용자
    participant S as /hk-phase-ship
    participant D as /hk-phase-doc
    participant FS as 파일시스템

    U->>S: /hk-phase-ship 호출
    S->>S: 성공기준 검증 + 통합테스트
    S->>U: Go/No-Go 보고
    U->>S: Y (승인)
    S->>S: sdd phase done (또는 Phase PR 생성)
    S->>D: hk-phase-doc 자동 호출 안내
    D->>FS: backlog/phase-{N}.md 읽기
    D->>FS: specs/spec-{N}-*/spec.md + walkthrough.md 읽기
    D->>FS: docs/phase-{N}-handover.html 생성
    D->>U: 생성 완료 보고 (파일 경로)
```

## 🎯 요구사항

### Functional Requirements

1. `/hk-phase-doc` 슬래시 커맨드(`.claude/commands/hk-phase-doc.md`)를 신설한다.
2. 스킬은 현재 active phase 또는 인자로 전달된 phase 번호(`$ARGUMENTS`)를 기준으로 동작한다.
3. 스킬 실행 시 에이전트는 다음 파일들을 읽고 내용을 분석한다:
   - `backlog/phase-{N}.md` (Phase 메타, spec 목록, 성공 기준, ADR)
   - `specs/spec-{N}-{seq}-*/spec.md` (각 Spec 요구사항 및 배경)
   - `specs/spec-{N}-{seq}-*/walkthrough.md` (각 Spec 결정 로그)
4. 에이전트는 다음 SVG 다이어그램을 HTML 안에 인라인으로 생성한다:
   - **스펙 타임라인 SVG**: 수평 타임라인 위에 각 Spec을 카드로 배치, 완료 순서와 제목 표시
   - **아키텍처 컴포넌트 SVG**: Phase에서 도입·수정된 시스템 컴포넌트와 의존 관계 표시
   - **데이터 플로우 SVG**: 핵심 데이터가 어떻게 입력→처리→저장→출력되는지 흐름 표시
5. HTML 문서는 다음 섹션을 포함한다:
   - Phase 개요 (제목, 목표, 기간, 완료 날짜)
   - 스펙 타임라인 SVG
   - 아키텍처 컴포넌트 SVG
   - 데이터 플로우 SVG
   - 스펙별 요약 카드 (제목, 한 줄 설명, 주요 결정사항)
   - 핵심 결정 모음 (walkthrough.md에서 추출)
   - 신입 개발자를 위한 "여기서부터 시작하세요" 섹션 (핵심 파일 목록, 실행 방법)
6. 생성 위치: `docs/phase-{N}-handover.html` (단일 자기완결 파일, 외부 CDN/CSS 없음)
7. HTML은 한국어로 작성되며, 코드·경로·기술 용어는 영어 허용
8. `hk-phase-ship` 스킬의 Step 5 완료 직후 `hk-phase-doc` 호출 안내 문구를 추가한다

### Non-Functional Requirements

1. 생성된 HTML은 외부 네트워크 없이 브라우저에서 열리면 완전히 동작해야 한다 (인라인 SVG, 인라인 CSS)
2. SVG 다이어그램은 실제 Phase 내용을 기반으로 에이전트가 직접 작성 — 템플릿 placeholder 금지
3. 신입 개발자 기준 10분 이내에 Phase 전체 흐름을 파악할 수 있는 수준의 설명 품질

## 🚫 Out of Scope

- 기존 수동 작성 HTML(`docs/phase-01-handover.html`)의 소급 재생성
- CI/CD 파이프라인 자동 실행 (Claude Code 세션 밖의 자동화)
- 다이어그램 편집 UI / 인터랙티브 기능 (정적 SVG로 충분)
- 다크모드, 반응형 레이아웃 (기본 브라우저 렌더링으로 충분)

## 📑 ADR 후보 (Architecture Decision Records)

- [x] ADR 가치 있는 결정 있음 → `hk-phase-doc-as-agent-skill` (type: decision) — "HTML 생성을 bash 스크립트가 아닌 에이전트 스킬로 구현"하는 이유: 아키텍처 다이어그램은 파일 파싱만으로 자동 도출 불가, 에이전트의 추론이 필수

## ✅ Definition of Done

- [ ] `.claude/commands/hk-phase-doc.md` 스킬 파일 생성 및 내용 검증
- [ ] `.claude/commands/hk-phase-ship.md` Step 5에 `hk-phase-doc` 호출 안내 추가
- [ ] `walkthrough.md`와 `pr_description.md` 작성 및 ship commit 완료
- [ ] `spec-x-phase-doc-html` 브랜치 push 완료
- [ ] 사용자 검토 요청 알림 완료
