import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  rows: [] as unknown[],
}))

vi.mock('@/db', () => ({
  db: { select: mocks.select },
}))

vi.mock('drizzle-orm', async importOriginal => ({
  ...(await importOriginal<typeof import('drizzle-orm')>()),
  and: (...conditions: unknown[]) => ({ operator: 'and', conditions }),
  eq: (column: unknown, value: unknown) => ({ operator: 'eq', column, value }),
  isNull: (column: unknown) => ({ operator: 'isNull', column }),
}))

import { getDashboardAccounts } from '@/repository/dashboard/accounts'

describe('getDashboardAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rows = []
    mocks.select.mockReturnValue({ from: mocks.from, where: mocks.where })
    mocks.from.mockImplementation(() => ({ where: mocks.where }))
    mocks.where.mockImplementation(() => Promise.resolve(mocks.rows))
  })

  it('filters exactly by user_id and deleted_at IS NULL without an invented predicate', async () => {
    mocks.rows = [
      { id: 'a1', name: 'Cash', type: 'cash', currency: 'USD', balance: '500.00' },
    ]

    const result = await getDashboardAccounts('user-1')

    expect(result).toEqual([
      { id: 'a1', name: 'Cash', type: 'cash', currency: 'USD', balance: 500 },
    ])

    const whereArg = mocks.where.mock.calls[0][0] as {
      operator: string
      conditions: Array<{ operator: string; value?: unknown }>
    }
    expect(whereArg.operator).toBe('and')
    expect(whereArg.conditions.map(condition => condition.operator)).toEqual(['eq', 'isNull'])
    expect(whereArg.conditions[0].value).toBe('user-1')
  })

  it('selects only the presentation columns', async () => {
    await getDashboardAccounts('user-1')

    expect(Object.keys(mocks.select.mock.calls[0][0])).toEqual(['id', 'name', 'type', 'currency', 'balance'])
  })

  it('normalizes balances to finite numbers', async () => {
    mocks.rows = [
      { id: 'a1', name: 'Cash', type: 'cash', currency: 'USD', balance: '500.00' },
      { id: 'a2', name: 'Broken', type: 'checking', currency: 'USD', balance: 'Infinity' },
    ]

    const result = await getDashboardAccounts('user-1')

    expect(result[0].balance).toBe(500)
    expect(result[1].balance).toBe(0)
  })

  it('returns an empty state as an empty array', async () => {
    await expect(getDashboardAccounts('user-1')).resolves.toEqual([])
  })
})