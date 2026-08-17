import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ getSession: vi.fn(), headers: vi.fn(), getSnapshot: vi.fn(), buildViewModel: vi.fn() }))

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: mocks.getSession } } }))
vi.mock('next/headers', () => ({ headers: mocks.headers }))
vi.mock('@/repository/dashboard', () => ({ getDashboardSnapshot: mocks.getSnapshot }))
vi.mock('@/lib/finance-data', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/finance-data')>(),
  buildDashboardViewModel: mocks.buildViewModel,
}))

import { getDashboardData } from '@/actions/dashboard/get-dashboard-data'

describe('getDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.headers.mockResolvedValue({})
    mocks.getSession.mockResolvedValue({ user: { id: 'caller-1' } })
    mocks.getSnapshot.mockResolvedValue({ snapshot: true })
    mocks.buildViewModel.mockReturnValue({ period: { mode: 'monthly', year: 2026, month: 0 } })
  })

  it('returns UNAUTHENTICATED without reading a snapshot', async () => {
    mocks.getSession.mockResolvedValue(null)

    await expect(getDashboardData({ mode: 'monthly', year: 2026, month: 0 })).resolves.toEqual({ ok: false, code: 'UNAUTHENTICATED' })
    expect(mocks.getSnapshot).not.toHaveBeenCalled()
  })

  it.each([
    { mode: 'monthly', year: 2026 },
    { mode: 'monthly', year: 2026, month: 12 },
    { mode: 'annual', year: 2026, month: 0 },
    { mode: 'annual', year: 2026.5 },
    { mode: 'annual', year: 2026, userId: 'other-user' },
    { mode: 'annual', year: 2026, timeZone: 'UTC' },
  ])('returns INVALID_PERIOD for invalid client input %#', async input => {
    await expect(getDashboardData(input)).resolves.toEqual({ ok: false, code: 'INVALID_PERIOD' })
    expect(mocks.getSnapshot).not.toHaveBeenCalled()
  })

  it('derives the repository scope only from the authenticated caller', async () => {
    const input = { mode: 'monthly' as const, year: 2026, month: 0 }
    const snapshot = { snapshot: true }
    mocks.getSnapshot.mockResolvedValue(snapshot)

    await expect(getDashboardData(input)).resolves.toEqual({ ok: true, data: { period: input } })
    expect(mocks.getSnapshot).toHaveBeenCalledWith('caller-1', input)
    expect(mocks.buildViewModel).toHaveBeenCalledWith(snapshot, input)
  })

  it('maps repository failures to the non-sensitive UNAVAILABLE result', async () => {
    mocks.getSnapshot.mockRejectedValue(new Error('database connection details'))

    await expect(getDashboardData({ mode: 'annual', year: 2026 })).resolves.toEqual({ ok: false, code: 'UNAVAILABLE' })
  })
})
