import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteTransactionsAction } from '@/actions/transaction/delete-transaction'

// ── Section: Hoisted mocks ─────────────────────────────────────────────────────

const { mockGetSession, mockHeaders, mockDeleteTransactions, mockRevalidatePath } = vi.hoisted(
  () => ({
    mockGetSession: vi.fn(),
    mockHeaders: vi.fn(),
    mockDeleteTransactions: vi.fn(),
    mockRevalidatePath: vi.fn(),
  }),
)

// ── Section: Module mocks ──────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}))

vi.mock('@/repository/transaction', () => ({
  deleteTransaction: vi.fn(),
  deleteTransactions: mockDeleteTransactions,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

// ── Section: Helpers ────────────────────────────────────────────────────────────

const MOCK_USER_ID = 'user-123'
const VALID_UUIDS = ['3f6f5f9e-8a2d-4c1b-9b4e-6d4f3c2a1b0c', '7a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d']

const AUTHENTICATED_SESSION = { user: { id: MOCK_USER_ID } }
const UNAUTHENTICATED_SESSION = { user: { id: null } }

// ── Section: Tests ──────────────────────────────────────────────────────────────

describe('deleteTransactionsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue(AUTHENTICATED_SESSION)
    mockDeleteTransactions.mockResolvedValue([{ id: VALID_UUIDS[0] }, { id: VALID_UUIDS[1] }])
  })

  it('rejects unauthenticated callers without touching the repository', async () => {
    mockGetSession.mockResolvedValue(UNAUTHENTICATED_SESSION)

    const result = await deleteTransactionsAction({ ids: VALID_UUIDS })

    expect(result).toMatchObject({ success: false, status: 401 })
    expect(mockDeleteTransactions).not.toHaveBeenCalled()
  })

  it('rejects an empty ids array', async () => {
    const result = await deleteTransactionsAction({ ids: [] })

    expect(result).toMatchObject({ success: false, status: 400 })
    expect(mockDeleteTransactions).not.toHaveBeenCalled()
  })

  it('rejects ids that are not UUIDs', async () => {
    const result = await deleteTransactionsAction({ ids: ['not-a-uuid'] })

    expect(result).toMatchObject({ success: false, status: 400 })
    expect(mockDeleteTransactions).not.toHaveBeenCalled()
  })

  it('deletes the owned transactions and reports the real deleted count', async () => {
    const result = await deleteTransactionsAction({ ids: VALID_UUIDS })

    expect(mockDeleteTransactions).toHaveBeenCalledWith(VALID_UUIDS, MOCK_USER_ID)
    expect(result).toMatchObject({ success: true, status: 200, count: 2 })
  })

  it('reports a count of 0 when the repository deleted nothing', async () => {
    mockDeleteTransactions.mockResolvedValue([])

    const result = await deleteTransactionsAction({ ids: VALID_UUIDS })

    expect(result).toMatchObject({ success: true, status: 200, count: 0 })
  })

  it('revalidates the transaction list after a successful deletion', async () => {
    await deleteTransactionsAction({ ids: VALID_UUIDS })

    expect(mockRevalidatePath).toHaveBeenCalledWith('/transaction')
  })

  it('returns 500 when the repository throws', async () => {
    mockDeleteTransactions.mockRejectedValue(new Error('db down'))

    const result = await deleteTransactionsAction({ ids: VALID_UUIDS })

    expect(result).toMatchObject({ success: false, status: 500 })
  })
})
