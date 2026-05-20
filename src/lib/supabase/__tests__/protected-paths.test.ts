import { describe, it, expect } from 'vitest'
import { isProtectedPath } from '../protected-paths'

describe('isProtectedPath', () => {
  it('returns true for exact /qa', () => {
    expect(isProtectedPath('/qa')).toBe(true)
  })

  it('returns true for /api/qa prefix matches', () => {
    expect(isProtectedPath('/api/qa')).toBe(true)
    expect(isProtectedPath('/api/qa/history')).toBe(true)
  })

  it('returns true for /qa nested routes', () => {
    expect(isProtectedPath('/qa/123')).toBe(true)
  })

  it('returns false for /login', () => {
    expect(isProtectedPath('/login')).toBe(false)
  })

  it('returns false for the public /api/search route (phase-02)', () => {
    expect(isProtectedPath('/api/search')).toBe(false)
  })

  it('returns false for root and arbitrary public paths', () => {
    expect(isProtectedPath('/')).toBe(false)
    expect(isProtectedPath('/auth/callback')).toBe(false)
  })

  it('does not match unrelated paths that share a prefix substring', () => {
    expect(isProtectedPath('/qa-archive')).toBe(false)
    expect(isProtectedPath('/api/qa-helper')).toBe(false)
  })
})
