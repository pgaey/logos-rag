import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Next.js 16 proxy.md §Matcher 권장 패턴 — 정적 자원/이미지 제외.
    // 모든 비-정적 경로를 통과시켜 세션 리프레시를 수행하고,
    // updateSession 내부의 isProtectedPath 가 redirect 여부를 판단.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
