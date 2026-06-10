// RLS 실증 (spec-04-03 C1).
//
// 회고: user_daily_quotas 에 RLS 를 켰지만, 외부(anon/publishable) 키로 접근이
// 실제 차단되는지 한 번도 확인 안 함. 앱은 admin(secret key, RLS bypass)로만
// 접근하므로 RLS 는 앱 경로에서 행사되지 않는다 — 유일한 보호 대상은 "외부 키 직접 접근".
// 이 스크립트가 anon 키로 SELECT/INSERT 를 시도해 차단을 1회 실증한다.
//
// 기대(RLS 정책 0개 = 모두 거부):
//   - SELECT → 0 rows (행 미노출) 또는 error
//   - INSERT → error (거부)
//
// 실행: pnpm verify:rls  (tsx --env-file=.env.local)

import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anon) {
    console.error(
      "✗ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (.env.local)",
    );
    process.exit(1);
  }

  // anon(publishable) 키 클라이언트 — 외부 사용자가 브라우저에서 쥐는 그 키.
  const supabase = createClient(url, anon);

  let pass = true;

  // 1) SELECT — RLS 정책 0개면 행이 보이지 않아야 한다(0 rows).
  const sel = await supabase.from("user_daily_quotas").select("*");
  if (sel.error) {
    console.log(`✓ SELECT 거부됨 (error: ${sel.error.message})`);
  } else if ((sel.data?.length ?? 0) === 0) {
    console.log("✓ SELECT 0 rows — 외부 키로 행 미노출 (RLS 보호 동작)");
  } else {
    console.log(`✗ SELECT 가 ${sel.data!.length} rows 반환 — RLS 미보호!`);
    pass = false;
  }

  // 2) INSERT — RLS 로 거부되어야 한다(데이터 변경 없음).
  const ins = await supabase
    .from("user_daily_quotas")
    .insert({ user_id: "00000000-0000-0000-0000-000000000000", request_count: 1 });
  if (ins.error) {
    console.log(`✓ INSERT 거부됨 (RLS): ${ins.error.message}`);
  } else {
    console.log("✗ INSERT 성공 — RLS 미보호! 즉시 본인-행 또는 거부 정책 추가 필요");
    pass = false;
  }

  console.log(
    pass
      ? "\n✅ RLS 보호 실증 PASS — 외부 키 접근 차단 확인"
      : "\n❌ RLS 실증 FAIL — 정책 점검 필요",
  );
  process.exit(pass ? 0 : 1);
}

main();
