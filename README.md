# logos-rag

한국어 질문으로 영문 KJV(King James Version) 성경의 의미 유사 구절을 검색하고 Gemini Flash 로 한국어 답변을 생성하는 RAG 포트폴리오

## 기술 스택

| 레이어 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 스타일 | Tailwind CSS 4 |
| 언어 | TypeScript |
| 데이터베이스 | Supabase (Postgres + pgvector + Auth) |
| LLM | Gemini Flash |
| 배포 | Vercel |

## 셋업

1. Node 18.18+ 와 pnpm 10+ 설치 확인
2. 의존성 설치: `pnpm install`
3. Supabase 프로젝트 생성 → Dashboard → Database → Extensions 에서 `vector` 활성화
4. Supabase API keys 발급: Project Settings → API Keys — **신규 형식 `sb_publishable_*` / `sb_secret_*` 사용** (legacy anon/service_role 금지)
5. Postgres 연결 문자열: Connect 버튼 → Direct 탭 → **Session pooler** URI 복사 (IPv4 호환 + 모든 작업 가능)
6. Google AI Studio (`https://aistudio.google.com`) 에서 Gemini API key 발급
7. `.env.example` 를 `.env.local` 로 복사 후 모든 값 채우기: `cp .env.example .env.local`
8. Supabase CLI 설치: `brew install supabase/tap/supabase` (brew 실패 시 `pnpm add -g supabase` 후 `node $(pnpm root -g)/supabase/scripts/postinstall.js`)
9. Supabase 프로젝트 연결 + 마이그레이션 적용
   - `supabase login` (브라우저 인증 flow, PAT 발급 후 verification code 입력)
   - `supabase link --project-ref <YOUR-PROJECT-REF>` (Dashboard → Project Settings → General → Reference ID)
   - `supabase db push` (verses 테이블 + RLS 적용. 첫 실행 시 [Y/n] 프롬프트에 Y)
10. 연결 검증: `pnpm check:supabase` 실행 → 4줄 PASS 출력 확인
11. 성경 데이터 fetch (최초 1회 또는 재생성 시): `pnpm fetch:bible` → `data/web-bible.json` 생성 (6.6MB, 31,102 verse) — repo 에 이미 commit 되어 있으므로 출처 변경·재현 필요 시에만 실행
12. 임베딩 적재: `pnpm embed:bible` → verses 테이블의 verse text 를 `gemini-embedding-001` 로 임베딩하여 embedding(768d) 컬럼 채움. **무료 tier 일일 1,000 requests (RPD) 한도** 에 막힘 → 전체 31,102 verse 적재는 (a) Tier 1 billing 활성 후 `EMBED_BATCH_SIZE=100 EMBED_DELAY_MS=0 pnpm embed:bible` (분 단위 완료) 또는 (b) 매일 1,000 씩 반복. 한도 도달 시 graceful exit (`quota exhausted (free-tier RPD)` 메시지), 다음 날 재실행으로 이어 적재.
13. 개발 서버: `pnpm dev` → http://localhost:3000

## 환경변수

| 변수 | 용도 | 노출 컨텍스트 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 API URL | 클라이언트 노출 OK |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (RLS 적용) | 클라이언트 노출 OK |
| `SUPABASE_SECRET_KEY` | Supabase secret key (RLS 우회) | **서버 전용 — 절대 클라이언트 노출 금지** |
| `SUPABASE_DB_URL` | Postgres 직접 연결 (Session pooler) | **로컬 스크립트 전용 — Vercel/클라이언트 노출 금지** |
| `GEMINI_API_KEY` | Google AI Studio Gemini API key | **서버 전용** |

## 개발 워크플로

GitFlow 변형을 사용합니다.

- `main`: 배포 가능 안정본 (Vercel Production)
- `develop`: 통합 브랜치 (Vercel Preview)
- 작업은 spec 브랜치 (`spec-{phaseN}-{seq}-{slug}`) 에서 시작 → phase base branch (`phase-N-{slug}`) → develop → main 순서로 머지
- 자세한 거버넌스는 `.harness-kit/agent/constitution.md` 참조

## 브랜치 보호

GitHub repo Settings → Branches → Add rule 에서 `main` 과 `develop` **두 브랜치 모두** 에 다음 룰 적용:

- Require pull request before merging
- (선택) Require status checks

직접 push 차단으로 의도치 않은 머지 사고를 방지합니다.

## 스크립트

| 명령 | 동작 |
|---|---|
| `pnpm dev` | 개발 서버 (Turbopack) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 빌드 결과물 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm check:supabase` | Postgres 연결 + pgvector extension 활성 검증 (로컬 전용) |
| `pnpm fetch:bible` | gratis-bible/bible 에서 WEB 성경 OSIS XML fetch → `data/web-bible.json` 정규화 (로컬 전용) |
| `pnpm embed:bible` | verses 의 verse text → `gemini-embedding-001` (`outputDimensionality:768`) → embedding 컬럼 UPDATE. 무료 tier RPD 1,000 도달 시 graceful exit, 재실행으로 이어 적재. Tier 1 활성 시 `EMBED_BATCH_SIZE` / `EMBED_DELAY_MS` env 로 가속 |

## 라이선스

코드: 추후 결정 (TBD)

성경 텍스트: World English Bible (WEB) — 100% public domain.
출처: [gratis-bible/bible](https://github.com/gratis-bible/bible) (`en/web.xml`, OSIS XML).
한국어 답변 생성에 사용되는 영문 원문이며, 본 repo 의 `data/web-bible.json` 으로 정규화·commit 되어 있음.
