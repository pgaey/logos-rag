import { describe, it, expect, vi, beforeEach } from 'vitest'

// consumeDailyQuota 의 유일한 의존성은 admin client 의 rpc 호출이다.
// createServerSupabase 가 { rpc } 만 노출하도록 mock 해 rpc 결과를 통제한다.
const rpc = vi.hoisted(() => vi.fn())
vi.mock('@/lib/supabase/admin', () => ({
  createServerSupabase: () => ({ rpc }),
}))

import { consumeDailyQuota } from '../check'

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.DAILY_QUOTA_LIMIT
})

describe('consumeDailyQuota', () => {
  it('허용: rpc 가 allowed=true 행을 주면 {allowed,remaining,limit} 로 정규화', async () => {
    rpc.mockResolvedValue({ data: [{ allowed: true, remaining: 5 }], error: null })

    const result = await consumeDailyQuota('user-1')

    expect(result).toEqual({ allowed: true, remaining: 5, limit: 20 })
  })

  it('차단: rpc 가 allowed=false 행을 주면 allowed:false', async () => {
    rpc.mockResolvedValue({ data: [{ allowed: false, remaining: 0 }], error: null })

    const result = await consumeDailyQuota('user-1')

    expect(result.allowed).toBe(false)
  })

  it('rpc 에 user_id 와 기본 한도(p_limit=20)를 전달', async () => {
    rpc.mockResolvedValue({ data: [{ allowed: true, remaining: 19 }], error: null })

    await consumeDailyQuota('user-42')

    expect(rpc).toHaveBeenCalledWith('consume_daily_quota', {
      p_user_id: 'user-42',
      p_limit: 20,
    })
  })

  it('DAILY_QUOTA_LIMIT 환경변수를 한도로 반영', async () => {
    process.env.DAILY_QUOTA_LIMIT = '3'
    rpc.mockResolvedValue({ data: [{ allowed: true, remaining: 2 }], error: null })

    const result = await consumeDailyQuota('user-1')

    expect(rpc).toHaveBeenCalledWith('consume_daily_quota', {
      p_user_id: 'user-1',
      p_limit: 3,
    })
    expect(result.limit).toBe(3)
  })

  it('DAILY_QUOTA_LIMIT=0 은 0 으로 취급(전면 차단), 기본값 20 으로 폴백 금지', async () => {
    // 0 은 유효한 한도(모두 차단)다. `Number(x) || 20` 의 falsy 함정으로 20 이 되면 안 된다.
    process.env.DAILY_QUOTA_LIMIT = '0'
    rpc.mockResolvedValue({ data: [{ allowed: false, remaining: 0 }], error: null })

    const result = await consumeDailyQuota('user-1')

    expect(rpc).toHaveBeenCalledWith('consume_daily_quota', {
      p_user_id: 'user-1',
      p_limit: 0,
    })
    expect(result.limit).toBe(0)
  })

  it('DAILY_QUOTA_LIMIT 미설정/비정상 값이면 기본 20 으로 폴백', async () => {
    process.env.DAILY_QUOTA_LIMIT = 'not-a-number'
    rpc.mockResolvedValue({ data: [{ allowed: true, remaining: 19 }], error: null })

    const result = await consumeDailyQuota('user-1')

    expect(result.limit).toBe(20)
  })

  it('fail-closed: rpc error 면 throw (조회 불가 → 비싼 작업 차단)', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'connection refused' } })

    await expect(consumeDailyQuota('user-1')).rejects.toThrow()
  })

  it('fail-closed: rpc 가 예상 밖 형태(빈 배열)면 throw', async () => {
    rpc.mockResolvedValue({ data: [], error: null })

    await expect(consumeDailyQuota('user-1')).rejects.toThrow()
  })
})
