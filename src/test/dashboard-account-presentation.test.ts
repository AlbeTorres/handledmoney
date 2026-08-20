import { describe, expect, it } from 'vitest'

import type { DashboardAccount } from '@/lib/dashboard/accounts'
import { presentDashboardAccounts } from '@/lib/dashboard/account-presentation'

const usdAccounts: DashboardAccount[] = [
  { id: 'a1', name: 'Cash', type: 'cash', currency: 'USD', balance: 500 },
  { id: 'a2', name: 'Checking', type: 'checking', currency: 'USD', balance: 1500.5 },
]

describe('presentDashboardAccounts', () => {
  it('validates supported account types as typed presentation', () => {
    const data = presentDashboardAccounts([
      { id: 'a1', name: 'Cash', type: 'cash', currency: 'USD', balance: 500 },
      { id: 'a2', name: 'Checking', type: 'checking', currency: 'USD', balance: 0 },
      { id: 'a3', name: 'Invest', type: 'investment', currency: 'USD', balance: 0 },
      { id: 'a4', name: 'Card', type: 'credit', currency: 'USD', balance: 0 },
      { id: 'a5', name: 'Savings', type: 'savings', currency: 'USD', balance: 0 },
    ])

    expect(data.accounts.map(account => [account.type, account.presentation])).toEqual([
      ['cash', 'typed'],
      ['checking', 'typed'],
      ['investment', 'typed'],
      ['credit', 'typed'],
      ['savings', 'typed'],
    ])
  })

  it('presents invalid account types generically with a null type', () => {
    const data = presentDashboardAccounts([
      { id: 'legacy', name: 'Legacy bank', type: 'bank', currency: 'EUR', balance: 200 },
      { id: 'weird', name: 'Weird', type: 'savingsx', currency: 'USD', balance: 10 },
    ])

    expect(data.accounts).toEqual([
      { id: 'legacy', name: 'Legacy bank', type: null, presentation: 'generic', currency: 'EUR', balance: 200 },
      { id: 'weird', name: 'Weird', type: null, presentation: 'generic', currency: 'USD', balance: 10 },
    ])
  })

  it('returns an empty state with no aggregate for no accounts', () => {
    expect(presentDashboardAccounts([])).toEqual({ accounts: [], aggregateBalance: null })
  })

  it('suppresses the aggregate for mixed currencies without adding FX', () => {
    const data = presentDashboardAccounts([
      { id: 'usd', name: 'Cash', type: 'cash', currency: 'USD', balance: 500 },
      { id: 'eur', name: 'Europe', type: 'checking', currency: 'EUR', balance: 200 },
    ])

    expect(data.accounts).toHaveLength(2)
    expect(data.aggregateBalance).toBeNull()
  })

  it('aggregates a single-currency balance', () => {
    const data = presentDashboardAccounts(usdAccounts)

    expect(data.aggregateBalance).toEqual({ currency: 'USD', balance: 2000.5 })
  })

  it('rejects non-finite balances', () => {
    const poisoned: DashboardAccount[] = [
      { id: 'bad', name: 'Bad', type: 'cash', currency: 'USD', balance: Number.NaN },
    ]
    expect(() => presentDashboardAccounts(poisoned)).toThrow()
  })
})