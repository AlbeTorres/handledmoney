import { beforeEach, describe, expect, it, vi } from 'vitest'
const { getSession, createBudget, revalidatePath, headers } = vi.hoisted(() => ({ getSession: vi.fn(), createBudget: vi.fn(), revalidatePath: vi.fn(), headers: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession } } }))
vi.mock('@/repository/budget', () => ({ createBudget }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('next/headers', () => ({ headers }))
import { createBudgetAction } from '@/actions/budget/create-budget'
describe('createBudgetAction', () => { beforeEach(() => { vi.clearAllMocks(); headers.mockResolvedValue({}); getSession.mockResolvedValue({ user: { id: 'user-1' } }) }); it('rejects unauthenticated users', async () => { getSession.mockResolvedValue(null); await expect(createBudgetAction({ name: 'Plan', startDate: new Date() })).resolves.toMatchObject({ status: 401 }) }); it('passes lifecycle values with the authenticated owner', async () => { createBudget.mockResolvedValue({ id: 'budget-1' }); await expect(createBudgetAction({ name: 'Plan', startDate: new Date('2026-01-01'), endDate: null })).resolves.toMatchObject({ success: true, status: 201 }); expect(createBudget).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1', name: 'Plan' })); expect(revalidatePath).toHaveBeenCalledWith('/budget') }) })
