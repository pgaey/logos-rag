import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isProtectedPath } from './protected-paths'

/**
 * Next.js 16 proxy.ts 가 호출하는 세션 리프레시 + 보호 경로 redirect 헬퍼.
 *
 * Supabase 공식 가이드 (@supabase/ssr Next.js App Router middleware 예시) 직역.
 * Next.js 16 에서 file convention 이 middleware → proxy 로 변경됐으나
 * 호출 시점·역할·구조는 동일.
 *
 * - 모든 요청에서 supabase.auth.getUser() 를 호출해 만료 직전 JWT 를 갱신.
 *   비보호 경로의 세션도 함께 유지해 UI 일관성 확보.
 * - protected path 에서 user 가 없으면 /login 으로 redirect (307).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}
