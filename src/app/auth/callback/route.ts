import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase OAuth / 이메일 확인 콜백.
 *
 * Supabase 가 ?code=... 쿼리로 redirect 시 이 핸들러에서
 * exchangeCodeForSession 으로 세션 교환을 수행해야 함.
 *
 * spec-03-02 scaffolding — Supabase 호출은 TODO. 사용자가 직접 연결.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    // ?code 없이 콜백 호출되면 에러로 간주
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("missing code")}`,
    );
  }

  // TODO(spec-03-02): Supabase exchangeCodeForSession 연결
  //   const supabase = await createClient()  // from "@/lib/supabase/server"
  //   const { error } = await supabase.auth.exchangeCodeForSession(code)
  //   if (error) {
  //     return NextResponse.redirect(
  //       `${origin}/login?error=${encodeURIComponent(error.message)}`,
  //     )
  //   }
  //   return NextResponse.redirect(`${origin}${next}`)

  // 미연결 상태에서는 일단 next 로 redirect — 실제로는 위 TODO 가 채워져야 동작.
  return NextResponse.redirect(`${origin}${next}`);
}
