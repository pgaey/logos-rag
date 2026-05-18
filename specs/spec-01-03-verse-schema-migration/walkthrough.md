# Walkthrough: spec-01-03

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

> **스코프 주의**: 본 spec 은 스키마 + CLI 셋업 전용. 데이터 적재(04), 인덱스 추가, RLS 정책 작성은 out of scope.

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 마이그레이션 도구 | Supabase CLI / Dashboard SQL editor / 우리 pg 스크립트 | **Supabase CLI** | 표준, 버전관리, generated types 무료, 후속 spec 재사용. brew 설치 우회 경로 필요했지만 결과적으로 표준 워크플로 진입 |
| PRIMARY KEY | (book, chapter, verse) 복합 / BIGSERIAL | **BIGSERIAL + UNIQUE constraint** | INSERT 성능·디버깅 친화. UNIQUE 가 동등한 중복 차단 역할 |
| embedding 컬럼 NULL 정책 | NOT NULL / NULL 허용 | **NULL 허용** | 본 spec 은 스키마만 만듦. NOT NULL 시 spec-01-04 적재 전까지 row 생성 불가 |
| pgvector 인덱스 | 없음 / ivfflat / hnsw | **없음** | 31k row 면 brute force ~50ms 충분. spec-01-05 검증 후 부족 시 별도 spec. 불필요한 복잡성 경계 |
| RLS 정책 | 비활성 / ENABLE 만 / 정책 다수 | **ENABLE + 정책 0** | 서버 전용 테이블 = anon/publishable 키 자동 차단 = 최소 권한 원칙 |
| vector 타입 참조 | `vector(768)` / `extensions.vector(768)` | **`extensions.vector(768)`** | Supabase 가 pgvector 를 extensions 스키마에 둠 → schema-qualified 가 강제 (db push 첫 시도 실패로 발견) |
| Supabase CLI 설치 경로 | brew (공식 권장) / pnpm + 수동 postinstall / 바이너리 직접 | **pnpm + 수동 postinstall + symlink** (현재 환경 한정) | brew 가 git/libcurl 심볼 불일치 (`_curl_global_trace`) 로 실패. pnpm 의 supabase 패키지가 postinstall 차단됐지만 수동 실행으로 우회 가능 |
| generated types 출력 처리 | 그대로 사용 / 오염 라인 정제 | **오염 라인 정제** | `supabase gen types --linked` 가 CLI 로그·hint 태그를 stdout 에 함께 출력함 — TS 컴파일 깨지지 않게 첫·마지막 줄 제거 |
| Sonnet 버그 처리 | amend / 별도 fix commit | **별도 `fix(spec-01-03)` commit** | Constitution §9 no-amend. SQL 수정 history 보존이 미래 디버깅에 가치 |

## 💬 사용자 협의

- **주제**: spec-01-03 직접 실행 위임
  - **사용자 의견**: "너가 쭉 할 순 없어?" (brew 실패 직후)
  - **합의**: 사용자 액션 = PAT 발급 + `supabase login` 두 가지로 최소화. 나머지 (init, link, migration 작성, db push, types 생성, check 확장, README) 는 에이전트가 끝까지. Plan 의 "사용자 검토 필요" 항목 (db push 등) 도 위임 받아 직접 실행.

- **주제**: brew 설치 실패 (libcurl 심볼 불일치)
  - **사용자 상황**: `brew install supabase/tap/supabase` → `dyld[]: Symbol not found: _curl_global_trace` 에러
  - **합의**: brew 디펜던시 재설치 시도 (`brew reinstall git`) 도 실패 → pnpm 우회 경로로 전환. README 에 fallback 명시.

- **주제**: SQL 첫 push 실패 (pgvector 스키마 위치)
  - **사용자 의견**: (별도 결정 없음, 자동 디버깅)
  - **합의**: 메인 Opus 가 즉시 `extensions.vector` 로 수정 + 별도 fix commit 으로 history 보존.

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: 단위 테스트 러너 미도입 (단순 schema/migration 은 통합 smoke 로 갈음)
- **결과**: N/A

#### 통합 테스트 (Integration Test Required = yes)
- **명령**: `pnpm check:supabase`
- **결과**: ✅ Passed (4단계)
- **로그 요약**:
```text
[check:supabase] connecting...
[check:supabase] SELECT 1 ............ PASS
[check:supabase] pgvector extension .. PASS
[check:supabase] verses table ........ PASS
[check:supabase] all checks passed.
```

### 2. 수동 검증

1. **Action**: `pnpm exec tsc --noEmit`
   - **Result**: ✅ generated types (`src/lib/db/types.ts`) import 가능 + 타입 에러 0건
2. **Action**: `pnpm lint`
   - **Result**: ✅ ESLint 0건
3. **Action**: `supabase db push --include-all` (재시도)
   - **Result**: ✅ `Finished supabase db push` — `verses` 테이블 + RLS + UNIQUE constraint 적용 확인
4. **Action**: `grep verses src/lib/db/types.ts`
   - **Result**: ✅ verses 타입 정의 포함 — 컬럼 6개 (`id, book, chapter, verse, text, embedding`)

## 🔍 발견 사항

- **macOS Sonoma + Homebrew libcurl 함정**: brew 의 git 이 시스템 `/usr/lib/libcurl.4.dylib` 에 링크돼서 새 심볼 (`_curl_global_trace`) 부재로 https 접속 실패. `brew reinstall git` 만으로는 해결 안 됨 — 시스템 libcurl 자체가 옛 버전이라 dylib 재링크가 의미 없음. **우회 경로** (pnpm + 수동 postinstall) 가 표준 fallback 패턴.
- **Supabase pgvector 의 schema 위치**: extensions 스키마. `search_path` 가 `public, extensions` 라도 type lookup 은 명시적 schema 가 필요한 경우가 있음 (DDL 컬럼 타입). schema-qualified `extensions.vector(768)` 가 안전한 default.
- **`supabase gen types --linked` 출력 오염**: 정상 동작이지만 stdout 에 일부 CLI 로그·hint 가 섞임. `> file.ts` 로 리다이렉트 시 TS 컴파일 깨질 위험. 첫·마지막 라인 후처리 정제 필요.
- **pnpm 10 의 build script 차단**: pnpm 10 이 보안상 postinstall 등 build script 를 default 차단 (`ignoredBuiltDependencies`). supabase 같은 "postinstall = 실제 바이너리 다운로드" 패키지가 침묵 실패. 수동 실행 우회 가능하지만 사용자 인지 필요.
- **migration history 보존 원칙 재확인**: SQL 첫 push 실패 → 수정 → 재push 의 과정을 별도 fix commit 으로 남김 (amend X). PR review 시 "왜 그렇게 됐는지" 가 살아있음.

## 🚧 이월 항목

- **Vitest 등 단위 테스트 러너**: 여전히 미도입. spec-01-04/05 에서 본격 비즈니스 로직 (embed 호출, cosine wrapper) 이 생기면 재검토.
- **인덱스 추가**: spec-01-05 의 cosine 검색 정확도·속도 측정 후 부족하면 별도 spec.
- **Supabase CLI 설치 우회 방법 표준화**: 현재 브랜치별 README 에 "brew 실패 시 pnpm" 한 줄만 명시. 추후 도구 표준화 spec 에서 다룰 만함.
- **RLS 정책 추가**: 사용자가 verses 를 직접 SELECT 할 일이 생기면 (예: 즐겨찾기, 북마크) 그때 spec.
- **`supabase gen types` 출력 정제 자동화**: 현재 수동. 후속 spec 에서 비슷한 작업 반복 시 wrapper 스크립트 후보.

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent (Opus 4.7 메인 + Sonnet sub-agent for types/check/README) + @pgaey |
| **작성 기간** | 2026-05-17 |
| **최종 commit** | ship commit 시 갱신 |
