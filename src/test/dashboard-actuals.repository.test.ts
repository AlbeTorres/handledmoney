import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  from: vi.fn(),
  leftJoin: vi.fn(),
  where: vi.fn(),
  groupBy: vi.fn(),
  rows: [] as unknown[],
}))

vi.mock('@/db', () => ({
  db: { select: mocks.select },
}))

vi.mock('drizzle-orm', async importOriginal => ({
  ...(await importOriginal<typeof import('drizzle-orm')>()),
  and: (...conditions: unknown[]) => ({ operator: 'and', conditions }),
  eq: (column: unknown, value: unknown) => ({ operator: 'eq', column, value }),
  gte: (column: unknown, value: unknown) => ({ operator: 'gte', column, value }),
  lt: (column: unknown, value: unknown) => ({ operator: 'lt', column, value }),
  isNull: (column: unknown) => ({ operator: 'isNull', column }),
}))

import { getDashboardActuals } from '@/repository/dashboard/actuals'

describe('getDashboardActuals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rows = []
    mocks.select.mockReturnValue({
      from: mocks.from,
      leftJoin: mocks.leftJoin,
      where: mocks.where,
      groupBy: mocks.groupBy,
    })
    mocks.from.mockImplementation(() => ({
      leftJoin: mocks.leftJoin,
      where: mocks.where,
      groupBy: mocks.groupBy,
    }))
    mocks.leftJoin.mockImplementation(() => ({ where: mocks.where, groupBy: mocks.groupBy }))
    mocks.where.mockImplementation(() => ({ groupBy: mocks.groupBy }))
    mocks.groupBy.mockImplementation(() => Promise.resolve(mocks.rows))
  })

  const range = {
    start: new Date('2026-02-01T00:00:00.000Z'),
    nextStart: new Date('2026-03-01T00:00:00.000Z'),
  }

  it('uses bound owner, range and soft-delete predicates with category/type/month aggregation', async () => {
    await getDashboardActuals('user-1', range)

    expect(mocks.from).toHaveBeenCalledOnce()
    expect(mocks.leftJoin).toHaveBeenCalledOnce()
    const whereArg = mocks.where.mock.calls[0][0] as { operator: string; conditions: Array<{ operator: string; value?: unknown }> }
    expect(whereArg.operator).toBe('and')
    expect(whereArg.conditions.map(condition => condition.operator)).toEqual(['eq', 'gte', 'lt', 'isNull'])
    expect(whereArg.conditions[0].value).toBe('user-1')
    expect(whereArg.conditions[1].value).toBe(range.start)
    expect(whereArg.conditions[2].value).toBe(range.nextStart)
    expect(mocks.groupBy).toHaveBeenCalledOnce()
  })

  it('never selects transaction rows, only the aggregate columns', async () => {
    await getDashboardActuals('user-1', range)

    const columns = Object.keys(mocks.select.mock.calls[0][0])
    expect(columns).toEqual(['categoryId', 'categoryName', 'type', 'month', 'total'])
  })

  it('joins categories without an archived filter to retain archived display context', async () => {
    await getDashboardActuals('user-1', range)

    const join = mocks.leftJoin.mock.calls[0]
    expect(join[0]).toBeDefined()
    expect(join[1]).toMatchObject({ operator: 'eq' })
    // The WHERE carries exactly the four owner/range/soft-delete predicates; an
    // archivedAt predicate would appear here as a fifth condition.
    const whereArg = mocks.where.mock.calls[0][0] as { conditions: unknown[] }
    expect(whereArg.conditions).toHaveLength(4)
  })

  it('normalizes aggregate sums to finite numbers and keeps null categories', async () => {
    mocks.rows = [
      { categoryId: 'salary', categoryName: 'Salary', type: 'income', month: 0, total: '1200.00' },
      { categoryId: null, categoryName: null, type: 'expense', month: 5, total: '25.50' },
    ]

    const result = await getDashboardActuals('user-1', range)

    expect(result).toEqual([
      { categoryId: 'salary', categoryName: 'Salary', type: 'income', month: 0, total: 1200 },
      { categoryId: null, categoryName: null, type: 'expense', month: 5, total: 25.5 },
    ])
  })

  it('normalizes non-finite sums defensively', async () => {
    mocks.rows = [
      { categoryId: null, categoryName: null, type: 'expense', month: 2, total: 'Infinity' },
    ]

    const result = await getDashboardActuals('user-1', range)

    expect(result[0].total).toBe(0)
  })
})