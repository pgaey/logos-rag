import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role (admin) Supabase 클라이언트.
 *
 * - SUPABASE_SECRET_KEY 사용 — RLS bypass.
 * - 사용자 세션과 무관 (persistSession: false).
 * - `next/headers` 등 App Router 전용 API 를 import 하지 않으므로
 *   CLI 스크립트 (tsx) / cron / ETL 등 App Router 밖에서도 안전하게 사용 가능.
 *
 * 사용처 예시:
 *   - scripts/embed-bible.ts 의 verses 적재
 *   - src/lib/search/cosine.ts 의 match_verses RPC (검색은 public read 라
 *     anon/publishable 로도 가능하지만, eval 스크립트에서 호출되므로 admin 유지)
 *
 * App Router 안에서 사용자 권한으로 접근해야 한다면 `./server.ts` 의
 * `createClient()` 를 사용할 것.
 */
export function createServerSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Check .env.local.",
    );
  }

  return createClient(url, secret, {
    auth: { persistSession: false },
  });
}
