import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateTransactionsCategoryAction } from '@/actions/transaction/update-transactions-category'

// ── Section: Hoisted mocks ─────────────────────────────────────────────────────
// vi.hoisted() guarantees the mock references exist before vi.mock factories run.
// ────────────────────────────────────────────────────────────────────────────────

const {
  mockGetSession,
  mockHeaders,
  mockGetCategoryById,
  mockUpdateTransactionsCategory,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockHeaders: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockUpdateTransactionsCategory: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

// ── Section: Module mocks ───────────────────────────────────────────────────────
// The real Zod schema is NOT mocked so validation behaves as in production.
// ────────────────────────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}))

vi.mock('@/repository/categories', () => ({
  getCategoryById: mockGetCategoryById,
}))

vi.mock('@/repository/transaction', () => ({
  updateTransactionsCategory: mockUpdateTransactionsCategory,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

// ── Section: Helpers ────────────────────────────────────────────────────────────

const MOCK_USER_ID = 'user-123'
const MOCK_CATEGORY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const MOCK_TX_IDS = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
]

const AUTHENTICATED_SESSION = { user: { id: MOCK_USER_ID } }
const UNAUTHENTICATED_SESSION = { user: { id: null } }

function setupSuccessfulDefaults() {
  mockGetSession.mockResolvedValue(AUTHENTICATED_SESSION)
  mockHeaders.mockResolvedValue({})
  mockGetCategoryById.mockResolvedValue({ id: MOCK_CATEGORY_ID, userId: MOCK_USER_ID })
  mockUpdateTransactionsCategory.mockResolvedValue(MOCK_TX_IDS.length)
  mockRevalidatePath.mockImplementation(() => {})
}

// ── Section: Tests ──────────────────────────────────────────────────────────────
// updateTransactionsCategoryAction({ categoryId, ids }): session → zod validation
// → category ownership → repo update → revalidatePath('/transaction') AND
// revalidatePath('/account') → { success, count }.
// ────────────────────────────────────────────────────────────────────────────────

describe('updateTransactionsCategoryAction', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    setupSuccessfulDefaults()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  // ── Authentication ─────────────────────────────────────────────────────────

  describe('authentication', () => {
    it('returns 401 when session has no user id', async () => {
      mockGetSession.mockResolvedValue(UNAUTHENTICATED_SESSION)

      const result = await updateTransactionsCategoryAction({
        categoryId: MOCK_CATEGORY_ID,
        ids: MOCK_TX_IDS,
      })

      expect(result).toEqual({ success: false, status: 401, message: 'Unauthorized' })
    })

    it('does not touch the repository when unauthorized', async () => {
      mockGetSession.mockResolvedValue(null)

      await updateTransactionsCategoryAction({ categoryId: MOCK_CATEGORY_ID, ids: MOCK_TX_IDS })

      expect(mockGetCategoryById).not.toHaveBeenCalled()
      expect(mockUpdateTransactionsCategory).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  // ── Payload validation ─────────────────────────────────────────────────────

  describe('payload validation', () => {
    it('returns 400 for a categoryId that is not a uuid', async () => {
      const result = await updateTransactionsCategoryAction({
        categoryId: 'not-a-uuid',
        ids: MOCK_TX_IDS,
      })

      expect(result).toEqual({ success: false, status: 400, message: 'Invalid fields' })
      expect(mockUpdateTransactionsCategory).not.toHaveBeenCalled()
    })

    it('returns 400 for non-uuid ids', async () => {
      const result = await updateTransactionsCategoryAction({
        categoryId: MOCK_CATEGORY_ID,
        ids: ['not-a-uuid'],
      })

      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      expect(mockUpdateTransactionsCategory).not.toHaveBeenCalled()
    })

    it('returns success with count 0 for an empty ids array (no rows match)', async () => {
      mockUpdateTransactionsCategory.mockResolvedValue(0)

      const result = await updateTransactionsCategoryAction({
        categoryId: MOCK_CATEGORY_ID,
        ids: [],
      })

      expect(result.success).toBe(true)
      expect(result.count).toBe(0)
    })
  })

  // ── Category ownership ─────────────────────────────────────────────────────

  describe('category ownership', () => {
    it('returns 404 when the category does not belong to the user', async () => {
      mockGetCategoryById.mockResolvedValue(null)

      const result = await updateTransactionsCategoryAction({
        categoryId: MOCK_CATEGORY_ID,
        ids: MOCK_TX_IDS,
      })

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Category not found',
      })
      expect(mockUpdateTransactionsCategory).not.toHaveBeenCalled()
    })

    it('looks up the category with the session userId', async () => {
      await updateTransactionsCategoryAction({ categoryId: MOCK_CATEGORY_ID, ids: MOCK_TX_IDS })

      expect(mockGetCategoryById).toHaveBeenCalledWith(MOCK_CATEGORY_ID, MOCK_USER_ID)
    })
  })

  // ── Success ────────────────────────────────────────────────────────────────

  describe('successful update', () => {
    it('calls the repository with (categoryId, ids, userId)', async () => {
      await updateTransactionsCategoryAction({ categoryId: MOCK_CATEGORY_ID, ids: MOCK_TX_IDS })

      expect(mockUpdateTransactionsCategory).toHaveBeenCalledTimes(1)
      expect(mockUpdateTransactionsCategory).toHaveBeenCalledWith(
        MOCK_CATEGORY_ID,
        MOCK_TX_IDS,
        MOCK_USER_ID,
      )
    })

    it('revalidates both /transaction and /account', async () => {
      await updateTransactionsCategoryAction({ categoryId: MOCK_CATEGORY_ID, ids: MOCK_TX_IDS })

      expect(mockRevalidatePath).toHaveBeenCalledWith('/transaction')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/account')
    })

    it('returns the updated row count', async () => {
      mockUpdateTransactionsCategory.mockResolvedValue(2)

      const result = await updateTransactionsCategoryAction({
        categoryId: MOCK_CATEGORY_ID,
        ids: MOCK_TX_IDS,
      })

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Category updated successfully',
        count: 2,
      })
    })
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('returns 500 when the repository throws', async () => {
      mockUpdateTransactionsCategory.mockRejectedValue(new Error('DB connection failed'))

      const result = await updateTransactionsCategoryAction({
        categoryId: MOCK_CATEGORY_ID,
        ids: MOCK_TX_IDS,
      })

      expect(result).toEqual({ success: false, status: 500, message: 'Something went wrong' })
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('returns 500 when the category lookup throws', async () => {
      mockGetCategoryById.mockRejectedValue(new Error('DB connection failed'))

      const result = await updateTransactionsCategoryAction({
        categoryId: MOCK_CATEGORY_ID,
        ids: MOCK_TX_IDS,
      })

      expect(result.success).toBe(false)
      expect(result.status).toBe(500)
      expect(mockUpdateTransactionsCategory).not.toHaveBeenCalled()
    })
  })
})
