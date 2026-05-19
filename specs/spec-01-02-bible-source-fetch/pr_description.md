# feat(spec-01-02): WEB bible 원문 fetch + 정규화

## 📋 Summary

### 배경 및 목적
phase-01 의 후속 spec (`spec-01-03` 스키마, `spec-01-04` 임베딩 적재, `spec-01-05` 검색 검증) 이 모두 영문 원문에 의존합니다. 원본 텍스트와 그 정규화 형식이 한 곳에 commit 되어 있지 않으면 후속 spec 들이 각자 추정한 형태로 작성돼 데이터 형식 충돌이 생깁니다. 본 spec 은 그 데이터 토대를 세우고 결정성 있는 재생성 절차를 제공합니다.

### 주요 변경 사항
- [x] WEB (World English Bible, 100% public domain) 원문을 `gratis-bible/bible` OSIS XML 에서 fetch
- [x] `[{book, chapter, verse, text}, ...]` 평면 JSON 배열로 정규화 (key 순서 고정, 2-space indent, canonical order 정렬)
- [x] **결정성 보장**: 같은 출처 + 같은 코드 → byte-identical JSON. 재실행 후 git diff 0건 확인
- [x] `data/web-bible.json` (6.6MB, 31,102 verse, 66 books) commit
- [x] `scripts/fetch-bible.ts` + `pnpm fetch:bible` 명령 — 재현 가능
- [x] README 라이선스·셋업·스크립트 섹션 갱신 (KJV placeholder → WEB 출처 명시)

### Phase 컨텍스트
- **Phase**: `phase-01` (data-pipeline, base branch 모드 → develop)
- **본 SPEC 의 역할**: phase-01 의 두 번째 spec. spec-01-01 (인프라) 위에 **데이터 자산** 을 올림. 후속 spec-01-03/04 가 이 JSON 을 입력으로 받음.

## 🎯 Key Review Points

1. **출처 선정 reasoning** (`scripts/fetch-bible.ts` + walkthrough §결정 기록)
   - 후보 3개 실측 비교 후 `gratis-bible/bible` 선택. 탈락 사유: `wldeh/bible-api` (각주 본문 오염), `ebible.org readaloud` (verse 분리 불가)
   - 단일 OSIS XML 5.2MB, 의존성 `fast-xml-parser` 1개로 단순 파싱
   - 라이선스: 출처 `<rights>` 태그에 "We believe that this Bible is found in the Public Domain" 명시

2. **OSIS XML 파싱 정확성** (`scripts/fetch-bible.ts`)
   - OSIS 의 중첩 osisID 함정: `<div osisID="Gen">`, `<chapter osisID="Gen.1">`, `<verse osisID="Gen.1.1">` 모두 osisID 속성 보유. **3-part 만 verse, 1/2-part 는 컨테이너** 로 구분
   - `fast-xml-parser` 의 `isArray` 옵션: 명시적으로 `div`/`chapter`/`verse` 만 array 로 묶도록 설정 (default 사용 시 형제 다수가 단일 객체로 덮어써짐)
   - Sonnet 초안에 두 버그 (위 두 가지) 가 있었고 별도 fix commit (`a966d6c`) 으로 수정 — walkthrough §결정 기록·발견 사항 참조

3. **결정성 (determinism)**
   - JSON 키 순서 고정 (`book, chapter, verse, text`) + canonical sort + 2-space indent → 동일 입력에 byte-identical 출력
   - 검증: `pnpm fetch:bible` 재실행 후 `git diff --stat data/web-bible.json` = 0
   - 출처 변경 감지 가능 (git diff 가 출처 변경을 자동 노출)

4. **검증 자동화 (self-check)**
   - fetch 스크립트가 책 수 / verse 수 / NULL 수 출력. 책 ≠ 66 또는 NULL > 0 시 `process.exit(1)`
   - Vitest 등 별도 러너 없이 spec 의 통합 테스트 역할 수행

## 🧪 Verification

### 자동 테스트
```bash
pnpm exec tsc --noEmit   # 타입 에러 0건
pnpm lint                # ESLint 0건
```

### 통합 테스트
```bash
pnpm fetch:bible
```
**결과**:
- ✅ `books: 66`
- ✅ `verses: 31,102` (Protestant canon 표준 ~31,103, gratis-bible/bible 의 WEB 판본 1건 차이 — 정상 범위)
- ✅ `empty/null text: 0`
- ✅ `data/web-bible.json` 6,595,522 bytes (~6.6MB)

### 수동 검증 시나리오
1. **첫 verse** → `jq '.[0]'` → Genesis 1:1 "In the beginning God created the heavens and the earth." ✓
2. **마지막 verse** → `jq '.[-1]'` → Revelation 22:21 "The grace of the Lord Jesus be with all the saints. Amen." ✓
3. **John 3:16 표본** → `jq '.[] | select(.book=="John" and .chapter==3 and .verse==16)'` → "For God so loved the world..." (WEB 표현) ✓
4. **결정성 재실행** → `pnpm fetch:bible` 2회 → `git diff data/web-bible.json` = 0 ✓

## 📦 Files Changed

### 🆕 New Files
- `specs/spec-01-02-bible-source-fetch/{spec,plan,task,walkthrough,pr_description}.md`: 본 spec 5종 산출물
- `scripts/fetch-bible.ts`: WEB OSIS XML → 평면 JSON 정규화 스크립트
- `data/web-bible.json`: WEB 31,102 verse 정규화 산출물 (6.6MB)

### 🛠 Modified Files
- `package.json`: `fast-xml-parser` 의존성 + `fetch:bible` npm script
- `pnpm-lock.yaml`: 위 잠금
- `README.md`: 라이선스 (KJV placeholder → WEB 출처 명시), 셋업 (`pnpm fetch:bible` 단계 추가), 스크립트 표 (행 추가)
- `backlog/phase-01.md`: spec-01-02 자동 등록 (sdd)
- `backlog/queue.md`: 진행 상태 갱신 (sdd)

### 🗑 Deleted Files
없음

**Total**: 본 PR 의 진단 (`git diff --stat phase-01-data-pipeline...HEAD`) 으로 최종 확인.

## ✅ Definition of Done

- [x] `pnpm fetch:bible` PASS (책 66 / verse 31,102 / NULL 0)
- [x] `pnpm exec tsc --noEmit` PASS
- [x] `pnpm lint` PASS
- [x] 첫·마지막 verse + John 3:16 표본 수동 확인
- [x] 결정성 (재실행 후 git diff 0)
- [x] `walkthrough.md` ship commit
- [x] `pr_description.md` ship commit
- [x] 브랜치 push 완료 (`spec-01-02-bible-source-fetch` → `phase-01-data-pipeline`)
- [ ] 사용자 PR 머지

## 🔗 관련 자료

- Phase: `backlog/phase-01.md`
- Spec: `specs/spec-01-02-bible-source-fetch/spec.md`
- Plan: `specs/spec-01-02-bible-source-fetch/plan.md`
- Task: `specs/spec-01-02-bible-source-fetch/task.md`
- Walkthrough: `specs/spec-01-02-bible-source-fetch/walkthrough.md`
- 선행 PR (spec-01-01): `#1` (이미 머지됨)
