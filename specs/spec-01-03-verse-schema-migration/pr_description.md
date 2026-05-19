# feat(spec-01-03): verses 스키마 + Supabase CLI 마이그레이션

## 📋 Summary

### 배경 및 목적
phase-01 의 다음 spec (`spec-01-04` 임베딩 적재) 이 31,102 개 verse 를 INSERT 하려면 받을 테이블이 존재해야 합니다. 본 spec 은 `verses` 테이블 + RLS + UNIQUE constraint 를 **버전관리 가능한 Supabase CLI 마이그레이션** 으로 적용하고, TypeScript generated types 로 컴파일 단계 안전망을 확보합니다.

### 주요 변경 사항
- [x] **Supabase CLI 워크스페이스 셋업** — `supabase/{config.toml, .gitignore, migrations/}`. `supabase link --project-ref qmxeysejsxwoofmvjtcv` 로 remote 프로젝트 연결
- [x] **`verses` 테이블 마이그레이션** — id(BIGSERIAL PK) + (book, chapter, verse, text, embedding(768d)) + UNIQUE(book, chapter, verse) + RLS ENABLE + 정책 0개
- [x] **`supabase db push` 적용 완료** — remote DB 에 verses 테이블 + RLS 적용 확인
- [x] **Generated TypeScript types** (`src/lib/db/types.ts`) — verses 테이블 타입 포함, 후속 spec 의 컴파일 안전망
- [x] **`pnpm check:supabase` 확장** — 기존 3단계(SELECT 1 + pgvector + verses) → 4단계로 확장. 한 명령으로 인프라 전체 점검
- [x] **README 셋업 가이드 갱신** — Supabase CLI 설치 + login + link + db push 단계 추가, 기존 단계 번호 재정렬

### Phase 컨텍스트
- **Phase**: `phase-01` (data-pipeline, base branch 모드 → develop)
- **본 SPEC 의 역할**: 인프라(01) ✓ → 데이터(02) ✓ → **스키마(03)** ← 본 PR → 적재(04) → 검증(05). spec-01-04 의 직전 단계, 적재 대상 테이블 마련.

## 🎯 Key Review Points

1. **`verses` 테이블 설계** (`supabase/migrations/20260517144458_create_verses.sql`)
   - **BIGSERIAL PK + UNIQUE(book, chapter, verse)** — 복합 PK 대신 surrogate key. INSERT/디버깅 친화 + 중복 차단 동일
   - **embedding NULL 허용** — 본 spec 은 스키마만, 적재는 spec-01-04. NOT NULL 시 빈 row 생성 불가
   - **`extensions.vector(768)`** — Supabase 는 pgvector 를 extensions 스키마에 둠. schema-qualified 가 강제 (DB push 첫 시도 실패로 확인)

2. **RLS 전략** (최소 권한)
   - `ENABLE ROW LEVEL SECURITY` + **정책 0개** = anon/publishable 키 접근 자동 차단
   - 서버 (secret key) 만 접근 가능 → spec-01-04 의 batch INSERT 도 secret key 기반 pg 직접 연결 사용
   - 향후 사용자 직접 SELECT 가 필요해지면 (즐겨찾기 등) 별도 spec 에서 정책 추가

3. **인덱스 의도적 부재** (불필요한 복잡성 경계)
   - 31k row × 768d brute force ~50ms 예상. spec-01-05 의 cosine 검증 결과 부족 시 별도 spec 에서 추가
   - 인덱스를 미리 만들면 (a) 적재 속도 ↓ (b) 메모리 ↑ (c) 검증 전 가설 적용

4. **Supabase CLI 도입 = 표준 워크플로 진입**
   - 본 spec 부터 마이그레이션·types 가 git history 에 남음 → 동료/CI 재현성 확보
   - 향후 모든 스키마 변경은 `supabase migration new` 로만 수행 (Dashboard 수동 변경 지양)

## 🧪 Verification

### 자동 테스트
```bash
pnpm exec tsc --noEmit   # generated types import 가능 + 타입 에러 0건
pnpm lint                # ESLint 0건
```

### 통합 테스트
```bash
pnpm check:supabase
```
**결과** (4단계):
- ✅ `SELECT 1`: PASS
- ✅ `pgvector extension`: PASS
- ✅ `verses table`: PASS  (← 본 PR 추가)
- ✅ `all checks passed`

### 수동 검증 시나리오
1. **db push 확인** → `supabase db push --include-all` → `Finished supabase db push` 메시지 확인 ✓
2. **types 안전망** → `src/lib/db/types.ts` 에 verses 타입 정의 포함, 컬럼 6개 (id, book, chapter, verse, text, embedding) 모두 ✓
3. **Dashboard 수동 확인** (선택) → Supabase Dashboard → Database → Tables → verses 보임 + RLS Enabled + Policies 0개

## 📦 Files Changed

### 🆕 New Files
- `specs/spec-01-03-verse-schema-migration/{spec,plan,task,walkthrough,pr_description}.md` — 본 spec 5종 산출물
- `supabase/config.toml` — Supabase CLI 프로젝트 설정 (project_id 로컬 식별자)
- `supabase/.gitignore` — `.temp/`, `.branches/`, `.env*.local` 등 제외
- `supabase/migrations/20260517144458_create_verses.sql` — verses 테이블 생성 + RLS
- `src/lib/db/types.ts` — Supabase CLI generated TypeScript types (verses 포함)

### 🛠 Modified Files
- `scripts/check-supabase.ts` — verses 테이블 + 컬럼 6개 검증 한 단계 추가
- `README.md` — 셋업 섹션에 CLI 설치 + login + link + db push 단계 추가, 기존 번호 재정렬
- `backlog/phase-01.md` — spec-01-03 자동 등록 (sdd)
- `backlog/queue.md` — 진행 상태 갱신 (sdd)

### 🗑 Deleted Files
없음

**Total**: 본 PR 의 진단 (`git diff --stat phase-01-data-pipeline...HEAD`) 으로 최종 확인.

## ✅ Definition of Done

- [x] `supabase/migrations/<ts>_create_verses.sql` commit + `supabase db push` 적용
- [x] `supabase/config.toml` commit
- [x] `src/lib/db/types.ts` commit (verses 타입 포함)
- [x] `pnpm check:supabase` 4단계 PASS
- [x] `pnpm exec tsc --noEmit` PASS
- [x] `pnpm lint` PASS
- [x] README 셋업 가이드 갱신
- [x] `walkthrough.md` 와 `pr_description.md` ship commit
- [x] 브랜치 push 완료 (`spec-01-03-verse-schema-migration` → `phase-01-data-pipeline`)
- [ ] 사용자 PR 머지

## 🔗 관련 자료

- Phase: `backlog/phase-01.md`
- Spec: `specs/spec-01-03-verse-schema-migration/spec.md`
- Plan: `specs/spec-01-03-verse-schema-migration/plan.md`
- Task: `specs/spec-01-03-verse-schema-migration/task.md`
- Walkthrough: `specs/spec-01-03-verse-schema-migration/walkthrough.md`
- 선행 PR: `#1` (spec-01-01 bootstrap-supabase), `#2` (spec-01-02 bible-source-fetch) 모두 머지됨
