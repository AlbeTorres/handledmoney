import { describe, expect, it } from 'vitest'

import { getPageTitle, isRouteActive } from '@/lib/shell-nav'

describe('isRouteActive', () => {
  it('marks exact matches as active', () => {
    expect(isRouteActive('/dashboard', '/dashboard')).toBe(true)
    expect(isRouteActive('/settings', '/settings')).toBe(true)
  })

  it('marks nested routes as active for the parent item', () => {
    expect(isRouteActive('/account/abc123', '/account')).toBe(true)
    expect(isRouteActive('/budget/new', '/budget')).toBe(true)
  })

  it('does not match partial segments', () => {
    expect(isRouteActive('/dashboard-old', '/dashboard')).toBe(false)
    expect(isRouteActive('/accounts', '/account')).toBe(false)
  })

  it('does not activate a different section', () => {
    expect(isRouteActive('/settings', '/dashboard')).toBe(false)
    expect(isRouteActive('/transaction/1', '/transaction-x')).toBe(false)
  })

  it('only matches home on the exact root path', () => {
    expect(isRouteActive('/', '/')).toBe(true)
    expect(isRouteActive('/dashboard', '/')).toBe(false)
  })
})

describe('getPageTitle', () => {
  it('returns Dashboard for the root path', () => {
    expect(getPageTitle('/')).toBe('Dashboard')
  })

  it('returns known titles for the finance sections', () => {
    expect(getPageTitle('/dashboard')).toBe('Dashboard')
    expect(getPageTitle('/account/abc')).toBe('Accounts')
    expect(getPageTitle('/budget/new')).toBe('Budgets')
    expect(getPageTitle('/settings/notifications')).toBe('Settings')
  })

  it('falls back to a capitalized segment for unknown routes', () => {
    expect(getPageTitle('/reports')).toBe('Reports')
  })
})
