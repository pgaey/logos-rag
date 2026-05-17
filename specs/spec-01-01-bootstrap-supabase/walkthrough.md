# Walkthrough: spec-01-01

> 본 문서는 *작업 기록* 입니다. 결정 과정, 사용자 협의, 검증 결과를 미래의 자신과 리뷰어에게 남깁니다.

## 📌 결정 기록

> **스코프 주의**: 본 표의 "DB 통신 방식" 결정은 **개발자 도구 (`scripts/check-supabase.ts`) 한정**입니다. **앱 런타임 코드 (`src/lib/supabase/*`) 는 Supabase JS 만 사용** 하며, pg 와 대체 관계가 아닙니다 (보완 관계).

| 이슈 | 선택지 | 결정 | 이유 |
|---|---|---|---|
| 검증 스크립트의 DB 통신 방식 (앱 코드는 별개로 Supabase JS 유지) | Supabase JS (PostgREST) / `pg` 직접 / Dashboard RPC 함수 | **`pg` 직접 (Session pooler) 추가 도입** | PostgREST 가 `pg_catalog` 미노출이라 Supabase JS 로는 pgvector extension 검증 불가능. 본 스크립트만 pg 통로 추가, 앱 런타임 영향 없음. spec-01-03/04 의 마이그레이션·배치에서 동일 통로 재사용 |
| Postgres 연결 모드 | Direct (5432, IPv6 only) / Session pooler (5432, IPv4) / Transaction pooler (6543) | **Session pooler** | 무료 tier 의 Direct 는 IPv6 only — 한국 가정용 IPv4 환경에서 실패 가능성. Session pooler 는 Direct 와 기능 동일하고 IPv4 호환 |
| 단위 테스트 러너 (Vitest 등) 도입 시점 | 본 spec 에서 도입 / 별도 spec / 미정 | **본 spec 에선 미도입, 검증 스크립트로 갈음** | bootstrap 범위 최소화. 본격 로직 (cosine wrapper 등) 이 생기는 spec 에서 도입하는 게 자연스러움 |
| Supabase 클라이언트 보일러 | Framework 탭 자동 생성 / 직접 작성 | **직접 작성 (5줄)** | Framework 탭은 legacy `anon` 기준이라 신규 키 형식과 안 맞음. 5줄이라 직접이 빠르고 학습 가치 ↑ |
| Task 1 의 pre-flight 산출물 commit 누락 | 무시 / Task 2 와 합치기 / Task 1 에 1-2 단계 추가 | **Task 1-2 로 추가 + 별도 commit** | "One Task = One Commit" 위반 회피 + workdir 정리 |
| `.env.example` 가 `.env*` gitignore 룰에 차단됨 | gitignore 룰을 `.env.local` 등으로 좁힘 / `!.env.example` 예외 추가 | **`!.env.example` 예외 한 줄** | 최소 침습. 기존 Next 기본 룰 보존 |
| Task 7 (README) 실행 모델 | Opus 메인 / Sonnet sub-agent / Haiku sub-agent | **Sonnet sub-agent** | 사용자 모델 분배 규칙 ([[feedback-model-allocation]] 메모리). README 는 정형 단순 문서 — Sonnet 적합 |

## 💬 사용자 협의

- **주제**: 모델 분배 규칙
  - **사용자 의견**: "구조적으로 복잡한 아키텍처 구성이나 플랜 방향성 등은 Opus, 코딩 작성 등 단순 업무는 Sonnet, 정말 반복적인 것은 Haiku"
  - **합의**: agent.md §6.6 의 기본 분배 전략을 더 엄격히 적용. 메모리 (`feedback_model_allocation.md`) 에 영구 저장. 본 spec 의 Task 7 부터 Sonnet 위임 시작.

- **주제**: GitFlow 변형 (Constitution §5.6 편차)
  - **사용자 의견**: "base branch 모드이고 최종은 develop으로"
  - **합의**: `main = 배포 가능 안정본 / develop = 통합 / phase base = phase-01-data-pipeline → develop` 의 4단 머지. sdd 의 기본 phase → main override 필요. phase-01.md 결정 기록에 명시.

- **주제**: 보안 사고 (실 Supabase 키 노출)
  - **사용자 의견**: `.env.example` 작성 요청에 placeholder 대신 실제 발급된 publishable/secret 키를 기입
  - **합의**: 즉시 알림 → 사용자가 Supabase Dashboard 에서 두 키 모두 rotate → `.env.example` placeholder 복원. **추가 액션 권고**: Supabase 키는 발급 즉시 `.env.local` 에만 넣고 `.env.example` 은 영원히 placeholder.

- **주제**: Supabase Connect UI 의 Framework vs Direct 탭 선택
  - **사용자 의문**: "Framework 탭으로 하면 안 되나? Direct 를 고른 이유?"
  - **합의**: 둘은 선택지가 아니라 다른 층 — Framework = 앱 코드용 Supabase JS, Direct = 셋업·배치용 pg. logos-rag 는 **둘 다** 사용. 이번 검증 스크립트는 `pg_catalog` 접근이 필요해 Direct 강제.

- **주제**: 셋업을 GUI 로 vs 코드로
  - **사용자 의문**: "GUI 에서 해도 되는데 코드로 하려고 정보 받는 거?"
  - **합의**: pgvector "활성화" 자체는 Dashboard GUI (Supabase 가 보안상 그것만 허용). 그 외 "활성 검증" + "테이블 생성" + "31k 적재" 는 모두 스크립트. 재현성·버전관리·자동화 발판·학습 가치 4가지 이유.

## 🧪 검증 결과

### 1. 자동화 테스트

#### 단위 테스트
- **명령**: 본 spec 은 단위 테스트 러너 미도입 (Vitest 등 별도 spec 으로 이월)
- **결과**: N/A

#### 통합 테스트 (Integration Test Required = yes)
- **명령**: `pnpm check:supabase`
- **결과**: ✅ Passed
- **로그 요약**:
```text
[check:supabase] connecting...
[check:supabase] SELECT 1 ............ PASS
[check:supabase] pgvector extension .. PASS
[check:supabase] all checks passed.
```

### 2. 수동 검증

1. **Action**: `pnpm exec tsc --noEmit`
   - **Result**: ✅ 타입 에러 0건 (빈 stdout)
2. **Action**: `pnpm lint`
   - **Result**: ✅ ESLint 경고/에러 0건
3. **Action**: `pnpm build` (Next 16 Turbopack)
   - **Result**: ✅ 1.9s 컴파일, static 4 page
4. **Action**: `grep -r -l 'sb_secret_\|SUPABASE_SECRET_KEY' .next/static .next/server`
   - **Result**: ✅ 0건 — server.ts 가 아직 import 되지 않아 tree-shake. 시크릿 누출 없음 (baseline 확인)
5. **Action**: `pnpm exec tsx scripts/check-supabase.ts` (no `--env-file`)
   - **Result**: ✅ `Missing SUPABASE_DB_URL in .env.local` + exit 1 (에러 경로 정상)

## 🔍 발견 사항

- **Supabase Connect UI 가 새 표준**: 기존 "Project Settings → Database → Connection string → URI" 경로는 신규 UI 에 없음. 상단 `Connect` 버튼 → `Direct` 탭 → 3개 모드 (Direct / Session pooler / Transaction pooler) 가 현재 정식 경로.
- **Supabase API 키 마이그레이션**: `sb_publishable_*` / `sb_secret_*` 가 신규 표준 (2025-11-01 이후 신규 프로젝트), legacy `anon` / `service_role` JWT 는 2026년 말 제거 예정. SDK 호환 — 키만 바꿔 끼우면 됨.
- **Next 16 의 AGENTS.md 패턴**: `create-next-app` 이 자동으로 AGENTS.md 를 생성 + 기존 CLAUDE.md 에 `@AGENTS.md` import 추가. AI 에이전트가 옛 API 로 코드 짜는 걸 막는 가드.
- **pnpm 10 의 `pnpm-workspace.yaml` 재사용**: 모노리포 아니어도 `ignoredBuiltDependencies` (sharp, unrs-resolver) 등 보안 설정을 담는 파일로 변경됨.
- **`.env*` 기본 룰**: Next 기본 gitignore 는 `.env*` 전체를 ignore 하므로 `.env.example` 도 차단됨. `!.env.example` 예외가 필수.

## 🚧 이월 항목

- **Vitest 등 단위 테스트 러너 도입** → 본격 비즈니스 로직 (cosine wrapper, 평가 스크립트) 이 생기는 spec 에서 결정. 현재 미등록 (별도 spec-x 또는 phase-01 후속 spec 에서 처리).
- **GitHub `main`·`develop` 브랜치 보호 룰 설정** → 사용자가 GitHub 웹에서 수동 적용 (README §브랜치 보호 에 안내).
- **`.env.example` 의 SUPABASE_DB_URL 에 설명 코멘트 추가** → 스타일 차원, 향후 spec 에서 갱신 가능.
- **server.ts 가 어디서 import 될지** → spec-01-03 또는 phase-03 의 API route 에서 처음 사용. 그때 secret 누출 grep 이 진짜 의미를 가짐.

## 📅 메타

| 항목 | 값 |
|---|---|
| **작성자** | Agent (Opus 4.7 메인 + Sonnet sub-agent for README) + @pgaey |
| **작성 기간** | 2026-05-16 ~ 2026-05-17 |
| **최종 commit** | ship commit 시 갱신 |
