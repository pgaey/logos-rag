import { describe, it, expect, vi, beforeEach } from 'vitest'

// createClient(서버 Supabase)를 mock 한다. getClaims 가 돌려주는 값만 우리가 통제하면
// requireUser 의 분기(claims 있음 → 반환, 없음 → null)를 라이브 호출 없이 검증할 수 있다.
const getClaims = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims },
  })),
}))

import { requireUser } from '../guard'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireUser', () => {
  it('claims 가 있으면 claims 를 반환한다', async () => {
    const claims = { sub: 'user-123', email: 'a@b.com' }
    getClaims.mockResolvedValue({ data: { claims } })

    const result = await requireUser()

    expect(result).toEqual(claims)
  })

  it('claims 가 없으면(data null) null 을 반환한다', async () => {
    getClaims.mockResolvedValue({ data: null })

    const result = await requireUser()

    expect(result).toBeNull()
  })

  it('data 는 있으나 claims 가 없으면 null 을 반환한다', async () => {
    getClaims.mockResolvedValue({ data: { claims: null } })

    const result = await requireUser()

    expect(result).toBeNull()
  })
})
