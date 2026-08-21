import { getCategoryByIdAction } from '@/data-access/get-category-by-id'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mock Definitions ───────────────────────────────────────────────────────────
// vi.hoisted() ensures mocks are available before any module-level imports.
// This is required because vi.mock() is hoisted to the top of the file by Vitest,
// so the mock references must also be available at the top.

const { mockGetCategoryById, mockGetSession, mockHeaders } = vi.hoisted(() => ({
  mockGetCategoryById: vi.fn(),
  mockGetSession: vi.fn(),
  mockHeaders: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))

vi.mock('@/repository/categories', () => ({
  getCategoryById: mockGetCategoryById,
}))

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}))

// ── Test Suite ─────────────────────────────────────────────────────────────────

describe('getCategoryByIdAction', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    // Default: headers() resolves to a mock headers object
    mockHeaders.mockResolvedValue(new Headers())
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  // ── 401 Unauthorized ─────────────────────────────────────────────────────────

  it('returns 401 when session has no user id', async () => {
    // Session exists but user.id is undefined — simulates a session
    // that loaded but the user record is incomplete or missing the id field.
    mockGetSession.mockResolvedValue({ user: {} })

    const result = await getCategoryByIdAction('cat-123')

    expect(result).toEqual({
      success: false,
      status: 401,
      message: 'Unauthorized User',
    })
  })

  it('returns 401 when session is null', async () => {
    // Session is null — user is not logged in at all.
    // This covers the case where auth.api.getSession returns null
    // (e.g., expired token, no token present).
    mockGetSession.mockResolvedValue(null)

    const result = await getCategoryByIdAction('cat-123')

    expect(result).toEqual({
      success: false,
      status: 401,
      message: 'Unauthorized User',
    })
  })

  // ── 200 Success ──────────────────────────────────────────────────────────────

  it('returns 200 with category data on success', async () => {
    const fakeCategory = {
      id: 'cat-123',
      name: 'Groceries',
      icon: '🛒',
      type: 'expense',
    }

    mockGetSession.mockResolvedValue({ user: { id: 'user-abc' } })
    mockGetCategoryById.mockResolvedValue(fakeCategory)

    const result = await getCategoryByIdAction('cat-123')

    expect(result).toEqual({
      success: true,
      status: 200,
      data: fakeCategory,
      message: 'Category retrieved successfully',
    })
  })

  // ── 404 Not Found ────────────────────────────────────────────────────────────

  it('returns 404 when category not found', async () => {
    // Repository returns null — category doesn't exist for this user.
    mockGetSession.mockResolvedValue({ user: { id: 'user-abc' } })
    mockGetCategoryById.mockResolvedValue(null)

    const result = await getCategoryByIdAction('nonexistent-id')

    expect(result).toEqual({
      success: false,
      status: 404,
      message: 'Category not found',
    })
  })

  // ── 500 Internal Server Error ────────────────────────────────────────────────

  it('returns 500 when repository throws error', async () => {
    // Simulate an unexpected database error or network failure.
    // The action catches all errors and returns a generic 500 response
    // so that internal error details are never leaked to the client.
    mockGetSession.mockResolvedValue({ user: { id: 'user-abc' } })
    mockGetCategoryById.mockRejectedValue(new Error('Database connection failed'))

    const result = await getCategoryByIdAction('cat-123')

    expect(result).toEqual({
      success: false,
      status: 500,
      message: 'Something went wrong',
    })
  })

  // ── Correct Parameters ───────────────────────────────────────────────────────

  it('calls getCategoryById with the correct id and userId', async () => {
    const categoryId = 'cat-456'
    const userId = 'user-789'

    mockGetSession.mockResolvedValue({ user: { id: userId } })
    mockGetCategoryById.mockResolvedValue({ id: categoryId, name: 'Transport' })

    await getCategoryByIdAction(categoryId)

    // Verify that the repository function receives both the category id
    // and the authenticated user's id — this ensures multi-tenancy isolation
    // where users can only access their own categories.
    expect(mockGetCategoryById).toHaveBeenCalledWith(categoryId, userId)
  })
})
