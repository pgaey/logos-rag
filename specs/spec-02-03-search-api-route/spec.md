# spec-02-03: 검색·프롬프트 API Route

## 📋 메타
| 항목 | 값 |
|---|---|
| **Spec ID** | `spec-02-03` |
| **Phase** | `phase-02` |
| **Branch** | `spec-02-03-search-api-route` |
| **상태** | Planning |
| **타입** | Feature |
| **Integration Test Required** | yes |
| **작성일** | 2026-05-19 |
| **소유자** | @pgaey |

## 📋 배경 및 문제 정의

### 현재 상황
spec-02-01·02 로 `buildPrompt()` 함수와 CLI 스크립트가 완성되어 콘솔에서 검색+프롬프트 조립 흐름을 확인할 수 있다.
그러나 phase-03 에서 UI + LLM 통합을 시작하려면 HTTP API 엔드포인트가 필요하다.

### 문제점
CLI 스크립트만으로는 Next.js 프론트엔드에서 검색 결과를 받아올 방법이 없다. phase-03 UI 개발 시작 전에 API route 가 준비되어 있어야 한다.

### 해결 방안 (요약)
Next.js App Router Route Handler 로 `POST /api/search` 를 구현한다. LLM 호출 없이 검색 + 프롬프트 조립 결과를 JSON 으로 반환하며, phase-03 에서 LLM 호출을 추가할 예정이다.

## 📊 개념도

(생략)

## 🎯 요구사항

### Functional Requirements
1. `POST /api/search` — body: `{ question: string, k?: number }` → response: `{ verses: VerseMatch[], prompt: string }`
2. `question` 이 빈 문자열이면 400 Bad Request 반환 (`{ error: "question is required" }`)
3. `k` 기본값 5, 최대 10 제한
4. LLM 을 호출하지 않는다

### Non-Functional Requirements
1. Next.js App Router Route Handler 문서 기준으로 구현 (`node_modules/next/dist/docs/` 확인 필수)
2. TypeScript strict 모드 호환
3. 서버 사이드 전용 (`createServerSupabase` 사용)

## 🚫 Out of Scope
- LLM 호출 (phase-03)
- 인증·권한 (phase-03)
- CORS 설정 (로컬 개발만)
- 캐싱·rate limiting (phase-04)

## 📑 ADR 후보
- [x] 없음

## ✅ Definition of Done
- [ ] `POST /api/search` — 200 응답 + `{ verses, prompt }` JSON 반환
- [ ] 빈 question → 400 응답 확인
- [ ] `pnpm build` TypeScript 오류 없음
- [ ] `pnpm test` PASS
- [ ] `walkthrough.md` 와 `pr_description.md` 작성 및 ship commit
- [ ] `spec-02-03-search-api-route` 브랜치 push 완료
- [ ] 사용자 검토 요청 알림 완료
