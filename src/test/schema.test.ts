import { describe, expect, it } from 'vitest'
import { BudgetCalculationTypeEnum, CreateBudgetSchema, UpdateBudgetSchema } from '@/lib/schema'

describe('budget lifecycle schemas', () => {
  it('accepts an open-ended budget', () => {
    const result = CreateBudgetSchema.safeParse({ name: 'Current plan', startDate: '2026-08-01' })
    expect(result.success).toBe(true)
    expect(result.success && result.data.endDate).toBeUndefined()
  })

  it('rejects a reversed date range', () => {
    expect(CreateBudgetSchema.safeParse({ name: 'Invalid', startDate: '2026-08-02', endDate: '2026-08-01' }).success).toBe(false)
    expect(UpdateBudgetSchema.safeParse({ id: '00000000-0000-0000-0000-000000000001', startDate: '2026-08-02', endDate: '2026-08-01' }).success).toBe(false)
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
