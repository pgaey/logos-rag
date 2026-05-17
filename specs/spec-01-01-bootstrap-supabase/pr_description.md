# feat(spec-01-01): bootstrap Supabase 연결 + pgvector 검증

## 📋 Summary

### 배경 및 목적
phase-01 (data-pipeline) 의 후속 spec 들 — bible-source-fetch / verse-schema-migration / embedding-batch-script / cosine-search-verification — 이 모두 Supabase Postgres + pgvector 에 의존합니다. 본 spec 은 그 인프라 통로를 셋업하고 **연결이 의도대로 동작한다는 사실을 코드로 검증** 합니다. 이후 spec 들이 적재·마이그레이션 중에 인프라 문제로 디버깅 시간을 잃지 않도록 하기 위함.

### 주요 변경 사항
- [x] Supabase 신규 API 키 형식 (`sb_publishable_*` / `sb_secret_*`) 기반 환경변수 wiring
- [x] 서버 전용·브라우저용 Supabase JS 팩토리 분리 (`src/lib/supabase/{server,client}.ts`)
- [x] **`pg` 직접 연결로 pgvector 활성 검증 스크립트 추가** (`scripts/check-supabase.ts`) — PostgREST 가 `pg_catalog` 미노출이라 Supabase JS 로는 불가능
- [x] `pnpm check:supabase` 명령으로 SELECT 1 + pgvector extension 두 검증 자동화
- [x] `.env.example` 템플릿 + `.gitignore` 의 `!.env.example` 예외
- [x] README 셋업 가이드 (9개 섹션 — 스택·셋업·환경변수·GitFlow·브랜치 보호·스크립트·라이선스)

### Phase 컨텍스트
- **Phase**: `phase-01` (data-pipeline, base branch 모드 → develop)
- **본 SPEC 의 역할**: phase-01 의 첫 spec. 인프라 통로를 세우고 후속 spec 들이 안심하고 마이그레이션·적재에 집중할 수 있는 토대 제공.

## 🎯 Key Review Points

1. **서버/브라우저 클라이언트 분리** (`src/lib/supabase/server.ts` vs `client.ts`)
   - secret key 는 `server.ts` 만, publishable key 는 `client.ts` 만 참조 — import path 만으로 권한 컨텍스트 명확
   - `NEXT_PUBLIC_*` prefix 규칙 준수 — Next 가 클라이언트 번들에 secret 가 절대 포함되지 않도록 강제

2. **Supabase JS 대신 `pg` 를 도입한 결정** (`scripts/check-supabase.ts`)
   - PostgREST 가 `pg_catalog` 미노출 → extension 검증·DDL·COPY 는 직접 TCP 가 표준
   - Session pooler URI 사용 — IPv4 호환 (한국 환경 안전) + Direct 와 기능 동일
   - 후속 spec (`spec-01-03` 마이그레이션, `spec-01-04` 31k verse 적재) 이 같은 패턴 재사용 예정

3. **GitFlow 변형** (Constitution §5.6 편차)
   - 본 spec PR target = `phase-01-data-pipeline` (base branch 모드)
   - phase 완료 시 `phase-01-data-pipeline` → **`develop`** 머지 (sdd 기본 main → develop 수동 override 필요)
   - phase-01.md 결정 기록에 명시

4. **보안 경계**
   - `SUPABASE_SECRET_KEY` / `SUPABASE_DB_URL` 은 `.env.local` (gitignored) 만, 절대 클라이언트·repo 노출 금지
   - `.env.example` 은 placeholder 만 commit
   - 본 spec 진행 중 발생한 키 노출 사고 → 사용자가 즉시 rotate 완료 (walkthrough §사용자 협의 참조)

## 🧪 Verification

### 자동 테스트
본 spec 은 단위 테스트 러너 미도입 (Vitest 등은 후속 spec 으로 이월). 정적 분석으로 갈음:
```bash
pnpm exec tsc --noEmit   # 타입 에러 0건
pnpm lint                # ESLint 0건
pnpm build               # Next 16 Turbopack — 1.9s, static 4 page
```

### 통합 테스트
```bash
pnpm check:supabase
```
**결과**:
- ✅ `SELECT 1`: PASS
- ✅ `pgvector extension`: PASS

### 수동 검증 시나리오
1. **secret key 누출 검사** → `pnpm build` 후 `grep -r 'sb_secret_\|SUPABASE_SECRET_KEY' .next/static .next/server` → **0건** (server.ts 가 아직 import 되지 않아 tree-shake)
2. **env 누락 에러 경로** → `pnpm exec tsx scripts/check-supabase.ts` (no `--env-file`) → `Missing SUPABASE_DB_URL in .env.local` + exit 1 ✓

## 📦 Files Changed

### 🆕 New Files
- `backlog/phase-01.md`: phase-01 정의 (목표·SPEC outline·결정기록·통합테스트)
- `backlog/queue.md`: 대시보드 + v1 로드맵
- `specs/spec-01-01-bootstrap-supabase/{spec,plan,task,walkthrough,pr_description}.md`: 본 spec 5종 산출물
- `src/lib/supabase/server.ts`: secret key 기반 서버 전용 팩토리
- `src/lib/supabase/client.ts`: publishable key 기반 브라우저 팩토리
- `scripts/check-supabase.ts`: pg 직접 연결로 SELECT 1 + pgvector 검증
- `.env.example`: 환경변수 템플릿 (placeholder 만)
- `README.md`: 셋업 가이드 (9개 섹션)

### 🛠 Modified Files
- `.gitignore`: `!.env.example` 예외 + harness-kit 룰 (기존)
- `package.json`: `@supabase/supabase-js`, `pg`, `tsx`, `@types/pg` 의존성 + `check:supabase` 스크립트
- `pnpm-lock.yaml`: 위 의존성 잠금

### 🗑 Deleted Files
없음

**Total**: 본 PR 의 진단 (`git diff --stat phase-01-data-pipeline...HEAD`) 으로 최종 확인.

## ✅ Definition of Done

- [x] `pnpm check:supabase` PASS (SELECT 1 + pgvector extension)
- [x] `pnpm exec tsc --noEmit` PASS
- [x] `pnpm lint` PASS
- [x] `pnpm build` PASS + 시크릿 누출 grep 0건
- [x] env 누락 에러 경로 검증
- [x] `walkthrough.md` ship commit
- [x] `pr_description.md` ship commit
- [x] 브랜치 push 완료 (`spec-01-01-bootstrap-supabase` → `phase-01-data-pipeline`)
- [ ] 사용자 PR 머지 (이 PR 머지 시 base branch 완성)

## 🔗 관련 자료

- Phase: `backlog/phase-01.md`
- Spec: `specs/spec-01-01-bootstrap-supabase/spec.md`
- Plan: `specs/spec-01-01-bootstrap-supabase/plan.md`
- Task: `specs/spec-01-01-bootstrap-supabase/task.md`
- Walkthrough: `specs/spec-01-01-bootstrap-supabase/walkthrough.md`
- 관련 ADR: 없음 (선결 결정 4건은 phase-01.md 결정 기록 표에 인라인)
