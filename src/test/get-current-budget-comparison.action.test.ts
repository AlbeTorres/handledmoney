import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), headers: vi.fn(), getComparison: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mocks.getSession } } }))
vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('@/repository/budget', () => ({ getCurrentBudgetComparison: mocks.getComparison }))

import { getCurrentBudgetComparisonAction } from '@/data-access/get-current-budget-comparison'

describe('getCurrentBudgetComparisonAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.headers.mockResolvedValue({})
    mocks.getSession.mockResolvedValue({ user: { id: 'user-1' } })
  })

  it('returns only the authenticated user comparison', async () => {
    mocks.getComparison.mockResolvedValue({ budget: { id: 'budget-1' } })
    await expect(getCurrentBudgetComparisonAction()).resolves.toMatchObject({
      success: true,
      data: { budget: { id: 'budget-1' } },
    })
    expect(mocks.getComparison).toHaveBeenCalledWith('user-1')
  })

  it('rejects unauthenticated requests', async () => {
    mocks.getSession.mockResolvedValue(null)
    await expect(getCurrentBudgetComparisonAction()).resolves.toMatchObject({
      success: false,
      status: 401,
    })
    expect(mocks.getComparison).not.toHaveBeenCalled()
  })
})
