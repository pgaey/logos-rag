# refactor(spec-03-06): server-only 경계 강화 + 인증 주석 교정

## 📋 Summary

### 배경 및 목적

시크릿 다루는 `lib/**` 모듈(SECRET/API 키)이 "관습적 서버 전용"일 뿐 컴파일 강제가 없어, 실수로 client component에 import되면 키가 브라우저 번들로 샐 수 있었다. `import 'server-only'`로 이를 빌드 단계에서 차단하고, `askQuestion` 인증 주석을 Next.js 공식 근거로 교정한다(Server Action = 권위 게이트, proxy = UX).

### 주요 변경 사항

- [x] `server-only` 의존성 추가
- [x] 시크릿/서버전용 5개 모듈(admin·gemini·cosine·guard·server)에 `import 'server-only'`
- [x] `client.ts`(브라우저 클라이언트) 명시적 제외
- [x] vitest에 `server-only`→`empty.js` alias (node 테스트 환경 우회)
- [x] `actions.ts` 인증 주석 교정

### Phase 컨텍스트

- **Phase**: `phase-03`
- **역할**: 화면(spec-03-05) 작업 전 서버 경계를 단단히. 인증 책임 모델 명확화.

## 🎯 Key Review Points

1. **server-only 대상 선정**: 시크릿 있는 5개만. `client.ts` 제외(넣으면 빌드 깨짐).
2. **vitest alias**: server-only가 node 테스트에서 throw → empty.js로 치환. 실제 가드는 next build.
3. **가드 작동 증명**: client→server-only import가 `pnpm build`에서 실제 차단됨을 실험으로 확인(walkthrough).
4. **인증 주석**: 로직 불변, 책임 모델 표현만 교정(Next.js 공식 문구 인용).

## 🧪 Verification

```bash
pnpm test               # 27/27 PASS
pnpm exec tsc --noEmit  # clean
pnpm build              # BUILD_EXIT 0 (정상 경로 무결)
```

가드 증명: `login/page.tsx`에 `gemini` import 시 build가 "module depends on server-only"로 차단 → 원복 후 clean build 재확인.

## 📦 Files Changed

### 🛠 Modified
- `package.json`, `pnpm-lock.yaml`: server-only 추가
- `src/lib/{supabase/admin,llm/gemini,search/cosine,auth/guard,supabase/server}.ts`: `import 'server-only'` (+1 each)
- `vitest.config.ts`: alias (+5)
- `src/app/qa/actions.ts`: 인증 주석 교정

## ✅ Definition of Done

- [x] server-only 5개 선언 + client.ts 제외 확인
- [x] 인증 주석 교정
- [x] tsc + test(27) + build 통과
- [x] CLI 영향 없음 확인
- [x] walkthrough / pr_description ship commit
- [x] 사용자 검토 요청 알림 완료

## 🔗 관련 자료

- Phase: `backlog/phase-03.md` / Base: `phase-03-auth-ui-llm`
- 선행: spec-03-04 / 후속: spec-03-05(park, 재개 예정)
