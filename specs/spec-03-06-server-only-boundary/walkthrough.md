# Walkthrough: spec-03-06

> 구현 완료 후 결정 기록 + 변경 요약. 리뷰어가 이 문서만 읽고도 의도·범위를 이해할 수 있어야 한다.

## 📋 메타

| 항목 | 값 |
|---|---|
| **Spec ID** | `spec-03-06` |
| **Branch** | `spec-03-06-server-only-boundary` |
| **상태** | Shipped |
| **작성일** | 2026-06-01 |

## 🎯 무엇을 / 왜 (What & Why)

spec-03-04 리뷰 중 두 가지가 드러났다: (1) `askQuestion`의 인증 주석("보조/다층방어")이 책임 소재를 오도, (2) 시크릿 다루는 `lib/**` 모듈이 "관습적 서버 전용"일 뿐 컴파일 강제가 없음. Next.js 공식 문서(context7)는 Server Action을 독립 진입점으로 보고 자체 인증을 요구하며, 시크릿 모듈을 `server-only` DAL로 격리하길 권장한다. 이 spec은 `import 'server-only'`로 브라우저 유입을 빌드 단계에서 차단하고, 인증 주석을 공식 근거로 교정한다. 사용자의 "입구 통제, 관리 영역 축소" 원칙을 코드로 박는 작업.

## 📦 변경 사항 (Changes)

| 파일 | 변경 | 설명 |
|---|---|---|
| `package.json` / `pnpm-lock.yaml` | 수정 | `server-only ^0.0.1` 추가 |
| `src/lib/supabase/admin.ts` | +1 | `import 'server-only'` (SUPABASE_SECRET_KEY) |
| `src/lib/llm/gemini.ts` | +1 | `import 'server-only'` (GEMINI_API_KEY) |
| `src/lib/search/cosine.ts` | +1 | `import 'server-only'` |
| `src/lib/auth/guard.ts` | +1 | `import 'server-only'` |
| `src/lib/supabase/server.ts` | +1 | `import 'server-only'` |
| `vitest.config.ts` | +5 | `server-only` → `empty.js` alias |
| `src/app/qa/actions.ts` | 주석 | 인증 책임 모델 교정 |

## 🔑 주요 결정 (Key Decisions)

- **server-only 대상 = 시크릿/서버전용 5개만.** admin(SECRET 최우선)·gemini(API키)·cosine·guard·server. template/types는 시크릿 없어 제외(범위 최소화).
- **`client.ts`는 명시적 제외.** `createBrowserClient` + NEXT_PUBLIC 키만 쓰는 브라우저 클라이언트라, server-only를 넣으면 빌드가 깨진다. (이름이 client라 헷갈리기 쉬운 함정 — 조사로 사전 확인.)
- **vitest에 `server-only` → `empty.js` alias.** server-only는 import 시 "클라이언트에서 못 씀" 에러를 던지는데, vitest node 환경이 이를 트리거해 27→3으로 깨졌다. 실제 가드는 `next build`가 수행하므로, 테스트 환경에선 패키지가 제공하는 빈 모듈(`empty.js`)로 치환. Next 공식 server-only 패턴의 표준 우회.
- **인증 주석 교정.** "proxy 주 게이트, 보조 확인" → "Server Action은 독립 진입점이라 자체 인증이 권위(Next.js 공식 문구 인용), proxy/페이지 redirect는 UX, requireUser는 DAL 레이어". requireUser 로직 자체는 불변.

## 🧪 테스트 / 검증 (Tests)

- `pnpm test` → **27/27 PASS** (alias 적용 후 회귀 없음)
- `tsc --noEmit` → clean
- `pnpm build` → **BUILD_EXIT 0** — server-only 선언이 정상 서버 경로를 깨지 않음 확인
- **가드 작동 증명(핵심)**: `login/page.tsx`(`'use client'`)에 `gemini`를 import+참조 → `pnpm build`가 다음 에러로 차단:
  > *"You're importing a module that depends on server-only... Client Component Browser: ./src/lib/llm/gemini.ts ← ./src/app/login/page.tsx"*
  
  → 차단(BUILD_EXIT 1) 확인 후 probe 완전 원복, clean build(0) 재확인. **client→시크릿모듈 import가 컴파일 단계에서 실제로 막힘이 입증됨.**

## ⚠ 발견 사항 / 이월 (Findings / Carry-over)

- **pnpm store drift**: `pnpm add` 가 store 경로 충돌(v11 ↔ v11/v10)로 한 번 막혔고, 사용자가 `pnpm install` 선행 후 해결. pnpm-lock이 재링크로 정규화되며 함께 변경됨(의도된 부수효과).
- **CLI 영향 없음**: `server-only`는 Next 번들러에서만 react-server 조건으로 throw하고, tsx(node) 직접 실행엔 무영향. `embed:bible` 등 스크립트 영향 없음.
- **spec-03-05(화면) park 상태**: 본 spec 시작 위해 잠시 보류. 머지 후 재개. (sdd 테이블에 05·06 둘 다 Active로 보이는 표시 이슈 있으나 기능 무관.)

## 🔗 관련 (References)

- 선행: spec-03-04(askQuestion — 주석 교정 대상)
- 후속: spec-03-05(qa-page-ui, park) — 이 경계 위에서 화면 작업 재개
- 근거: Next.js 공식 `use-server.mdx` / `data-security.mdx`(context7) — "separate entry point", DAL 패턴
- 메모리: project_auth_architecture
- ADR: 없음(향후 lib 구조 확장 시 `server-only-data-access-boundary` convention 승격 검토)
