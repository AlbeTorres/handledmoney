import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest'
import { createCategoryAction } from '@/actions/category/create-category'

// ── Section: Hoisted mocks ──────────────────────────────────────────────────────
//
// We hoist all mock definitions using vi.hoisted() so they are available before
// any vi.mock() calls. This is a vitest requirement — vi.mock() is hoisted to
// the top of the file automatically, so mocks must be defined with vi.hoisted().
// ────────────────────────────────────────────────────────────────────────────────

const {
  mockCreateCategory,
  mockGetCategoriesByUserId,
  mockGetSession,
  mockHeaders,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockCreateCategory: vi.fn(),
  mockGetCategoriesByUserId: vi.fn(),
  mockGetSession: vi.fn(),
  mockHeaders: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

// ── Section: Module mocks ───────────────────────────────────────────────────────
//
// Mock every external dependency that createCategoryAction imports.
// We do NOT mock @/lib/schema — we let the real Zod schema validate naturally
// so our test data must actually satisfy the categorySchema constraints.
// ────────────────────────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))

vi.mock('@/repository/categories', () => ({
  createCategory: mockCreateCategory,
  getCategoriesByUserId: mockGetCategoriesByUserId,
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
// The valid category data satisfies all categorySchema constraints:
//   - name: string, 1-50 chars, trimmed
//   - icon: non-empty string
//   - color: 6-char hex string (no # prefix)
//   - type: 'income' | 'expense'
// ────────────────────────────────────────────────────────────────────────────────

/** A valid category payload that passes categorySchema validation */
const VALID_CATEGORY = {
  name: 'Food',
  icon: 'utensils',
  color: 'FF0000',
  type: 'income' as const,
}

const MOCK_USER_ID = 'user-123'

/** Authenticated session with a valid user id */
const AUTHENTICATED_SESSION = {
  user: { id: MOCK_USER_ID },
}

/**
 * Session without a user id (unauthenticated).
 * We use { user: { id: null } } instead of {} because the source code accesses
 * `session?.user.id` — the optional chaining only protects `session` itself,
 * not `user`. If we passed `{}`, the expression `session.user` would be
 * `undefined` and then `.id` would throw a TypeError.
 */
const UNAUTHENTICATED_SESSION = { user: { id: null } }

const CREATED_CATEGORY_RESULT = {
  id: 'cat-created-001',
  userId: MOCK_USER_ID,
  name: 'Food',
  icon: 'utensils',
  color: 'FF0000',
  type: 'income',
  createdAt: new Date(),
}

/** Default mocks for a successful flow (authenticated, no existing categories) */
function setupSuccessfulDefaults() {
  mockGetSession.mockResolvedValue(AUTHENTICATED_SESSION)
  mockHeaders.mockResolvedValue({})
  mockGetCategoriesByUserId.mockResolvedValue([])
  mockCreateCategory.mockResolvedValue(CREATED_CATEGORY_RESULT)
  mockRevalidatePath.mockImplementation(() => {})
}

// ── Section: Tests ──────────────────────────────────────────────────────────────
//
// Full coverage for createCategoryAction covering every branch:
//   1. Authentication — returns 401 when no userId
//   2. Validation — returns 400 when schema fails
//   3. Duplicate check — returns 400 for same-name categories (case-insensitive)
//   4. Success — returns 200 with created category data
//   5. Error handling — returns 500 when repository throws
//   6. Side effects — revalidatePath called, createCategory called with correct data
// ────────────────────────────────────────────────────────────────────────────────

describe('createCategoryAction', () => {
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
      mockGetSession.mockResolvedValue(UNAUTHENTICATED_SESSION)

      const result = await createCategoryAction(VALID_CATEGORY)

      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized User',
      })
    })

    it('returns 401 when session is null', async () => {
      mockGetSession.mockResolvedValue(null)

      const result = await createCategoryAction(VALID_CATEGORY)

      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized User',
      })
    })

    it('returns 401 when user id is empty string', async () => {
      mockGetSession.mockResolvedValue({ user: { id: '' } })

      const result = await createCategoryAction(VALID_CATEGORY)

      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized User',
      })
    })
  })

  // ── Schema validation ───────────────────────────────────────────────────────

  describe('schema validation', () => {
    it('returns 400 when name is empty', async () => {
      const result = await createCategoryAction({
        ...VALID_CATEGORY,
        name: '',
      })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Invalid fields!',
      })
    })

    it('returns 400 when icon is empty', async () => {
      const result = await createCategoryAction({
        ...VALID_CATEGORY,
        icon: '',
      })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Invalid fields!',
      })
    })

    it('returns 400 when color is invalid hex', async () => {
      const result = await createCategoryAction({
        ...VALID_CATEGORY,
        color: 'not-a-color',
      })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Invalid fields!',
      })
    })

    it('returns 400 when color has a hash prefix', async () => {
      const result = await createCategoryAction({
        ...VALID_CATEGORY,
        color: '#FF0000',
      })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Invalid fields!',
      })
    })

    it('returns 400 when type is invalid', async () => {
      const result = await createCategoryAction({
        ...VALID_CATEGORY,
        type: 'savings' as any,
      })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Invalid fields!',
      })
    })

    it('returns 400 when name exceeds 50 characters', async () => {
      const result = await createCategoryAction({
        ...VALID_CATEGORY,
        name: 'A'.repeat(51),
      })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Invalid fields!',
      })
    })

    it('does not reach repository calls when validation fails', async () => {
      await createCategoryAction({
        ...VALID_CATEGORY,
        name: '',
      })

      expect(mockGetCategoriesByUserId).not.toHaveBeenCalled()
      expect(mockCreateCategory).not.toHaveBeenCalled()
    })
  })

  // ── Duplicate name check ────────────────────────────────────────────────────

  describe('duplicate name check', () => {
    it('returns 400 when a category with the same name already exists for the same type', async () => {
      mockGetCategoriesByUserId.mockResolvedValue([
        { id: 'existing-1', name: 'Food', type: 'income'},
      ])

      const result = await createCategoryAction(VALID_CATEGORY)

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'A category with this name already exists for this type',
      })
    })

    it('performs case-insensitive comparison for duplicate check', async () => {
      mockGetCategoriesByUserId.mockResolvedValue([
        { id: 'existing-1', name: 'food', type: 'income'},
      ])

      const result = await createCategoryAction({ ...VALID_CATEGORY, name: 'Food' })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'A category with this name already exists for this type',
      })
    })

    it('performs trimmed comparison for duplicate check', async () => {
      mockGetCategoriesByUserId.mockResolvedValue([
        { id: 'existing-1', name: '  Food  ', type: 'income'},
      ])

      const result = await createCategoryAction({ ...VALID_CATEGORY, name: 'Food' })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'A category with this name already exists for this type',
      })
    })

    it('allows same name for different types', async () => {
      // getCategoriesByUserId is called with (userId, type) — when we switch type to
      // 'expense', the repo query filters by that type, so the mock returns an empty
      // array (no 'expense' categories exist). This means no duplicate is found.
      mockGetCategoriesByUserId.mockResolvedValue([])

      const result = await createCategoryAction({
        ...VALID_CATEGORY,
        type: 'expense',
      })

      // Should proceed to create (not blocked by duplicate check)
      expect(result.success).toBe(true)
    })

    it('does not call createCategory when duplicate exists', async () => {
      mockGetCategoriesByUserId.mockResolvedValue([
        { id: 'existing-1', name: 'Food', type: 'income'},
      ])

      await createCategoryAction(VALID_CATEGORY)

      expect(mockCreateCategory).not.toHaveBeenCalled()
    })
  })

  // ── Success path ────────────────────────────────────────────────────────────

  describe('successful creation', () => {
    it('returns 200 with created category data on success', async () => {
      const result = await createCategoryAction(VALID_CATEGORY)

      expect(result).toEqual({
        success: true,
        status: 200,
        data: CREATED_CATEGORY_RESULT,
        message: 'Category created successfully',
      })
    })

    it('calls createCategory with correct data including userId', async () => {
      await createCategoryAction(VALID_CATEGORY)

      expect(mockCreateCategory).toHaveBeenCalledWith({
        userId: MOCK_USER_ID,
        name: VALID_CATEGORY.name,
        icon: VALID_CATEGORY.icon,
        color: VALID_CATEGORY.color,
        type: VALID_CATEGORY.type,
      })
    })

    it('calls revalidatePath with /category on success', async () => {
      await createCategoryAction(VALID_CATEGORY)

      expect(mockRevalidatePath).toHaveBeenCalledWith('/category')
    })

    it('calls getCategoriesByUserId with userId and type for duplicate check', async () => {
      await createCategoryAction(VALID_CATEGORY)

      expect(mockGetCategoriesByUserId).toHaveBeenCalledWith(MOCK_USER_ID, 'income')
    })

    it('does not call revalidatePath when creation fails due to duplicate', async () => {
      mockGetCategoriesByUserId.mockResolvedValue([
        { id: 'existing-1', name: 'Food', type: 'expense'},
      ])

      await createCategoryAction(VALID_CATEGORY)

      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('does not call revalidatePath when creation fails due to validation', async () => {
      await createCategoryAction({ ...VALID_CATEGORY, name: '' })

      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  // ── Error handling ──────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('returns 500 when repository throws an error', async () => {
      mockCreateCategory.mockRejectedValue(new Error('DB connection failed'))

      const result = await createCategoryAction(VALID_CATEGORY)

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Something went wrong',
      })
    })

    it('returns 500 when getCategoriesByUserId throws', async () => {
      mockGetCategoriesByUserId.mockRejectedValue(new Error('DB query failed'))

      const result = await createCategoryAction(VALID_CATEGORY)

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Something went wrong',
      })
    })

    it('does not call revalidatePath when an error occurs', async () => {
      mockCreateCategory.mockRejectedValue(new Error('DB error'))

      await createCategoryAction(VALID_CATEGORY)

      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })
})
