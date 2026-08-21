import { getCurrentBudgetAction } from '@/data-access/get-current-budget'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getCurrentBudget: vi.fn(),
  headers: vi.fn(),
}))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mocks.getSession } } }))
vi.mock('@/repository/budget', () => ({ getCurrentBudget: mocks.getCurrentBudget }))
vi.mock('next/headers', () => ({ headers: mocks.headers }))

describe('getCurrentBudgetAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.headers.mockResolvedValue({})
    mocks.getSession.mockResolvedValue({ user: { id: 'user-1' } })
  })
  it('returns the authenticated user current selection', async () => {
    mocks.getCurrentBudget.mockResolvedValue({ budgetId: 'budget-1' })
    await expect(getCurrentBudgetAction()).resolves.toMatchObject({
      success: true,
      data: { budgetId: 'budget-1' },
    })
    expect(mocks.getCurrentBudget).toHaveBeenCalledWith('user-1')
  })
})
