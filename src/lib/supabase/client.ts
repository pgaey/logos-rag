import {
  createClient as createBaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

/**
 * 비-SSR 컨텍스트 (CLI 스크립트, 단순 fetcher) 용 브라우저 클라이언트.
 * 세션 쿠키 동기화가 필요 없는 경우만 사용.
 */
export function createBrowserSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishable) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  return createBaseClient(url, publishable)
}

/**
 * Client Component 용 SSR 인식 브라우저 클라이언트.
 * @supabase/ssr 의 createBrowserClient 가 cookie 동기화를 자동 처리하므로
 * server/createClient 와 같은 세션 상태를 공유.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
