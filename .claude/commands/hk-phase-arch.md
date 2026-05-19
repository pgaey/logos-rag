---
description: Phase 생성 직후 아키텍처 청사진 HTML 생성 — 구현 전 설계 기준선 확보 (spec-x 제외, Phase 소속 Spec 전용)
---

**Phase를 새로 생성한 직후** 이 명령을 호출하면 예정된 Spec들의 아키텍처 청사진을 SVG 다이어그램 HTML로 생성합니다.
생성되는 문서(`docs/phase-{N}-arch.html`)는 **DRAFT BLUEPRINT** — 구현 전 설계 검증용입니다.

> ⚠ spec-x에는 적용하지 않습니다. spec-x는 Phase 소속이 없어 누적 아키텍처 컨텍스트가 없습니다.

## 1. Phase 번호 결정

`$ARGUMENTS`에 숫자가 있으면 그것을 사용합니다 (예: `/hk-phase-arch 02`).
없으면 sdd status로 읽습니다:

```bash
./.harness-kit/bin/sdd status --json | jq -r '.phase // "null"'
```

Phase 번호가 확정되지 않으면 사용자에게 물어보고 중단합니다.

이하 `{N}`은 확정된 phase 번호(예: `02`)를 의미합니다.

## 2. Phase 정의 파일 읽기

```bash
cat backlog/phase-{N}.md
```

파악할 내용:
- **Phase 제목·목표**: 무엇을 달성하려는 Phase인가
- **예정 Spec 목록**: spec ID, 제목, 한 줄 설명 (아직 구현 전이므로 spec.md가 없을 수 있음)
- **성공 기준**: Phase가 완료되면 어떤 상태여야 하는가
- **기술 스택 힌트**: phase.md에 언급된 기술, 라이브러리, 서비스

## 3. HTML 문서 생성

`docs/phase-{N}-arch.html`을 **Write 도구로** 생성합니다.
파일이 이미 존재하면 덮어쓰기합니다.

### HTML 구조 (반드시 이 순서와 섹션을 따를 것)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[DRAFT] Phase {N} 아키텍처 청사진 — {Phase 제목}</title>
  <style>
    /* 인라인 CSS — 외부 파일 금지 */
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           max-width: 1100px; margin: 0 auto; padding: 2rem; color: #1a1a2e; background: #f0f4f8; }

    /* DRAFT 배너 — 최상단 고정 */
    .draft-banner { background: linear-gradient(135deg, #f39c12, #e67e22);
                    color: white; text-align: center; padding: .75rem;
                    font-weight: 700; font-size: .9rem; letter-spacing: .1em;
                    border-radius: 8px; margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(243,156,18,.4); }

    h1 { font-size: 1.9rem; color: #16213e; border-bottom: 3px solid #2c3e7a; padding-bottom: .5rem; }
    h2 { font-size: 1.35rem; color: #2c3e7a; margin-top: 2.5rem; }
    h3 { font-size: 1.05rem; color: #4a5568; }

    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                 gap: 1rem; margin: 1.5rem 0; }
    .meta-card { background: #fff; border-radius: 8px; padding: 1rem;
                 box-shadow: 0 2px 6px rgba(0,0,0,.07); border-left: 4px solid #2c3e7a; }
    .meta-card .label { font-size: .7rem; color: #999; text-transform: uppercase; letter-spacing: .06em; }
    .meta-card .value { font-size: 1rem; font-weight: 600; color: #16213e; margin-top: .2rem; }

    /* 다이어그램 박스 — draft 느낌의 배경 */
    .diagram-box { background: #fff; border-radius: 12px; padding: 1.5rem;
                   box-shadow: 0 2px 10px rgba(0,0,0,.08); margin: 1.5rem 0;
                   border: 2px dashed #aab; overflow-x: auto; }
    .diagram-title { font-size: .8rem; font-weight: 700; color: #2c3e7a;
                     text-transform: uppercase; letter-spacing: .08em; margin-bottom: 1rem; }
    .diagram-subtitle { font-size: .75rem; color: #f39c12; margin-bottom: .8rem;
                        font-style: italic; }

    /* Spec 카드 — "계획됨" 스타일 */
    .spec-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem; }
    .spec-card { background: #f7f9fc; border-radius: 10px; padding: 1.1rem;
                 border: 2px dashed #8899bb; position: relative; }
    .spec-card::before { content: "PLANNED"; position: absolute; top: .5rem; right: .75rem;
                         font-size: .65rem; font-weight: 700; color: #8899bb; letter-spacing: .08em; }
    .spec-card .spec-id { font-size: .75rem; color: #8899bb; font-family: monospace; }
    .spec-card h3 { margin: .3rem 0 .5rem; color: #2c3e7a; font-size: 1rem; }
    .spec-card .desc { font-size: .88rem; color: #556; line-height: 1.5; }

    .goal-box { background: #e8f0fe; border-radius: 10px; padding: 1.2rem;
                border-left: 4px solid #2c3e7a; margin: 1rem 0; }
    .goal-box p { margin: 0; font-size: .95rem; color: #2c3e7a; line-height: 1.6; }

    footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ccd;
             font-size: .78rem; color: #999; text-align: center; }
  </style>
</head>
<body>

<!-- DRAFT 배너 -->
<div class="draft-banner">
  ⚠ DRAFT BLUEPRINT — 이 문서는 구현 전 설계 청사진입니다. 실제 구현과 다를 수 있습니다.
</div>

<!-- 섹션 1: Phase 개요 -->
<h1>Phase {N}: {Phase 한글 제목}</h1>

<div class="goal-box">
  <p><strong>목표:</strong> {Phase가 달성하려는 것을 2~3문장으로. 왜 이 Phase가 필요한가, 완료 시 어떤 상태가 되는가.}</p>
</div>

<div class="meta-grid">
  <div class="meta-card">
    <div class="label">Phase ID</div>
    <div class="value">phase-{N}</div>
  </div>
  <div class="meta-card">
    <div class="label">상태</div>
    <div class="value">🔵 계획됨</div>
  </div>
  <div class="meta-card">
    <div class="label">예정 Spec 수</div>
    <div class="value">{N}개</div>
  </div>
  <div class="meta-card">
    <div class="label">문서 유형</div>
    <div class="value">아키텍처 청사진</div>
  </div>
</div>

<!-- 섹션 2: Spec 타임라인 SVG (계획됨 상태) -->
<h2>🗓 예정 Spec 타임라인</h2>
<div class="diagram-box">
  <div class="diagram-title">Spec 진행 예정 순서</div>
  <div class="diagram-subtitle">※ 모든 노드는 "계획됨" 상태입니다 (회색 = 미시작)</div>
  <!--
    SVG 생성 지침:
    - hk-phase-doc의 타임라인과 동일한 레이아웃, 단 색상만 다름
    - 노드 색상: 모두 #8899bb (회색-파랑, 미구현 표시)
    - 노드 테두리: 2px dashed
    - 카드 배경: #f0f4f8 (연한 회색)
    - 텍스트: seq 번호, Spec 예정 제목 표시
    - 전체 너비: 900~1000px, 높이: 200~280px
    실제 예정 Spec 수와 제목에 맞게 노드를 배치할 것.
  -->
  <svg viewBox="0 0 960 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:960px">
    {에이전트가 예정 Spec 목록 기반으로 타임라인 SVG 생성 — 모든 노드 회색(#8899bb), 점선 스타일}
  </svg>
</div>

<!-- 섹션 3: 아키텍처 컴포넌트 SVG (계획됨 상태) -->
<h2>🏗 예정 아키텍처 컴포넌트</h2>
<div class="diagram-box">
  <div class="diagram-title">Phase에서 도입·수정할 컴포넌트 (계획)</div>
  <div class="diagram-subtitle">※ 점선 테두리 = 미구현 (구현 후 hk-phase-doc에서 실선으로 갱신됩니다)</div>
  <!--
    SVG 생성 지침:
    - 컴포넌트 박스: rect, rx=8, stroke-dasharray="6 3" (점선), fill="#f0f4f8"
    - 레이어 구분 배경: 더 연한 파스텔 (계획 단계 느낌)
    - 화살표: stroke="#8899bb", stroke-dasharray="4 2" (점선)
    - 신규 예정 컴포넌트: 파란 점선 테두리, 기존 컴포넌트: 회색 실선
    - 레이블에 "(예정)" 표시 가능
    - 전체 너비: 900~1000px, 높이: 320~420px
    phase.md에서 파악한 기술 스택과 예정 Spec들의 목적을 기반으로 작성할 것.
    실제 구현할 컴포넌트를 추론하여 의미 있는 다이어그램을 생성할 것 — placeholder 금지.
  -->
  <svg viewBox="0 0 960 380" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:960px">
    {에이전트가 phase.md 기반으로 예정 아키텍처 SVG 생성 — 점선 스타일}
  </svg>
</div>

<!-- 섹션 4: 데이터 플로우 SVG (계획됨 상태) -->
<h2>🔄 예정 데이터 흐름</h2>
<div class="diagram-box">
  <div class="diagram-title">핵심 데이터 처리 경로 (계획)</div>
  <div class="diagram-subtitle">※ 계획 단계의 데이터 흐름입니다. 구현 후 변경될 수 있습니다.</div>
  <!--
    SVG 생성 지침:
    - hk-phase-doc의 데이터플로우와 동일한 레이아웃
    - 색상: 모두 연한 파스텔 (#aac, #bbd 계열)
    - 박스 테두리: stroke-dasharray="5 3" (점선)
    - 화살표: 점선
    - 전체 너비: 900~1000px, 높이: 160~220px
    phase.md에서 파악한 데이터 흐름을 기반으로 작성할 것.
  -->
  <svg viewBox="0 0 960 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:960px">
    {에이전트가 예정 데이터 흐름 기반으로 플로우 SVG 생성 — 점선 파스텔 스타일}
  </svg>
</div>

<!-- 섹션 5: 예정 Spec 카드 -->
<h2>📦 예정 Spec 목록</h2>
<div class="spec-cards">
  <!-- phase.md의 각 Spec 항목마다 아래 카드를 생성 -->
  {에이전트가 phase.md의 Spec 목록 기반으로 카드 생성}
  <!--
  <div class="spec-card">
    <div class="spec-id">spec-{N}-{seq}</div>
    <h3>{예정 Spec 제목}</h3>
    <p class="desc">{phase.md에서 이 Spec이 무엇을 할지 설명. spec.md가 아직 없으면 phase.md 내용 기반으로 작성.}</p>
  </div>
  -->
</div>

<footer>
  생성: /hk-phase-arch | Phase {N} 계획 중 | DRAFT BLUEPRINT — 구현 완료 후 /hk-phase-doc 으로 최종본 생성
</footer>

</body>
</html>
```

## 4. 완료 보고

HTML 생성 후 다음 형식으로 보고합니다:

```
✅ 아키텍처 청사진 생성 완료

  📐 docs/phase-{N}-arch.html  [DRAFT BLUEPRINT]
  📊 SVG 다이어그램: Spec 타임라인 · 아키텍처 컴포넌트 · 데이터 플로우
  📦 예정 Spec: {N}개

이 문서는 구현 전 설계 기준선입니다.
Phase 완료 후 /hk-phase-doc 으로 최종 핸드오버 문서를 생성하세요.
```

## 주의 사항

- **placeholder 금지**: SVG 주석의 `{에이전트가 ... 생성}` 텍스트는 실제 내용으로 반드시 대체해야 합니다.
- **추론 필수**: phase.md만 있고 spec.md가 없는 상태이므로, 에이전트는 Phase 목표와 Spec 제목으로부터 예상 아키텍처를 추론하여 SVG를 작성합니다. 추론임을 SVG 내 "(예정)" 표기로 명시해도 됩니다.
- **DRAFT 스타일 일관성**: 점선 테두리, 회색/파스텔 색상이 "계획됨"을 시각적으로 전달해야 합니다. hk-phase-doc(완료 후)와 명확히 구분되어야 합니다.
- **자기완결 HTML**: 외부 CSS, JS, 이미지 URL 금지. 모든 스타일은 `<style>` 안에.
- **spec-x는 대상 외**: spec-x로 작업 중이거나 Phase가 없으면 "Phase 없음 — spec-x는 hk-phase-arch 대상이 아닙니다"를 보고하고 중단합니다.
