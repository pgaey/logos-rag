# feat(spec-02-03): add POST /api/search route handler

## 📋 Summary

### 배경 및 목적
검색+프롬프트 조립 흐름을 CLI 뿐 아니라 HTTP API 로도 접근 가능하게 만들어 phase-03 UI 개발을 위한 엔드포인트를 미리 확보합니다. LLM 호출 없이 `{ verses, prompt }` 를 반환하는 임시 API route 입니다.

### 주요 변경 사항
- [x] `app/api/search/route.ts` — `POST /api/search` Route Handler 구현
- [x] 입력 검증: 빈 question → 400, k 범위 1~10 클램프
- [x] 응답: `{ verses: VerseMatch[], prompt: string }` JSON

### Phase 컨텍스트
- **Phase**: `phase-02` (search-prompt)
- **본 SPEC 의 역할**: phase-02 마지막 Spec. phase-02 성공 기준 4번 충족 + phase-03 UI 연동 준비 완료.

## 🎯 Key Review Points

1. **네이티브 Web API 사용**: `NextResponse` 대신 `Response.json()` 사용. Next.js 16 Route Handler 문서 권장 패턴.
2. **에러 처리**: JSON 파싱 실패(400) / 빈 question(400) / 내부 오류(500) 세 케이스 분리.

## 🧪 Verification

### 자동 테스트
```bash
pnpm test
```
**결과**: ✅ 3/3 PASS

### 통합 테스트
```bash
# dev 서버 실행 후
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"question":"천지창조에 대해 알려줘","k":3}'
# → 200: { "verses": [...3건...], "prompt": "..." }

curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"question":""}'
# → 400: { "error": "question is required" }
```
**결과**: ✅ 200 + 400 모두 PASS

### 수동 검증 시나리오
1. `pnpm build` → Route (app) 에 `ƒ /api/search` 동적 라우트 등록 확인

## 📦 Files Changed

### 🆕 New Files
- `app/api/search/route.ts`: POST /api/search Route Handler (32줄)

**Total**: 1 file changed

## ✅ Definition of Done

- [x] 모든 단위 테스트 통과 (3/3)
- [x] 통합 테스트 통과 (curl 200 + 400 PASS)
- [x] `walkthrough.md` ship commit 완료
- [x] `pr_description.md` ship commit 완료
- [x] `pnpm build` 성공
- [x] 사용자 검토 요청 알림 완료

## 🔗 관련 자료

- Phase: `backlog/phase-02.md`
- Walkthrough: `specs/spec-02-03-search-api-route/walkthrough.md`
- 이월: phase-03 에서 LLM 호출 추가 예정
