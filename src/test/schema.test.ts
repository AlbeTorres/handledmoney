import { describe, expect, it } from 'vitest'
import type { SafeParseReturnType } from 'zod'
import {
  BudgetCalculationTypeEnum,
  BudgetMetadataSchema,
  BudgetStructureSchema,
  CreateBudgetSchema,
  UpdateBudgetSchema,
} from '@/lib/schema'

const incomeCategoryId = '9f7d1f5e-0a4f-4b8e-9a1c-2c3d4e5f6070'
const expenseCategoryId = 'b6a5f1d0-1a2b-4c3d-8e9f-0a1b2c3d4e5f'

function incomeGroup(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Income',
    calculationType: 'income' as const,
    sortOrder: 0,
    items: [{ categoryId: incomeCategoryId, plannedAmount: 5000 }],
    ...overrides,
  }
}

function outflowGroup(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Bills',
    calculationType: 'outflow' as const,
    sortOrder: 1,
    items: [{ categoryId: expenseCategoryId, plannedAmount: 3000 }],
    ...overrides,
  }
}

function validPlan(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Plan',
    startDate: '2026-08-01',
    endDate: null,
    groups: [incomeGroup(), outflowGroup()],
    ...overrides,
  }
}

function issues(result: SafeParseReturnType<unknown, unknown>) {
  return result.success ? [] : result.error.issues
}

describe('budget lifecycle schemas', () => {
  it('accepts a valid plan with income and outflow groups and a positive balance', () => {
    expect(CreateBudgetSchema.safeParse(validPlan()).success).toBe(true)
  })

  it('accepts an open-ended budget', () => {
    const result = CreateBudgetSchema.safeParse({ ...validPlan(), endDate: undefined })
    expect(result.success).toBe(true)
    expect(result.success && result.data.endDate).toBeUndefined()
  })

  it('accepts a zero balance', () => {
    const result = CreateBudgetSchema.safeParse({
      ...validPlan(),
      groups: [
        incomeGroup({ items: [{ categoryId: incomeCategoryId, plannedAmount: 3000 }] }),
        outflowGroup({ items: [{ categoryId: expenseCategoryId, plannedAmount: 3000 }] }),
      ],
    })
    expect(result.success).toBe(true)
  })

  it('accepts over-allocation (outflow exceeds income)', () => {
    const result = CreateBudgetSchema.safeParse({
      ...validPlan(),
      groups: [incomeGroup(), outflowGroup({ items: [{ categoryId: expenseCategoryId, plannedAmount: 8000 }] })],
    })
    expect(result.success).toBe(true)
  })

  it('rejects a reversed date range', () => {
    const result = CreateBudgetSchema.safeParse({ ...validPlan(), startDate: '2026-08-02', endDate: '2026-08-01' })
    expect(result.success).toBe(false)
    expect(issues(result).some(issue => issue.path.includes('endDate'))).toBe(true)
    expect(UpdateBudgetSchema.safeParse({ id: '00000000-0000-0000-0000-000000000001', startDate: '2026-08-02', endDate: '2026-08-01' }).success).toBe(false)
  })

  it('rejects a plan with no income group', () => {
    const result = CreateBudgetSchema.safeParse({ ...validPlan(), groups: [outflowGroup()] })
    expect(result.success).toBe(false)
    expect(issues(result).some(issue => issue.message === 'Add at least one income group with a category')).toBe(true)
  })

  it('rejects an income group without any item', () => {
    const result = CreateBudgetSchema.safeParse({ ...validPlan(), groups: [incomeGroup({ items: [] })] })
    expect(result.success).toBe(false)
    expect(issues(result).some(issue => issue.message === 'Add at least one income group with a category')).toBe(true)
  })

  it('rejects total income zero', () => {
    const result = CreateBudgetSchema.safeParse({
      ...validPlan(),
      groups: [incomeGroup({ items: [{ categoryId: incomeCategoryId, plannedAmount: 0 }] })],
    })
    expect(result.success).toBe(false)
    expect(issues(result).some(issue => issue.message === 'Planned income must be greater than zero')).toBe(true)
  })

  it('rejects a negative planned amount', () => {
    const result = CreateBudgetSchema.safeParse({
      ...validPlan(),
      groups: [incomeGroup({ items: [{ categoryId: incomeCategoryId, plannedAmount: -100 }] })],
    })
    expect(result.success).toBe(false)
    expect(issues(result).some(issue => issue.path.includes('plannedAmount'))).toBe(true)
  })

  it('rejects a duplicate category across groups', () => {
    const result = CreateBudgetSchema.safeParse({
      ...validPlan(),
      groups: [incomeGroup(), outflowGroup({ items: [{ categoryId: incomeCategoryId, plannedAmount: 100 }] })],
    })
    expect(result.success).toBe(false)
    expect(issues(result).some(issue => issue.message.includes('Category can only be used once per budget'))).toBe(true)
  })

  it('exposes the extracted metadata and structure schemas', () => {
    expect(BudgetMetadataSchema.safeParse({ name: 'Plan', startDate: '2026-08-01' }).success).toBe(true)
    expect(BudgetMetadataSchema.safeParse({ name: 'Plan', startDate: '2026-08-02', endDate: '2026-08-01' }).success).toBe(false)
    expect(BudgetStructureSchema.safeParse([incomeGroup()]).success).toBe(true)
    expect(BudgetStructureSchema.safeParse([outflowGroup()]).success).toBe(false)
  })

  it('limits calculation types to income and outflow', () => {
    expect(BudgetCalculationTypeEnum.options).toEqual(['income', 'outflow'])
  })
})


import { readFileSync } from 'node:fs'
describe('zero-based budget database constraints', () => {
  it('enforces a category only once per budget after backfill', () => {
    const migration = readFileSync('drizzle/0011_zero_based_budget_lifecycle.sql', 'utf8')
    expect(migration).toContain('budget_item_budget_category_unique')
    expect(migration).toContain('UPDATE \"budget_item\" SET \"budget_id\"')
  })
})
