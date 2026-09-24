import { describe, expect, it } from 'vitest'
import { getPageTitle, isRouteActive } from '@/lib/shell-nav'

describe('getPageTitle', () => {
  it('maps the root path to the dashboard title', () => {
    expect(getPageTitle('/')).toBe('Dashboard')
  })

  it('maps every finance area to a sensible header title', () => {
    expect(getPageTitle('/dashboard')).toBe('Dashboard')
    expect(getPageTitle('/account')).toBe('Accounts')
    expect(getPageTitle('/category')).toBe('Categories')
    expect(getPageTitle('/transaction')).toBe('Transactions')
    expect(getPageTitle('/budget')).toBe('Budget')
    expect(getPageTitle('/settings')).toBe('Settings')
  })

  it('maps create, detail, and edit paths to specific titles', () => {
    expect(getPageTitle('/account/create')).toBe('New Account')
    expect(getPageTitle('/account/acc_001')).toBe('Account Details')
    expect(getPageTitle('/account/acc_001/edit')).toBe('Edit Account')
    expect(getPageTitle('/category/create')).toBe('New Category')
    expect(getPageTitle('/category/cat_001/edit')).toBe('Edit Category')
    expect(getPageTitle('/transaction/create')).toBe('New Transaction')
    expect(getPageTitle('/transaction/bulk')).toBe('Bulk Import')
    expect(getPageTitle('/transaction/txn_001')).toBe('Transaction Details')
    expect(getPageTitle('/transaction/txn_001/edit')).toBe('Edit Transaction')
    expect(getPageTitle('/budget/create')).toBe('New Budget')
    expect(getPageTitle('/budget/bud_001')).toBe('Budget Details')
  })

  it('capitalizes unknown first segments as a fallback', () => {
    expect(getPageTitle('/reports')).toBe('Reports')
  })
})

describe('isRouteActive', () => {
  it('matches exact routes', () => {
    expect(isRouteActive('/account', '/account')).toBe(true)
    expect(isRouteActive('/dashboard', '/dashboard')).toBe(true)
  })

  it('keeps nested routes active under their nav section', () => {
    expect(isRouteActive('/account/acc_001', '/account')).toBe(true)
    expect(isRouteActive('/account/acc_001/edit', '/account')).toBe(true)
    expect(isRouteActive('/transaction/txn_001/edit', '/transaction')).toBe(true)
    expect(isRouteActive('/budget/create', '/budget')).toBe(true)
    expect(isRouteActive('/settings', '/settings')).toBe(true)
  })

  it('does not match sibling segments sharing a prefix', () => {
    expect(isRouteActive('/accounting', '/account')).toBe(false)
    expect(isRouteActive('/accountant', '/account')).toBe(false)
    expect(isRouteActive('/transactional', '/transaction')).toBe(false)
    expect(isRouteActive('/dashboarding', '/dashboard')).toBe(false)
  })

  it('does not match unrelated routes', () => {
    expect(isRouteActive('/budget', '/account')).toBe(false)
    expect(isRouteActive('/dashboard', '/settings')).toBe(false)
  })

  it('treats the root href as exact-only', () => {
    expect(isRouteActive('/', '/')).toBe(true)
    expect(isRouteActive('/dashboard', '/')).toBe(false)
  })
})
