import {
  arePlansEqual,
  createTemplateGroups,
  normalizePlan,
  starterTemplateGroups,
  type NormalizedPlan,
} from '@/lib/budget-plan-templates'
import { describe, expect, it } from 'vitest'

describe('budget plan templates', () => {
  it('defines the starter plan and a blank plan', () => {
    expect(starterTemplateGroups).toHaveLength(6)
    expect(starterTemplateGroups.map(group => group.name)).toEqual([
      'Income',
      'Bills',
      'Variable Expenses',
      'Debt',
      'Savings',
      'Investments',
    ])
    expect(createTemplateGroups('blank')).toEqual([
      { name: 'Income', calculationType: 'income', sortOrder: 0, items: [] },
    ])
  })

  it('returns fresh nested values for every starter factory call', () => {
    const first = createTemplateGroups('starter')
    const second = createTemplateGroups('starter')

    first[0].name = 'Changed'
    first[0].items.push({ categoryId: 'category-1', plannedAmount: 20 })

    expect(second[0].name).toBe('Income')
    expect(second[0].items).toEqual([])
    expect(first[0]).not.toBe(second[0])
    expect(first[0].items).not.toBe(second[0].items)
    expect(starterTemplateGroups[0].name).toBe('Income')
    expect(starterTemplateGroups[0].items).toEqual([])
  })

  it('returns a fresh Income-only group for every blank factory call', () => {
    const first = createTemplateGroups('blank')
    const second = createTemplateGroups('blank')

    first[0].name = 'Changed'
    first[0].items.push({ categoryId: 'category-1', plannedAmount: 20 })

    expect(second[0].name).toBe('Income')
    expect(second[0].items).toEqual([])
    expect(first[0]).not.toBe(second[0])
    expect(first[0].items).not.toBe(second[0].items)
  })

  it('both templates start with at least one income group', () => {
    expect(createTemplateGroups('starter').some(group => group.calculationType === 'income')).toBe(true)
    expect(createTemplateGroups('blank').some(group => group.calculationType === 'income')).toBe(true)
  })

  it('normalizes ordered values without React Hook Form identifiers or metadata', () => {
    expect(
      normalizePlan([
        {
          id: 'rhf-group-id',
          name: 'Bills',
          calculationType: 'outflow',
          sortOrder: 8,
          untouched: true,
          items: [
            {
              id: 'rhf-item-id',
              categoryId: 'category-1',
              plannedAmount: 42,
              touched: true,
            },
          ],
        },
      ]),
    ).toEqual([
      {
        name: 'Bills',
        calculationType: 'outflow',
        sortOrder: 0,
        items: [{ categoryId: 'category-1', plannedAmount: 42 }],
      },
    ])
  })

  it('arePlansEqual returns true for identical normalized plans', () => {
    const left = normalizePlan(createTemplateGroups('starter'))
    const right = normalizePlan(createTemplateGroups('starter'))
    expect(arePlansEqual(left, right)).toBe(true)
    expect(arePlansEqual([], [])).toBe(true)
  })

  it('arePlansEqual ignores React Hook Form identifiers and metadata after normalization', () => {
    const clean = normalizePlan(createTemplateGroups('starter'))
    const dirty = normalizePlan([
      {
        id: 'rhf-group-id',
        name: 'Income',
        calculationType: 'income',
        sortOrder: 99,
        untouched: true,
        items: [],
      },
      ...createTemplateGroups('starter').slice(1).map((group, index) => ({
        ...group,
        id: `rhf-group-${index}`,
      })),
    ])
    expect(arePlansEqual(clean, dirty)).toBe(true)
  })

  it('arePlansEqual returns false when a group name differs', () => {
    const left = normalizePlan(createTemplateGroups('starter'))
    const right = normalizePlan(createTemplateGroups('starter'))
    right[0].name = 'Salary Income'
    expect(arePlansEqual(left, right)).toBe(false)
  })

  it('arePlansEqual returns false when a group calculation type or sort order differs', () => {
    const left = normalizePlan(createTemplateGroups('starter'))
    const right = normalizePlan(createTemplateGroups('starter'))
    right[0].calculationType = 'outflow'
    expect(arePlansEqual(left, right)).toBe(false)

    right[0].calculationType = 'income'
    right[0].sortOrder = 1
    expect(arePlansEqual(left, right)).toBe(false)
  })

  it('arePlansEqual returns false when items differ by category or amount', () => {
    const left = normalizePlan(createTemplateGroups('starter'))
    const right = normalizePlan(createTemplateGroups('starter'))
    left[0].items.push({ categoryId: 'category-1', plannedAmount: 100 })
    right[0].items.push({ categoryId: 'category-1', plannedAmount: 100 })
    expect(arePlansEqual(left, right)).toBe(true)

    right[0].items[0].plannedAmount = 200
    expect(arePlansEqual(left, right)).toBe(false)

    right[0].items[0].plannedAmount = 100
    right[0].items[0].categoryId = 'category-2'
    expect(arePlansEqual(left, right)).toBe(false)
  })

  it('arePlansEqual returns false when item or group counts differ', () => {
    const left = normalizePlan(createTemplateGroups('starter'))
    const right = normalizePlan(createTemplateGroups('starter'))
    left[0].items.push({ categoryId: 'category-1', plannedAmount: 100 })
    expect(arePlansEqual(left, right)).toBe(false)

    const extraGroup: NormalizedPlan = [
      ...normalizePlan(createTemplateGroups('starter')),
      { name: 'Extra', calculationType: 'outflow', sortOrder: 6, items: [] },
    ]
    expect(arePlansEqual(normalizePlan(createTemplateGroups('starter')), extraGroup)).toBe(false)
  })

  it('arePlansEqual returns false when items are in a different order', () => {
    const left = normalizePlan(createTemplateGroups('blank'))
    const right = normalizePlan(createTemplateGroups('blank'))
    left[0].items.push(
      { categoryId: 'category-1', plannedAmount: 10 },
      { categoryId: 'category-2', plannedAmount: 20 },
    )
    right[0].items.push(
      { categoryId: 'category-2', plannedAmount: 20 },
      { categoryId: 'category-1', plannedAmount: 10 },
    )
    expect(arePlansEqual(left, right)).toBe(false)
  })
})
