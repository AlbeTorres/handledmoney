import { beforeEach, describe, expect, it, vi } from 'vitest'
const { getSession, updateBudget, revalidatePath, headers } = vi.hoisted(() => ({ getSession: vi.fn(), updateBudget: vi.fn(), revalidatePath: vi.fn(), headers: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: { api: { getSession } } }))
vi.mock('@/repository/budget', () => ({ updateBudget }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('next/headers', () => ({ headers }))
import { updateBudgetAction } from '@/actions/budget/update-budget'
const id = '00000000-0000-0000-0000-000000000001'
describe('updateBudgetAction', () => { beforeEach(() => { vi.clearAllMocks(); headers.mockResolvedValue({}); getSession.mockResolvedValue({ user: { id: 'user-1' } }) }); it('requires authentication', async () => { getSession.mockResolvedValue(null); await expect(updateBudgetAction({ id, name: 'Plan' })).resolves.toMatchObject({ status: 401 }) }); it('uses authenticated ownership and revalidates the detail page', async () => { updateBudget.mockResolvedValue({ id }); await expect(updateBudgetAction({ id, endDate: new Date('2026-12-31') })).resolves.toMatchObject({ success: true }); expect(updateBudget).toHaveBeenCalledWith(expect.objectContaining({ id }), 'user-1'); expect(revalidatePath).toHaveBeenCalledWith(`/budget/${id}`) }) })
