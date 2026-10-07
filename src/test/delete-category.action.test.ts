import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { deleteCategoryAction } from '@/actions/category/delete-category'

// ── Section: Hoisted mocks ──────────────────────────────────────────────────────
//
// We hoist all mock definitions using vi.hoisted() so they are available before
// any vi.mock() calls. This is a vitest requirement — vi.mock() is hoisted to
// the top of the file automatically, so mocks must be defined with vi.hoisted().
// ────────────────────────────────────────────────────────────────────────────────

const {
  mockDeleteCategory,
  mockGetCategoryById,
  mockGetSession,
  mockHeaders,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockDeleteCategory: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockGetSession: vi.fn(),
  mockHeaders: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

// ── Section: Module mocks ───────────────────────────────────────────────────────
//
// Mock every external dependency that deleteCategoryAction imports.
// We do NOT mock the action itself — we let the real logic run against our
// mocked dependencies to achieve true branch coverage.
// ────────────────────────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))

vi.mock('@/repository/categories', () => ({
  deleteCategory: mockDeleteCategory,
  getCategoryById: mockGetCategoryById,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}))

// ── Section: Helpers ────────────────────────────────────────────────────────────
//
// Reusable test data and setup functions to keep tests DRY and readable.
// The category IDs are realistic UUIDs for clarity.
// ────────────────────────────────────────────────────────────────────────────────

const MOCK_CATEGORY_ID = 'cat-delete-001'
const MOCK_USER_ID = 'user-123'

/** Authenticated session with a valid user id */
const AUTHENTICATED_SESSION = {
  user: { id: MOCK_USER_ID },
}

/** An existing category owned by the user — safe to delete */
const EXISTING_CATEGORY = {
  id: MOCK_CATEGORY_ID,
  userId: MOCK_USER_ID,
  name: 'Food',
}

/** Default mocks for a successful flow (authenticated, category exists) */
function setupSuccessfulDefaults() {
  mockGetSession.mockResolvedValue(AUTHENTICATED_SESSION)
  mockHeaders.mockResolvedValue({})
  mockGetCategoryById.mockResolvedValue(EXISTING_CATEGORY)
  mockDeleteCategory.mockResolvedValue(undefined)
  mockRevalidatePath.mockImplementation(() => {})
}

// ── Section: Tests ──────────────────────────────────────────────────────────────
//
// Full coverage for deleteCategoryAction covering every branch:
//   1. Authentication — returns 401 when no userId
//   2. Not found — returns 404 when getCategoryById returns null
//   3. Success — returns 200 on successful deletion
//   4. Error handling — returns 400 with error message when repository throws
//   5. Side effects — revalidatePath called, deleteCategory called with correct args
//   6. Verification — getCategoryById called before deletion
// ────────────────────────────────────────────────────────────────────────────────

describe('deleteCategoryAction', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    setupSuccessfulDefaults()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  // ── Authentication ──────────────────────────────────────────────────────────

  describe('authentication', () => {
    it('returns 401 when session has no user id', async () => {
      // session.user exists but id is missing — userId will be undefined
      mockGetSession.mockResolvedValue({ user: {} })

      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized User',
      })
    })

    it('returns 401 when session is null', async () => {
      mockGetSession.mockResolvedValue(null)

      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized User',
      })
    })

    it('returns 401 when user id is empty string', async () => {
      mockGetSession.mockResolvedValue({ user: { id: '' } })

      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized User',
      })
    })

    it('does not call getCategoryById when user is unauthenticated', async () => {
      mockGetSession.mockResolvedValue(null)

      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(mockGetCategoryById).not.toHaveBeenCalled()
    })

    it('does not call deleteCategory when user is unauthenticated', async () => {
      mockGetSession.mockResolvedValue(null)

      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(mockDeleteCategory).not.toHaveBeenCalled()
    })
  })

  // ── Category not found ─────────────────────────────────────────────────────

  describe('category not found', () => {
    it('returns 404 when existing category is not found', async () => {
      mockGetCategoryById.mockResolvedValue(null)

      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Category not found',
      })
    })

    it('does not call deleteCategory when category does not exist', async () => {
      mockGetCategoryById.mockResolvedValue(null)

      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(mockDeleteCategory).not.toHaveBeenCalled()
    })

    it('does not call revalidatePath when category does not exist', async () => {
      mockGetCategoryById.mockResolvedValue(null)

      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  // ── Success path ────────────────────────────────────────────────────────────

  describe('successful deletion', () => {
    it('returns 200 on successful deletion', async () => {
      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: true,
        status: 200,
        message: 'Category deleted successfully',
      })
    })

    it('calls deleteCategory with correct id and userId', async () => {
      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(mockDeleteCategory).toHaveBeenCalledWith(MOCK_CATEGORY_ID, MOCK_USER_ID)
    })

    it('calls revalidatePath with /category on success', async () => {
      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/category')
    })

    it('calls getCategoryById to verify category exists before deletion', async () => {
      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(mockGetCategoryById).toHaveBeenCalledWith(MOCK_CATEGORY_ID, MOCK_USER_ID)
    })

    it('does not call revalidatePath before deleteCategory (correct order)', async () => {
      // Verify that deleteCategory is called before revalidatePath
      const callOrder: string[] = []
      mockDeleteCategory.mockImplementation(async () => {
        callOrder.push('deleteCategory')
      })
      mockRevalidatePath.mockImplementation(() => {
        callOrder.push('revalidatePath')
      })

      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(callOrder).toEqual(['deleteCategory', 'revalidatePath'])
    })
  })

  // ── Error handling ──────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('returns 400 with error message when deleteCategory throws', async () => {
      mockDeleteCategory.mockRejectedValue(
        new Error('Cannot delete category with associated transactions'),
      )

      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Cannot delete category with associated transactions',
      })
    })

    it('returns 400 with error message when getCategoryById throws', async () => {
      mockGetCategoryById.mockRejectedValue(new Error('Database connection lost'))

      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Database connection lost',
      })
    })

    it('returns 400 with fallback message when error has no message', async () => {
      // Error with no message — should fall back to 'Something went wrong'
      mockDeleteCategory.mockRejectedValue(new Error())

      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Something went wrong',
      })
    })

    it('returns 400 with fallback message when thrown value is not an Error', async () => {
      // Throwing a non-Error value (e.g. a string or null)
      mockDeleteCategory.mockRejectedValue('string error')

      const result = await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Something went wrong',
      })
    })

    it('does not call revalidatePath when an error occurs', async () => {
      mockDeleteCategory.mockRejectedValue(new Error('DB error'))

      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('logs the error to console.error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const expectedError = new Error('Unexpected failure')
      mockDeleteCategory.mockRejectedValue(expectedError)

      await deleteCategoryAction(MOCK_CATEGORY_ID)

      expect(consoleSpy).toHaveBeenCalledWith('Error deleting category:', expectedError)
      consoleSpy.mockRestore()
    })
  })
})
