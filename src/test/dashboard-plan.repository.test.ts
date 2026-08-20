import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
}))

vi.mock('@/db', () => ({
  db: {
    query: {
      currentBudgetsTable: { findFirst: mocks.findFirst },
    },
  },
}))

vi.mock('drizzle-orm', async importOriginal => ({
  ...(await importOriginal<typeof import('drizzle-orm')>()),
  eq: (column: unknown, value: unknown) => ({ operator: 'eq', column, value }),
}))

import { getDashboardPlan } from '@/repository/dashboard/budget'

const selection = {
  userId: 'user-1',
  budgetId: 'budget-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  budget: {
    id: 'budget-1',
    userId: 'user-1',
    name: 'Household budget',
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    groups: [
      {
        id: 'g2',
        budgetId: 'budget-1',
        name: 'Essentials',
        calculationType: 'outflow' as const,
        sortOrder: 1,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        items: [
          {
            id: 'i2',
            budgetId: 'budget-1',
            groupId: 'g2',
            categoryId: 'rent',
            name: 'Rent',
            plannedAmount: '800.00',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            category: { id: 'rent', name: 'Rent' },
          },
          {
            id: 'i3',
            budgetId: 'budget-1',
            groupId: 'g2',
            categoryId: 'archived-cat',
            name: 'Old food',
            plannedAmount: '100.00',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            category: { id: 'archived-cat', name: 'Food (archived)' },
          },
        ],
      },
      {
        id: 'g1',
        budgetId: 'budget-1',
        name: 'Income',
        calculationType: 'income' as const,
        sortOrder: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        items: [
          {
            id: 'i1',
            budgetId: 'budget-1',
            groupId: 'g1',
            categoryId: 'salary',
            name: 'Salary',
            plannedAmount: '1000.00',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            category: { id: 'salary', name: 'Salary' },
          },
        ],
      },
    ],
  },
}

describe('getDashboardPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.findFirst.mockResolvedValue(selection)
  })

  it('reads only the owner current budget with ordered groups and raw monthly totals', async () => {
    const result = await getDashboardPlan('user-1')

    expect(result?.id).toBe('budget-1')
    expect(result?.name).toBe('Household budget')
    expect(result?.incomePlanned).toBe(1000)
    expect(result?.expensePlanned).toBe(900)
    // Groups come back ordered by sortOrder even though the source was unsorted.
    expect(result?.groups.map(group => [group.id, group.sortOrder])).toEqual([
      ['g1', 0],
      ['g2', 1],
    ])
    expect(result?.groups[1].categories.map(category => category.planned)).toEqual([800, 100])

    const args = mocks.findFirst.mock.calls[0][0] as {
      where: { value: string }
      with: {
        budget: {
          with: {
            groups: {
              orderBy: unknown
              with: { items: { with: { category: boolean } } }
            }
          }
        }
      }
    }
    expect(args.where.value).toBe('user-1')
    expect(typeof args.with.budget.with.groups.orderBy).toBe('function')
    expect(args.with.budget.with.groups.with.items.with.category).toBe(true)
  })

  it('retains archived category display context through the category join', async () => {
    const result = await getDashboardPlan('user-1')

    const archivedItem = result?.groups.find(group => group.id === 'g2')?.categories.find(category => category.categoryId === 'archived-cat')
    expect(archivedItem).toMatchObject({ name: 'Food (archived)', planned: 100 })
  })

  it('normalizes planned amounts to finite numbers', async () => {
    const result = await getDashboardPlan('user-1')

    expect(result?.groups[0].categories[0].planned).toBe(1000)
    expect(result?.groups[1].categories[0].planned).toBe(800)
  })

  it('returns an explicit empty state when no current selection exists', async () => {
    mocks.findFirst.mockResolvedValue(undefined)
    await expect(getDashboardPlan('user-1')).resolves.toBeNull()
  })

  it('returns an explicit empty state when the selection has no budget', async () => {
    mocks.findFirst.mockResolvedValue({ ...selection, budget: null })
    await expect(getDashboardPlan('user-1')).resolves.toBeNull()
  })

  it('returns an explicit empty state when the selected budget is not owned by the caller', async () => {
    mocks.findFirst.mockResolvedValue({
      ...selection,
      budget: { ...selection.budget, userId: 'another-user' },
    })
    await expect(getDashboardPlan('user-1')).resolves.toBeNull()
    expect(mocks.findFirst).toHaveBeenCalledTimes(1)
  })
})