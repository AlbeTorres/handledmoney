import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getSession, selectCurrentBudget, revalidatePath, headers } = vi.hoisted(() => ({
  getSession: vi.fn(), selectCurrentBudget: vi.fn(), revalidatePath: vi.fn(), headers: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession } } }))
vi.mock('@/repository/budget', () => ({ selectCurrentBudget }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('next/headers', () => ({ headers }))
import { selectCurrentBudgetAction } from '@/actions/budget/select-current-budget'

describe('selectCurrentBudgetAction', () => {
  beforeEach(() => { vi.clearAllMocks(); headers.mockResolvedValue({}); getSession.mockResolvedValue({ user: { id: 'user-1' } }) })
  it('rejects unauthenticated selection', async () => {
    getSession.mockResolvedValue(null)
    await expect(selectCurrentBudgetAction('budget-1')).resolves.toMatchObject({ success: false, status: 401 })
  })
  it('delegates selection with the authenticated user and revalidates consumers', async () => {
    selectCurrentBudget.mockResolvedValue({ userId: 'user-1', budgetId: 'budget-1' })
    await expect(selectCurrentBudgetAction('budget-1')).resolves.toMatchObject({ success: true, status: 200 })
    expect(selectCurrentBudget).toHaveBeenCalledWith('budget-1', 'user-1')
    expect(revalidatePath).toHaveBeenCalledWith('/budget')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })
  it('does not replace a selection for a foreign budget', async () => {
    selectCurrentBudget.mockResolvedValue(undefined)
    await expect(selectCurrentBudgetAction('foreign-budget')).resolves.toMatchObject({ success: false, status: 404 })
  })
})
