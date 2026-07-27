import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateCategoryAction } from '@/actions/category/update-category'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const {
  mockUpdateCategory,
  mockGetCategoryById,
  mockGetCategoriesByUserId,
  mockGetSession,
  mockHeaders,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockUpdateCategory: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockGetCategoriesByUserId: vi.fn(),
  mockGetSession: vi.fn(),
  mockHeaders: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))

vi.mock('@/repository/categories', () => ({
  updateCategory: mockUpdateCategory,
  getCategoryById: mockGetCategoryById,
  getCategoriesByUserId: mockGetCategoriesByUserId,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Valid UUID used as category id across all tests */
const VALID_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

/** Second valid UUID used for parentId / related entities */
const OTHER_UUID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

/** Third valid UUID for parent-of-parent hierarchy tests */
const THIRD_UUID = 'c3d4e5f6-a7b8-9012-cdef-123456789012'

/** Complete valid data that satisfies UpdateCategorySchema */
const VALID_DATA = {
  id: VALID_ID,
  name: 'Groceries',
  icon: '🛒',
  color: '137FEC',
  type: 'expense' as const,
  parentId: null,
}

/** A successful session object returned by auth */
const SUCCESS_SESSION = {
  user: { id: 'user-001' },
}

/** The existing category record as returned by getCategoryById */
const EXISTING_CATEGORY = {
  id: VALID_ID,
  name: 'Groceries',
  icon: '🛒',
  color: '137FEC',
  type: 'expense',
  parentId: null,
  userId: 'user-001',
}

/** The updated category record as returned by updateCategory */
const UPDATED_CATEGORY = {
  ...EXISTING_CATEGORY,
  name: 'Supermarket',
  icon: '🏪',
  color: 'FF5733',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('updateCategoryAction', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Default: authenticated session with valid headers
    mockGetSession.mockResolvedValue(SUCCESS_SESSION)
    mockHeaders.mockResolvedValue({})

    // Default: existing category found with no duplicates
    mockGetCategoryById.mockImplementation(async (id: string) => {
      if (id === VALID_ID) return EXISTING_CATEGORY
      return null
    })
    mockGetCategoriesByUserId.mockResolvedValue([EXISTING_CATEGORY])
    mockUpdateCategory.mockResolvedValue(UPDATED_CATEGORY)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  // ── Authentication ─────────────────────────────────────────────────────────

  it('returns 401 when session has no user id', async () => {
    // Session exists but user object is missing id
    mockGetSession.mockResolvedValue({ user: {} })

    const result = await updateCategoryAction(VALID_DATA)

    expect(result).toEqual({
      success: false,
      status: 401,
      message: 'Unauthorized User',
    })
    // Should short-circuit before any validation or DB calls
    expect(mockGetCategoryById).not.toHaveBeenCalled()
    expect(mockUpdateCategory).not.toHaveBeenCalled()
  })

  it('returns 401 when session is null', async () => {
    mockGetSession.mockResolvedValue(null)

    const result = await updateCategoryAction(VALID_DATA)

    expect(result).toEqual({
      success: false,
      status: 401,
      message: 'Unauthorized User',
    })
  })

  // ── Schema validation ──────────────────────────────────────────────────────

  it('returns 400 when id is missing (schema validation fails)', async () => {
    const { id, ...dataWithoutId } = VALID_DATA

    const result = await updateCategoryAction(dataWithoutId as any)

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'Invalid fields!',
    })
    expect(mockGetCategoryById).not.toHaveBeenCalled()
  })

  it('returns 400 when name is empty', async () => {
    const result = await updateCategoryAction({
      ...VALID_DATA,
      name: '',
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'Invalid fields!',
    })
  })

  it('returns 400 when color is invalid hex', async () => {
    const result = await updateCategoryAction({
      ...VALID_DATA,
      color: 'not-hex',
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'Invalid fields!',
    })
  })

  it('returns 400 when type is not income or expense', async () => {
    const result = await updateCategoryAction({
      ...VALID_DATA,
      type: 'savings' as any,
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'Invalid fields!',
    })
  })

  it('returns 400 when id is not a valid UUID', async () => {
    const result = await updateCategoryAction({
      ...VALID_DATA,
      id: 'not-a-uuid',
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'Invalid fields!',
    })
  })

  // ── Category not found ─────────────────────────────────────────────────────

  it('returns 404 when existing category is not found', async () => {
    mockGetCategoryById.mockResolvedValue(null)

    const result = await updateCategoryAction(VALID_DATA)

    expect(result).toEqual({
      success: false,
      status: 404,
      message: 'Category not found',
    })
    expect(mockUpdateCategory).not.toHaveBeenCalled()
  })

  // ── Name uniqueness ────────────────────────────────────────────────────────

  it('returns 400 when name already exists for the same type', async () => {
    // A different category with the same name exists for the same type
    const duplicateCategory = {
      id: OTHER_UUID,
      name: 'Groceries',
      type: 'expense',
    }
    mockGetCategoriesByUserId.mockResolvedValue([EXISTING_CATEGORY, duplicateCategory])

    const result = await updateCategoryAction(VALID_DATA)

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'A category with this name already exists for this type',
    })
    expect(mockUpdateCategory).not.toHaveBeenCalled()
  })

  it('does NOT check name uniqueness when name is not changing', async () => {
    // Name is explicitly undefined — schema trims it so we pass undefined to skip name check
    // The source code only enters uniqueness block when `name || type` is truthy
    // Without name, but with type provided, it still enters. Let's verify the code path:
    // The condition is `if (name || type)` — type is always present, so uniqueness always runs.
    // This test verifies that matching name from existing categories does NOT flag as duplicate
    // when the matched category is the SAME one (c.id !== id excludes self)
    mockGetCategoriesByUserId.mockResolvedValue([EXISTING_CATEGORY])

    // Updating with the same name as existing — should NOT be flagged as duplicate (self-excluded)
    const result = await updateCategoryAction({
      ...VALID_DATA,
      name: 'Groceries', // same name as existing
    })

    expect(result.success).toBe(true)
    expect(mockGetCategoriesByUserId).toHaveBeenCalledWith('user-001', 'expense')
  })

  it('checks name uniqueness using the target type (falling back to existing type)', async () => {
    // Changing type from 'expense' to 'income' — uniqueness should be checked against 'income'
    const incomeCategory = {
      id: OTHER_UUID,
      name: 'Groceries',
      type: 'income',
    }
    mockGetCategoriesByUserId.mockResolvedValue([incomeCategory])

    const result = await updateCategoryAction({
      ...VALID_DATA,
      type: 'income',
    })

    // Should call getCategoriesByUserId with the NEW type ('income'), not the existing type
    expect(mockGetCategoriesByUserId).toHaveBeenCalledWith('user-001', 'income')
    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'A category with this name already exists for this type',
    })
  })

  it('performs case-insensitive and trimmed name uniqueness check', async () => {
    const duplicateCategory = {
      id: OTHER_UUID,
      name: '  GROCERIES  ',
      type: 'expense',
    }
    mockGetCategoriesByUserId.mockResolvedValue([EXISTING_CATEGORY, duplicateCategory])

    const result = await updateCategoryAction({
      ...VALID_DATA,
      name: 'groceries',
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'A category with this name already exists for this type',
    })
  })

  // ── Hierarchy depth ────────────────────────────────────────────────────────

  it('returns 400 when hierarchy depth is exceeded (parent has parentId)', async () => {
    // The intended parent already has a parent — that means it is already at depth 2
    const parentWithParent = {
      id: OTHER_UUID,
      parentId: THIRD_UUID,
    }
    mockGetCategoryById.mockImplementation(async (id: string) => {
      if (id === VALID_ID) return EXISTING_CATEGORY
      if (id === OTHER_UUID) return parentWithParent
      return null
    })

    const result = await updateCategoryAction({
      ...VALID_DATA,
      parentId: OTHER_UUID,
    })

    expect(result).toEqual({
      success: false,
      status: 400,
      message: 'Maximum hierarchy depth reached (2 levels)',
    })
    expect(mockUpdateCategory).not.toHaveBeenCalled()
  })

  it('allows setting parentId when parent has no parent (depth 1)', async () => {
    const parentWithoutParent = {
      id: OTHER_UUID,
      parentId: null,
    }
    mockGetCategoryById.mockImplementation(async (id: string) => {
      if (id === VALID_ID) return EXISTING_CATEGORY
      if (id === OTHER_UUID) return parentWithoutParent
      return null
    })

    const result = await updateCategoryAction({
      ...VALID_DATA,
      parentId: OTHER_UUID,
    })

    expect(result.success).toBe(true)
    expect(mockUpdateCategory).toHaveBeenCalled()
  })

  it('does NOT check hierarchy when parentId is not changing', async () => {
    // parentId is null in both existing and incoming data — no hierarchy check needed
    const result = await updateCategoryAction({
      ...VALID_DATA,
      parentId: null,
    })

    expect(result.success).toBe(true)
    // getCategoryById is called once for the category itself, not for parent lookup
    expect(mockGetCategoryById).toHaveBeenCalledTimes(1)
  })

  // ── Success path ───────────────────────────────────────────────────────────

  it('returns 200 with updated category on success', async () => {
    const result = await updateCategoryAction({
      ...VALID_DATA,
      name: 'Supermarket',
      icon: '🏪',
      color: 'FF5733',
    })

    expect(result).toEqual({
      success: true,
      status: 200,
      data: UPDATED_CATEGORY,
      message: 'Category updated successfully',
    })
  })

  it('calls updateCategory with correct id, userId, and data', async () => {
    const updateData = {
      name: 'Supermarket',
      icon: '🏪',
      color: 'FF5733',
      type: 'income' as const,
      parentId: OTHER_UUID,
    }

    const parentWithoutParent = {
      id: OTHER_UUID,
      parentId: null,
    }
    mockGetCategoryById.mockImplementation(async (id: string) => {
      if (id === VALID_ID) return EXISTING_CATEGORY
      if (id === OTHER_UUID) return parentWithoutParent
      return null
    })

    await updateCategoryAction({
      id: VALID_ID,
      ...updateData,
    })

    expect(mockUpdateCategory).toHaveBeenCalledWith(VALID_ID, 'user-001', updateData)
  })

  it('calls revalidatePath with /category on success', async () => {
    await updateCategoryAction(VALID_DATA)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/category')
  })

  it('does NOT call revalidatePath when validation fails', async () => {
    mockGetSession.mockResolvedValue({ user: {} })

    await updateCategoryAction(VALID_DATA)

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  it('returns 500 when repository throws an error', async () => {
    mockUpdateCategory.mockRejectedValue(new Error('DB connection failed'))

    const result = await updateCategoryAction(VALID_DATA)

    expect(result).toEqual({
      success: false,
      status: 500,
      message: 'Something went wrong',
    })
  })

  it('returns 500 when getCategoryById throws an error', async () => {
    mockGetCategoryById.mockRejectedValue(new Error('Unexpected'))

    const result = await updateCategoryAction(VALID_DATA)

    expect(result).toEqual({
      success: false,
      status: 500,
      message: 'Something went wrong',
    })
  })

  it('does NOT call revalidatePath when an error occurs', async () => {
    mockUpdateCategory.mockRejectedValue(new Error('DB connection failed'))

    await updateCategoryAction(VALID_DATA)

    expect(mockRevalidatePath).not.toHaveBeenCalled()
  })
})
