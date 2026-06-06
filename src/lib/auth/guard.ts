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
 *
 * sub 가드(spec-04-03 C2): `sub`(사용자 고유 id)는 quota 버킷 키이자 모든
 * 사용자별 격리의 기준이다. claims 가 있어도 sub 가 없으면 인증으로 인정하지
 * 않는다(null 반환) — sub 없는 토큰이 통과하면 호출부에서 undefined user_id 로
 * quota 버킷을 공유하거나 throw 하는 fail-open 이 된다. fail-closed 로 차단한다.
 * 반환 시 sub: string 을 보장하므로 호출부는 타입 단언 없이 user.sub 를 쓸 수 있다.
 */
export async function requireUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims || typeof claims.sub !== 'string' || claims.sub.length === 0) {
    return null
  }
  return claims as typeof claims & { sub: string }
}
