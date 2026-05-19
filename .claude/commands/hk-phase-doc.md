---
description: Phase 완료 후 SVG 다이어그램 HTML 핸드오버 문서 생성 — 신입 개발자가 10분 안에 Phase 전체를 파악할 수 있는 수준
---

Phase 완료 후 이 명령을 호출하면 SVG 다이어그램이 포함된 HTML 핸드오버 문서를 자동으로 생성합니다.

## 1. Phase 번호 결정

`$ARGUMENTS`에 숫자가 있으면 그것을 사용합니다 (예: `/hk-phase-doc 01`).
없으면 `sdd status`로 현재 phase를 읽습니다:

```bash
./.harness-kit/bin/sdd status --json | jq -r '.phase // "null"'
```

Phase 번호가 확정되지 않으면 사용자에게 물어보고 중단합니다.

이하 설명에서 `{N}`은 확정된 phase 번호(예: `01`)를 의미합니다.

## 2. 산출물 파일 읽기

다음 파일을 **모두** 읽습니다 (존재하지 않는 파일은 건너뜀):

```bash
cat backlog/phase-{N}.md
```

그 다음 해당 phase의 모든 spec 디렉토리를 탐색합니다:

```bash
ls specs/ | grep "^spec-{N}-"
```

각 spec 디렉토리에 대해:
```bash
cat specs/<spec-dir>/spec.md
cat specs/<spec-dir>/walkthrough.md
```

## 3. 내용 분석 (에이전트 추론)

읽은 파일로부터 다음을 파악합니다:

- **Phase 목표**: phase.md의 제목·배경·목표 섹션
- **Spec 목록**: 각 spec의 ID, 제목, 한 줄 설명
- **도입된 컴포넌트**: spec.md에서 신규/수정된 파일·모듈·서비스 목록
- **데이터 흐름**: spec.md·walkthrough.md에서 데이터 입력→처리→저장→출력 경로
- **핵심 결정**: walkthrough.md의 주요 결정 사항과 이유
- **시작 방법**: 신입 개발자가 로컬에서 바로 실행할 수 있는 핵심 명령

## 4. HTML 문서 생성

`docs/phase-{N}-handover.html`을 **Write 도구로** 생성합니다.

### HTML 구조 (반드시 이 순서와 섹션을 따를 것)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phase {N} 핸드오버 — {Phase 제목}</title>
  <style>
    /* 인라인 CSS — 외부 파일 금지 */
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           max-width: 1100px; margin: 0 auto; padding: 2rem; color: #1a1a2e; background: #f8f9fa; }
    h1 { font-size: 2rem; color: #16213e; border-bottom: 3px solid #0f3460; padding-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; color: #0f3460; margin-top: 2.5rem; }
    h3 { font-size: 1.1rem; color: #533483; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                 gap: 1rem; margin: 1.5rem 0; }
    .meta-card { background: #fff; border-radius: 8px; padding: 1rem;
                 box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .meta-card .label { font-size: .75rem; color: #888; text-transform: uppercase; letter-spacing: .05em; }
    .meta-card .value { font-size: 1.1rem; font-weight: 600; color: #16213e; margin-top: .25rem; }
    .diagram-box { background: #fff; border-radius: 12px; padding: 1.5rem;
                   box-shadow: 0 2px 12px rgba(0,0,0,.1); margin: 1.5rem 0; overflow-x: auto; }
    .diagram-title { font-size: .85rem; font-weight: 600; color: #0f3460;
                     text-transform: uppercase; letter-spacing: .08em; margin-bottom: 1rem; }
    .spec-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.2rem; }
    .spec-card { background: #fff; border-radius: 10px; padding: 1.2rem;
                 box-shadow: 0 2px 8px rgba(0,0,0,.08); border-left: 4px solid #0f3460; }
    .spec-card .spec-id { font-size: .75rem; color: #888; font-family: monospace; }
    .spec-card h3 { margin: .4rem 0 .6rem; color: #16213e; }
    .spec-card .desc { font-size: .9rem; color: #444; line-height: 1.5; }
    .decision-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    .decision-table th { background: #0f3460; color: #fff; padding: .6rem 1rem; text-align: left; font-size: .85rem; }
    .decision-table td { padding: .6rem 1rem; border-bottom: 1px solid #eee; font-size: .9rem; }
    .decision-table tr:nth-child(even) td { background: #f8f9fa; }
    .start-box { background: #e8f4fd; border-radius: 10px; padding: 1.5rem; border: 1px solid #bee3f8; }
    .start-box code { background: #16213e; color: #e8f4fd; padding: .2rem .5rem;
                      border-radius: 4px; font-family: monospace; font-size: .9rem; }
    .file-list { list-style: none; padding: 0; }
    .file-list li { padding: .4rem 0; font-family: monospace; font-size: .9rem; }
    .file-list li::before { content: "📄 "; }
    .badge { display: inline-block; padding: .2rem .6rem; border-radius: 12px;
             font-size: .75rem; font-weight: 600; }
    .badge-done { background: #d4edda; color: #155724; }
    footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ddd;
             font-size: .8rem; color: #888; text-align: center; }
  </style>
</head>
<body>

<!-- 섹션 1: Phase 개요 -->
<h1>Phase {N}: {Phase 한글 제목}</h1>
<p>{Phase 목표를 2~3문장으로 설명. 왜 이 Phase가 필요했는지, 무엇을 달성했는지.}</p>

<div class="meta-grid">
  <div class="meta-card">
    <div class="label">Phase ID</div>
    <div class="value">phase-{N}</div>
  </div>
  <div class="meta-card">
    <div class="label">완료 날짜</div>
    <div class="value">{YYYY-MM-DD}</div>
  </div>
  <div class="meta-card">
    <div class="label">Spec 수</div>
    <div class="value">{N}개 완료</div>
  </div>
  <div class="meta-card">
    <div class="label">상태</div>
    <div class="value"><span class="badge badge-done">✓ 완료</span></div>
  </div>
</div>

<!-- 섹션 2: 스펙 타임라인 SVG -->
<h2>🗓 작업 타임라인</h2>
<div class="diagram-box">
  <div class="diagram-title">Spec 진행 순서</div>
  <!--
    SVG 생성 지침:
    - 수평 타임라인 (좌→우)
    - 각 Spec을 원형 노드 + 카드 박스로 표현
    - 노드 색상: 완료 = #27ae60, 진행중 = #f39c12
    - 카드에 Spec ID, 제목, 한 줄 설명 표시
    - 전체 너비: 900~1000px, 높이: 200~280px
    - viewBox로 반응형 처리
    예시 구조:
    <svg viewBox="0 0 960 220" xmlns="http://www.w3.org/2000/svg">
      <line x1="80" y1="110" x2="880" y2="110" stroke="#ccc" stroke-width="3"/>
      <!-- spec 노드 반복 -->
      <circle cx="160" cy="110" r="18" fill="#27ae60"/>
      <text x="160" y="115" text-anchor="middle" fill="white" font-size="12">01</text>
      <rect x="100" y="140" width="130" height="60" rx="8" fill="white" stroke="#27ae60"/>
      <text x="165" y="158" text-anchor="middle" font-size="11" fill="#333">spec-01-01</text>
      <text x="165" y="175" text-anchor="middle" font-size="10" fill="#666">Spec 제목</text>
      ...
    </svg>
    실제 Phase 내용을 기반으로 Spec 수와 제목에 맞게 노드를 배치할 것.
  -->
  <svg viewBox="0 0 960 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:960px">
    {에이전트가 실제 Spec 목록 기반으로 타임라인 SVG 생성}
  </svg>
</div>

<!-- 섹션 3: 아키텍처 컴포넌트 SVG -->
<h2>🏗 아키텍처 컴포넌트</h2>
<div class="diagram-box">
  <div class="diagram-title">Phase에서 도입·수정된 컴포넌트</div>
  <!--
    SVG 생성 지침:
    - 박스(rect)+화살표(line/path)로 컴포넌트 관계 표현
    - 레이어 구분: 프론트엔드 / 백엔드 / DB / 외부서비스
    - 각 레이어를 배경색으로 구분 (연한 파스텔)
    - 신규 컴포넌트: 초록색 테두리, 기존 수정: 주황색 테두리
    - 화살표에 라벨 (예: "API 호출", "SQL 쿼리", "임베딩 요청")
    - 전체 너비: 900~1000px, 높이: 320~420px
    실제 Phase에서 도입한 컴포넌트(파일, 모듈, 서비스)를 기반으로 작성할 것.
  -->
  <svg viewBox="0 0 960 380" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:960px">
    {에이전트가 실제 컴포넌트 구조 기반으로 아키텍처 SVG 생성}
  </svg>
</div>

<!-- 섹션 4: 데이터 플로우 SVG -->
<h2>🔄 데이터 흐름</h2>
<div class="diagram-box">
  <div class="diagram-title">핵심 데이터 처리 경로</div>
  <!--
    SVG 생성 지침:
    - 좌→우 흐름: 입력 → 처리 단계들 → 저장/출력
    - 각 단계를 둥근 사각형(rx=10)으로 표현
    - 화살표(→)에 데이터 형태 라벨 (예: "성경 구절 텍스트", "임베딩 벡터", "JSON 응답")
    - 색상 코딩: 입력=파랑, 처리=보라, 저장=초록, 출력=주황
    - 전체 너비: 900~1000px, 높이: 160~220px
    실제 Phase의 데이터 처리 흐름을 기반으로 작성할 것.
  -->
  <svg viewBox="0 0 960 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:960px">
    {에이전트가 실제 데이터 흐름 기반으로 플로우 SVG 생성}
  </svg>
</div>

<!-- 섹션 5: Spec별 요약 카드 -->
<h2>📦 Spec별 작업 요약</h2>
<div class="spec-cards">
  <!-- 각 Spec마다 아래 카드를 반복 -->
  {에이전트가 각 spec.md + walkthrough.md 기반으로 카드 생성}
  <!--
  <div class="spec-card">
    <div class="spec-id">spec-{N}-{seq}-{slug}</div>
    <h3>{Spec 한글 제목}</h3>
    <p class="desc">{무엇을 했는지 2~3문장. 신입 개발자가 읽어도 이해할 수 있는 수준.}</p>
    <p><strong>주요 결정:</strong> {walkthrough.md에서 핵심 결정 1~2개}</p>
    <p><strong>핵심 파일:</strong> <code>{주요 파일 경로}</code></p>
  </div>
  -->
</div>

<!-- 섹션 6: 핵심 결정 모음 -->
<h2>🧠 핵심 결정 사항</h2>
<p>이 Phase에서 내린 중요한 기술적 결정들입니다. 왜 이렇게 결정했는지 이해하면 코드 수정 시 실수를 줄일 수 있습니다.</p>
<table class="decision-table">
  <tr>
    <th>결정</th>
    <th>선택한 방향</th>
    <th>이유</th>
    <th>출처 Spec</th>
  </tr>
  <!-- walkthrough.md들에서 핵심 결정 추출 -->
  {에이전트가 walkthrough.md 기반으로 결정 행 생성}
  <!--
  <tr>
    <td>{결정 주제}</td>
    <td>{선택한 방향}</td>
    <td>{이유 한 줄}</td>
    <td>spec-{N}-{seq}</td>
  </tr>
  -->
</table>

<!-- 섹션 7: 신입 개발자를 위한 시작 가이드 -->
<h2>🚀 여기서부터 시작하세요</h2>
<div class="start-box">
  <h3>이 Phase를 이해하기 위한 핵심 파일</h3>
  <ul class="file-list">
    <!-- spec.md들에서 핵심 파일 추출 -->
    {에이전트가 핵심 파일 목록 생성}
  </ul>

  <h3 style="margin-top:1.5rem">로컬 실행 방법</h3>
  <p>{Phase의 주요 기능을 로컬에서 직접 실행해볼 수 있는 단계별 명령}</p>
  <!--
  <ol>
    <li>의존성 설치: <code>pnpm install</code></li>
    <li>환경 변수 설정: <code>cp .env.example .env.local</code></li>
    <li>실행: <code>pnpm dev</code></li>
    <li>테스트: <code>pnpm test</code></li>
  </ol>
  -->
  {에이전트가 실제 프로젝트의 실행 명령 기반으로 작성}

  <h3 style="margin-top:1.5rem">이 Phase를 더 깊이 이해하려면</h3>
  <ul>
    <li>Phase 정의: <code>backlog/phase-{N}.md</code></li>
    <li>각 Spec 상세: <code>specs/spec-{N}-*/spec.md</code></li>
    <li>결정 로그: <code>specs/spec-{N}-*/walkthrough.md</code></li>
  </ul>
</div>

<footer>
  생성: /hk-phase-doc | Phase {N} 완료 | harness-kit {kitVersion}
</footer>

</body>
</html>
```

## 5. 완료 보고

HTML 생성 후 다음 형식으로 보고합니다:

```
✅ 핸드오버 문서 생성 완료

  📄 docs/phase-{N}-handover.html
  📊 SVG 다이어그램: 스펙 타임라인 · 아키텍처 컴포넌트 · 데이터 플로우
  📦 포함 Spec: {N}개

브라우저에서 열어 확인하세요.
```

## 주의 사항

- **placeholder 금지**: SVG 주석 안의 `{에이전트가 ... 생성}` 텍스트는 실제 내용으로 반드시 대체해야 합니다. 주석을 그대로 남겨두거나 dummy 텍스트를 넣지 마세요.
- **자기완결 HTML**: `<link>`, `<script src>`, 외부 이미지 URL 사용 금지. 모든 스타일은 `<style>` 안에, 모든 다이어그램은 인라인 SVG로.
- **한국어 우선**: 모든 설명 텍스트는 한국어. 코드, 파일 경로, 기술 용어(예: "embedding", "vector")는 영어 허용.
- **신입 개발자 관점**: 문서를 읽는 사람이 이 프로젝트를 처음 보는 개발자라고 가정하고 작성합니다. 배경지식 없이도 이해할 수 있도록 충분한 설명을 제공하세요.
