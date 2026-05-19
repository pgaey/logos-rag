# Walkthrough: spec-01-02

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

> **스코프 주의**: 본 spec 은 데이터 적재 전용. DB·임베딩·검색은 spec-01-03 ~ 05 의 책임 (out of scope).

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 번역본 | KJV / WEB | **WEB** | 현대 영어 — 임베딩 모델 친화적. 한국어 cross-lingual 매칭 정확도 ↑. 모두 public domain 이라 라이선스 동일 |
| 데이터 git 추적 | commit / gitignored + fetch | **commit** | 6.6MB 라 부담 없음. clone 즉시 사용 가능, 출처 의존성 제거, 재현성 ↑ |
| 정규화 형식 | 평면 배열 / book별 분할 / nested | **평면 배열** `[{book, chapter, verse, text}]` | 적재·검색·디버깅 모두 단순. 31k row 메모리 부담 없음 |
| 출처 repo | gratis-bible/bible / wldeh/bible-api / ebible.org | **gratis-bible/bible** (`en/web.xml`) | 후보 3개 실측 비교: A=깔끔 OSIS XML 단일 5.2MB, B=각주 본문 오염 (`"God1:1 The Hebrew word..."`), C=paragraph 형식 (verse 분리 불가). A 압도적 |
| XML 파싱 라이브러리 | `fast-xml-parser` / `xml2js` / 직접 정규식 | **`fast-xml-parser`** | 한 번에 트리 변환, 의존성 1개, TS friendly. 직접 파싱은 OSIS 스펙 복잡도 대비 비효율 |
| 검증 위치 | fetch 스크립트 내장 / 별도 verify 스크립트 | **내장** | spec 범위 최소. 책 66 / verse count / NULL count 만 체크하면 충분 |
| Sonnet 버그 처리 | amend / 별도 fix commit | **별도 `fix(spec-01-02)` commit** | Constitution §9 no-amend. "시도→실패→수정" history 가 미래 디버깅에 정보 ↑ |

## 💬 사용자 협의

- **주제**: 번역본 선택 (KJV vs WEB)
  - **사용자 의견**: WEB (권장 그대로 수용)
  - **합의**: 현대 영어가 임베딩 매칭에 유리하다는 reasoning 수용. KJV 의 "고전 인상" 보다 RAG 정확도 우선.

- **주제**: 데이터 git 추적 + JSON 형식
  - **사용자 의견**: 둘 다 권장 수용 (commit + 평면 배열)
  - **합의**: 단순성·재현성 우선.

- **주제**: 출처 후보 결정
  - **사용자 의견**: A 채택 (sub-agent 비교 결과 후 즉시 승인)
  - **합의**: A 단점 없음. B/C 는 실측 결함 있어 자동 탈락.

- **주제**: Sonnet 코드 첫 실행 시 0 verse 파싱 버그
  - **사용자 의견**: (자동 디버깅으로 진행, 별도 사용자 결정 없었음)
  - **합의**: 메인 Opus 가 두 버그 (`isArray: () => false` + 무조건 return) 발견·즉시 수정. 별도 commit 으로 history 보존.

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: 본 spec 도 단위 테스트 러너 미도입 — fetch 스크립트의 self-check (책/verse/NULL count) 로 갈음
- **결과**: N/A

#### 통합 테스트 (Integration Test Required = yes)
- **명령**: `pnpm fetch:bible`
- **결과**: ✅ Passed
- **로그 요약**:
```text
[fetch:bible] fetching from https://raw.githubusercontent.com/gratis-bible/bible/master/en/web.xml...
[fetch:bible] parsed 31102 verses across 66 books
[fetch:bible] writing data/web-bible.json (6595522 bytes)
[fetch:bible] books: 66
[fetch:bible] verses: 31102
[fetch:bible] empty/null text: 0
[fetch:bible] done.
```

### 2. 수동 검증

1. **Action**: `jq '.[0]' data/web-bible.json`
   - **Result**: ✅ `{book: "Genesis", chapter: 1, verse: 1, text: "In the beginning God created the heavens and the earth."}` — 정경 첫 verse 일치
2. **Action**: `jq '.[-1]' data/web-bible.json`
   - **Result**: ✅ `{book: "Revelation", chapter: 22, verse: 21, text: "The grace of the Lord Jesus be with all the saints. Amen."}` — 정경 마지막 verse 일치
3. **Action**: `jq '.[] | select(.book=="John" and .chapter==3 and .verse==16)' data/web-bible.json`
   - **Result**: ✅ "For God so loved the world..." 표본 verse 정확 (WEB 표현)
4. **Action**: `pnpm fetch:bible` 재실행 후 `git diff --stat data/web-bible.json`
   - **Result**: ✅ diff 0건 — **결정성 (deterministic) 확인**
5. **Action**: `pnpm exec tsc --noEmit`
   - **Result**: ✅ 타입 에러 0건
6. **Action**: `pnpm lint`
   - **Result**: ✅ ESLint 0건

## 🔍 발견 사항

- **gratis-bible/bible 의 XML 인코딩**: 일부 verse 텍스트에 backtick (`) 가 apostrophe 자리에 등장 (예: `God\`s Spirit`). WEB 원본의 인코딩 특성으로 보임. RAG 검색 품질에 미미한 영향. 필요 시 후속 spec 에서 정제.
- **verse 수 31,102** : Protestant canon 표준 ~31,103 과 1건 차이. gratis-bible/bible 의 WEB 판본 특성 (예: 일부 verse 가 다른 verse 와 통합) — 정상 범위. 누락 X.
- **fast-xml-parser `isArray` 기본값 함정**: 옵션 미지정 시 multiple siblings 자동 array 변환되지만, 명시적으로 `isArray: () => false` 를 주면 모든 element 가 단일 객체화 → 형제 데이터 손실. Sonnet 초안이 이 함정에 빠짐. 향후 XML 파서 사용 시 element 별 명시적 array 마킹 권장.
- **OSIS XML 의 중첩 osisID**: `<div osisID="Gen">` / `<chapter osisID="Gen.1">` / `<verse osisID="Gen.1.1">` 모두 osisID 속성 보유. 단순 "osisID 있으면 verse" 가정 시 책/장에서 멈춰 자식 verse 로 못 내려감. **3-part 만 verse, 1/2-part 면 컨테이너** 로 구분 필요.
- **결정성 (determinism)**: 같은 출처·같은 코드 → byte-identical JSON. `JSON.stringify(arr, null, 2)` + 객체 리터럴 키 순서 고정 + sort 만으로 충분. SHA-256 비교 없이도 `git diff` 가 보장.

## 🚧 이월 항목

- **WEB 원본의 ` ` ` (backtick) 정제**: 검색 품질 영향 시 후속 spec 또는 spec-x 에서. 현재는 무시.
- **JSON 압축 (gzip) 검토**: 6.6MB → ~1MB 로 줄어들 가능성. 단, git 으로 추적할 거면 무손실 압축이 diff 깨뜨림 = 비추. 현재 유지.
- **출처 변경 감지 자동화**: 출처 repo 가 업데이트되면 어떻게 알지? 현재는 수동 재실행 + git diff 로만 감지. 별도 spec 후보.

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent (Opus 4.7 메인 + Sonnet sub-agent for fetch 스크립트 + README) + @pgaey |
| **작성 기간** | 2026-05-17 |
| **최종 commit** | ship commit 시 갱신 |
