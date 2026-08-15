import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSession, createBudget, revalidatePath, headers } = vi.hoisted(() => ({ getSession: vi.fn(), createBudget: vi.fn(), revalidatePath: vi.fn(), headers: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession } } }))
vi.mock('@/repository/budget', () => ({ createBudget }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('next/headers', () => ({ headers }))

import { createBudgetAction } from '@/actions/budget/create-budget'
import { initialGroups } from '@/components/CreateBudgetForm'

const draft = {
  name: 'Plan',
  startDate: new Date('2026-01-01'),
  endDate: null,
  groups: [
    {
      name: 'Income',
      calculationType: 'income' as const,
      sortOrder: 0,
      items: [{ categoryId: '9f7d1f5e-0a4f-4b8e-9a1c-2c3d4e5f6070', plannedAmount: 5000 }],
    },
  ],
}

describe('createBudgetAction', () => {
  beforeEach(() => { vi.clearAllMocks(); headers.mockResolvedValue({}); getSession.mockResolvedValue({ user: { id: 'user-1' } }) })
  it('rejects unauthenticated users', async () => { getSession.mockResolvedValue(null); await expect(createBudgetAction(draft)).resolves.toMatchObject({ status: 401 }) })
  it('rejects unknown malformed input before reaching the repository', async () => {
    await expect(createBudgetAction({ name: 'Plan' })).resolves.toMatchObject({ success: false, status: 400 })
    expect(createBudget).not.toHaveBeenCalled()
  })
  it('rejects a draft with no groups before reaching the repository', async () => {
    await expect(createBudgetAction({ ...draft, groups: [] })).resolves.toMatchObject({ success: false, status: 400 })
    expect(createBudget).not.toHaveBeenCalled()
  })
  it('rejects a plan with no income group before reaching the repository', async () => {
    const noIncome = { ...draft, groups: [{ name: 'Outflow', calculationType: 'outflow' as const, sortOrder: 0, items: [{ categoryId: '981dfbd9-4a5b-438e-bc92-5ad5fa6466c2', plannedAmount: 100 }] }] }
    await expect(createBudgetAction(noIncome)).resolves.toMatchObject({ success: false, status: 400 })
    expect(createBudget).not.toHaveBeenCalled()
  })
  it('rejects a plan with a negative amount before reaching the repository', async () => {
    const negative = { ...draft, groups: [{ name: 'Income', calculationType: 'income' as const, sortOrder: 0, items: [{ categoryId: '9f7d1f5e-0a4f-4b8e-9a1c-2c3d4e5f6070', plannedAmount: -500 }] }] }
    await expect(createBudgetAction(negative)).resolves.toMatchObject({ success: false, status: 400 })
    expect(createBudget).not.toHaveBeenCalled()
  })
  it('rejects a plan with reversed dates before reaching the repository', async () => {
    const reversed = { ...draft, startDate: new Date('2026-02-01'), endDate: new Date('2026-01-01') }
    await expect(createBudgetAction(reversed)).resolves.toMatchObject({ success: false, status: 400 })
    expect(createBudget).not.toHaveBeenCalled()
  })
  it('rejects a plan with an income group but no category before reaching the repository', async () => {
    const noCategory = { ...draft, groups: [{ name: 'Income', calculationType: 'income' as const, sortOrder: 0, items: [] }] }
    await expect(createBudgetAction(noCategory)).resolves.toMatchObject({ success: false, status: 400 })
    expect(createBudget).not.toHaveBeenCalled()
  })
  it('rejects a plan with total income zero before reaching the repository', async () => {
    const zeroIncome = { ...draft, groups: [{ name: 'Income', calculationType: 'income' as const, sortOrder: 0, items: [{ categoryId: '9f7d1f5e-0a4f-4b8e-9a1c-2c3d4e5f6070', plannedAmount: 0 }] }] }
    await expect(createBudgetAction(zeroIncome)).resolves.toMatchObject({ success: false, status: 400 })
    expect(createBudget).not.toHaveBeenCalled()
  })
  it('passes the complete draft with the authenticated owner', async () => {
    createBudget.mockResolvedValue({ id: 'budget-1' })
    await expect(createBudgetAction(draft)).resolves.toMatchObject({ success: true, status: 201, data: { id: 'budget-1' } })
    expect(createBudget).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', name: 'Plan', groups: draft.groups }))
    expect(revalidatePath).toHaveBeenCalledWith('/budget')
  })
})

describe('budget draft template', () => {
  it('starts from exactly the six editable current groups', () => {
    expect(initialGroups.map(group => group.name)).toEqual(['Income', 'Bills', 'Variable Expenses', 'Debt', 'Savings', 'Investments'])
  })
})
