import 'server-only'
import { createClient } from '@/lib/supabase/server'

/**
 * 현재 요청의 로그인 사용자 claims 를 반환한다. 미인증이면 null.
 *
 * 인증의 주(主) 게이트는 proxy.ts 이고, 이 헬퍼는 Server Action 등이
 * 작업 직전 한 번 더 확인하기 위한 보조 가드다. getClaims 는 JWT 를
 * 로컬(Web Crypto)에서 검증하므로 네트워크 왕복이 없다 — Supabase 가
 * getUser 의 더 빠른 대안으로 권장하는 방식이며, proxy.ts 와 동일 패턴.
 *
 * 인증 로직을 한 곳에 모아(DRY) 각 action 이 getClaims 를 복붙하지 않게 한다.
 */
export async function requireUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return data?.claims ?? null
}
