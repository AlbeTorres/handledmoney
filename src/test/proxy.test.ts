import { describe, expect, it } from 'vitest'
import { isProtectedPath } from '@/proxy'

describe('isProtectedPath', () => {
  it('protects the authenticated finance list routes', () => {
    expect(isProtectedPath('/dashboard')).toBe(true)
    expect(isProtectedPath('/account')).toBe(true)
    expect(isProtectedPath('/budget')).toBe(true)
    expect(isProtectedPath('/category')).toBe(true)
    expect(isProtectedPath('/settings')).toBe(true)
    expect(isProtectedPath('/transaction')).toBe(true)
  })

  it('protects nested create, detail, edit and import routes', () => {
    expect(isProtectedPath('/account/create')).toBe(true)
    expect(isProtectedPath('/account/abc123')).toBe(true)
    expect(isProtectedPath('/account/abc123/edit')).toBe(true)
    expect(isProtectedPath('/budget/create')).toBe(true)
    expect(isProtectedPath('/budget/abc123')).toBe(true)
    expect(isProtectedPath('/category/create')).toBe(true)
    expect(isProtectedPath('/category/abc123/edit')).toBe(true)
    expect(isProtectedPath('/transaction/create')).toBe(true)
    expect(isProtectedPath('/transaction/abc123')).toBe(true)
    expect(isProtectedPath('/transaction/abc123/edit')).toBe(true)
    expect(isProtectedPath('/transaction/bulk')).toBe(true)
  })

  it('never matches public, API or look-alike prefixes', () => {
    expect(isProtectedPath('/')).toBe(false)
    expect(isProtectedPath('/auth/login')).toBe(false)
    expect(isProtectedPath('/auth/register')).toBe(false)
    expect(isProtectedPath('/auth/two-factor')).toBe(false)
    expect(isProtectedPath('/auth/new-verification')).toBe(false)
    expect(isProtectedPath('/privacy')).toBe(false)
    expect(isProtectedPath('/terms')).toBe(false)
    expect(isProtectedPath('/api/auth/get-session')).toBe(false)
    // Segment matching must not catch prefix look-alikes.
    expect(isProtectedPath('/accounting')).toBe(false)
    expect(isProtectedPath('/transactional/bulk')).toBe(false)
    expect(isProtectedPath('/dashboarding')).toBe(false)
    expect(isProtectedPath('/settings#profile')).toBe(false)
  })

  it('handles edge inputs defensively', () => {
    expect(isProtectedPath('')).toBe(false)
    expect(isProtectedPath('transaction')).toBe(false) // missing leading slash
    expect(isProtectedPath('/transaction/')).toBe(true) // trailing slash is nested
    expect(isProtectedPath('/account/')).toBe(true)
  })
})
