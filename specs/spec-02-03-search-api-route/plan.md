# Implementation Plan: spec-02-03

## 📋 Branch Strategy
- 신규 브랜치: `spec-02-03-search-api-route`
- 시작 지점: `phase-02-search-prompt` (spec-02-02 머지 후 분기)
- 첫 task 가 브랜치 생성을 수행함

## 🛑 사용자 검토 필요 (User Review Required)

> [!IMPORTANT]
> - [ ] **spec-02-02 머지 선행 필수**: `spec-02-02-search-cli` 가 `phase-02-search-prompt` 에 머지된 후 시작.
> - [ ] **Next.js Route Handler API**: `node_modules/next/dist/docs/` 의 실제 문서 확인 후 작성. 학습 버전(Next.js 16.2.6)은 기존 지식과 다를 수 있음.

> [!WARNING]
> - [ ] `app/api/` 경로 신규 생성 — 기존 `app/` 구조와 충돌 없음

## 🎯 핵심 전략 (Core Strategy)

### 주요 결정

| 컴포넌트 | 전략 | 이유 |
|:---:|:---|:---|
| **Route Handler** | `app/api/search/route.ts` — `export async function POST(req: Request)` | Next.js App Router 표준. Pages Router 사용 안 함 |
| **입력 파싱** | `req.json()` — `{ question, k }` 구조분해 | 단순 JSON body |
| **오류 처리** | `NextResponse.json({ error }, { status: 400/500 })` | 클라이언트 친화적 에러 |

### 📑 ADR 후보
- [x] 없음

## 📂 Proposed Changes

### [API Route]

#### [NEW] `app/api/search/route.ts`
```typescript
// POST /api/search
// body: { question: string, k?: number }
// response 200: { verses: VerseMatch[], prompt: string }
// response 400: { error: string }
// response 500: { error: string }
//
// 구현 순서:
// 1. req.json() 파싱
// 2. question 유효성 검사 (빈값 → 400)
// 3. k = Math.min(body.k ?? 5, 10)
// 4. searchVerses(question, k) 호출
// 5. buildPrompt(question, verses) 호출
// 6. NextResponse.json({ verses, prompt }) 반환
```

## 🧪 검증 계획 (Verification Plan)

### 수동 검증 시나리오
```bash
# Next.js dev 서버 실행 중
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"question":"천지창조에 대해 알려줘","k":3}'
# 기대: { "verses": [...3건...], "prompt": "..." }

curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"question":""}'
# 기대: { "error": "question is required" } + 400
```

### 통합 테스트 (Integration Test Required = yes)
```bash
# dev 서버 실행 후 위 curl 명령으로 스모크 테스트
```

## 🔁 Rollback Plan
- 신규 파일만 추가 — `app/api/search/route.ts` 삭제로 롤백 가능

## 📦 Deliverables 체크
- [ ] task.md 작성
- [ ] 사용자 Plan Accept 받음
- [ ] (실행 후) 모든 task 완료
- [ ] (실행 후) walkthrough.md / pr_description.md ship
