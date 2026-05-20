import {
  createClient as createBaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 백엔드 스크립트·관리용 클라이언트 (service secret key).
 * RLS bypass 가 필요한 ETL / cron / migration 경로에서 사용.
 * 사용자 세션과 무관 (persistSession: false).
 */
export function createServerSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY

  if (!url || !secret) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Check .env.local.',
    )
  }

  return createBaseClient(url, secret, {
    auth: { persistSession: false },
  })
}

/**
 * RSC / Route Handler / Server Action 용 인증 인식 클라이언트.
 * Next.js `cookies()` 를 통해 사용자 세션 (JWT) 을 읽고,
 * 호출 시점 로그인 사용자의 권한으로 Supabase 에 접근.
 * Supabase 공식 가이드 (@supabase/ssr Next.js App Router) 직역.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component 컨텍스트에서는 cookie set 이 허용되지 않음 —
            // proxy.ts 의 updateSession 이 동일 갱신을 수행하므로 무시 안전.
          }
        },
      },
    },
  )
}
