import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), duplicateBudget: vi.fn(), revalidatePath: vi.fn(), headers: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mocks.getSession } } }))
vi.mock('@/repository/budget', () => ({ duplicateBudget: mocks.duplicateBudget }))
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock('next/headers', () => ({ headers: mocks.headers }))

import { duplicateBudgetAction } from '@/actions/budget/duplicate-budget'

describe('duplicateBudgetAction', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.headers.mockResolvedValue({}); mocks.getSession.mockResolvedValue({ user: { id: 'user-1' } }) })
  it('duplicates only the authenticated user budget', async () => {
    mocks.duplicateBudget.mockResolvedValue({ id: 'new-budget' })
    const values = { id: '00000000-0000-0000-0000-000000000001', startDate: new Date('2026-01-01') }
    await expect(duplicateBudgetAction(values)).resolves.toMatchObject({ success: true, status: 201 })
    expect(mocks.duplicateBudget).toHaveBeenCalledWith(expect.objectContaining(values), 'user-1')
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/budget')
  })
})
