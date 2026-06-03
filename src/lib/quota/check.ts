import 'server-only'
import { createServerSupabase } from '@/lib/supabase/admin'

// 사용자별 일일 질문 한도 확인·차감 (spec-04-01).
//
// 조회·비교·증가는 DB 함수 consume_daily_quota 한 트랜잭션에서 원자적으로 처리한다
// (동시요청 race 방지 — supabase/migrations 참조). 여기서는 admin client(secret key)로
// 그 함수를 호출하고 결과를 정규화할 뿐이다.
//
// fail-closed: rpc 조회가 실패하거나 예상 밖 형태면 throw 한다. 비용 청구 방지가
// 최우선이므로 "한도를 알 수 없으면 비싼 작업(검색·LLM)을 막는다". 호출부(askQuestion)가
// throw 를 잡아 사용자에게는 '일시적 오류'(unknown)로 안내한다 — 거짓 '한도 초과'가 아니라.

const DEFAULT_LIMIT = 20

export type QuotaResult = {
  allowed: boolean
  remaining: number
  limit: number
}

export async function consumeDailyQuota(userId: string): Promise<QuotaResult> {
  // 0 은 유효한 한도(전면 차단)다. `Number(x) || 20` 으로 쓰면 0 이 falsy 라
  // 의도치 않게 20 으로 폴백된다 — 미설정/비정상(NaN)·음수만 기본값으로 접는다.
  const parsed = Number(process.env.DAILY_QUOTA_LIMIT)
  const limit = Number.isInteger(parsed) && parsed >= 0 ? parsed : DEFAULT_LIMIT

  const supabase = createServerSupabase()
  const { data, error } = await supabase.rpc('consume_daily_quota', {
    p_user_id: userId,
    p_limit: limit,
  })

  if (error) {
    throw new Error(`consume_daily_quota rpc failed: ${error.message}`)
  }

  // RETURNS TABLE → 행 배열로 온다. 첫 행이 결과.
  const row = Array.isArray(data) ? data[0] : data
  if (!row || typeof row.allowed !== 'boolean') {
    throw new Error('consume_daily_quota returned unexpected shape')
  }

  return {
    allowed: row.allowed,
    remaining: typeof row.remaining === 'number' ? row.remaining : 0,
    limit,
  }
}
