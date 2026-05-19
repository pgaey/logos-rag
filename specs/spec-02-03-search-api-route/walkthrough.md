# Walkthrough: spec-02-03

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| Response API | `NextResponse.json()` / `Response.json()` | **`Response.json()`** | Next.js 16 Route Handler 문서가 네이티브 Web API 사용을 권장. `NextResponse` 는 고급 기능(쿠키·리다이렉트) 필요 시만 도입 |
| k 값 범위 제한 | 없음 / max 10 / max 20 | **max 10** | 무제한 허용 시 Supabase 과부하 가능. 10이면 프롬프트 크기 관리 가능 범위 |
| 에러 타입 구분 | 단일 500 / 400+500 분리 | **400(검증)+500(내부) 분리** | 클라이언트가 잘못된 입력과 서버 오류를 구분 가능해야 phase-03 UI에서 적절한 메시지 표시 가능 |

### ADR 승격 가이드

- [x] 없음

## 💬 사용자 협의

- **주제**: phase-02 Spec 구성 확인
  - **사용자 의견**: "응 그렇게 해" — 3 Spec 구성(prompt-template / search-cli / search-api-route) 동의
  - **합의**: LLM 없이 검색+프롬프트 조립까지만 구현, LLM 호출은 phase-03에서 추가

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: `pnpm test`
- **결과**: ✅ Passed (3 tests in 163ms)

#### 통합 테스트 (Integration Test Required = yes)
- **명령**: curl 스모크 테스트 (dev 서버 기동 후)
- **결과**: ✅ 200 + 400 모두 PASS
- **로그 요약**:
```text
POST {"question":"천지창조에 대해 알려줘","k":3}
→ 200: verses 3건, prompt_len 628, first_book Genesis

POST {"question":""}
→ 400: {"error":"question is required"}
```

### 2. 수동 검증

1. **Action**: `pnpm build`
   - **Result**: TypeScript 컴파일 성공. Route (app) 에 `ƒ /api/search` (Dynamic) 등록 확인

## 🔍 발견 사항

- Next.js App Router Route Handler 는 네이티브 `Request`/`Response` Web API 를 그대로 사용
- 개발 서버 없이 `pnpm build` 만으로 타입 오류와 라우트 등록 여부를 확인 가능

## 🚧 이월 항목

- phase-03 에서 이 route 에 Gemini Flash LLM 호출 추가 필요 (`POST /api/search` → `{ answer, verses }` 형태로 확장 예정)

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent + @pgaey |
| **작성 기간** | 2026-05-19 |
| **최종 commit** | `9f0b7d1` |
