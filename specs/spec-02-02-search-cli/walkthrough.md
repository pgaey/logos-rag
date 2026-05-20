# Walkthrough: spec-02-02

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| eval-prompt 리포트에 프롬프트 포함 여부 | 전문 포함 / 앞 300자만 | **앞 300자 요약 포함** | 전문은 리포트가 너무 길어짐. 300자면 구조 확인에 충분 |
| eval:prompt 평가 대상 | EN + KO / KO만 | **KO만** | EN은 phase-01 eval:search에서 이미 100% 검증. phase-02 Done 기준은 KO ≥ 60% |
| CLI verse 출력 형식 | 단순 텍스트 / 표 형태 | **박스형 표** | 가독성이 높고 book/ch/v/similarity를 한눈에 확인 가능 |

### ADR 승격 가이드

- [x] 없음

## 💬 사용자 협의

- **주제**: spec-02-02/03 병렬 문서 작성
  - **사용자 의견**: "만드는거랑 문서 작업을 각각 에이전트로 시켜" — HTML 생성과 spec 문서를 병렬로 준비
  - **합의**: 두 에이전트가 동시 작성, 사전 준비된 spec/plan/task 활용

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: `pnpm test`
- **결과**: ✅ Passed (3 tests in 164ms)

#### 통합 테스트 (Integration Test Required = yes)
- **명령**: `pnpm eval:prompt`
- **결과**: ✅ KO: 5/5 (100%) PASS
- **로그 요약**:
```text
[eval:prompt] [EXACT] "태초에 하나님이 천지를 창조하셨다"
[eval:prompt] [EXACT] "가인이 들에서 동생 아벨을 죽였다"
[eval:prompt] [HIT] "노아의 방주와 대홍수"
[eval:prompt] [EXACT] "야곱이 사다리 꿈을 꾸었다"
[eval:prompt] [HIT] "아브라함이 이삭을 제물로 바치려 했다"
[eval:prompt] KO: 5/5 (100%) ✅ PASS
```

### 2. 수동 검증

1. **Action**: `pnpm build`
   - **Result**: TypeScript 컴파일 성공

## 🔍 발견 사항

- `pnpm eval:prompt` 가 100% 달성 — phase-02 Done 조건 시나리오 1 충족
- `buildPrompt` 와 `searchVerses` 의 조합이 안정적으로 동작함을 end-to-end 로 확인

## 🚧 이월 항목

없음

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent + @pgaey |
| **작성 기간** | 2026-05-19 |
| **최종 commit** | `e3ebd72` |
