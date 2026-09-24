import { getCategoryByIdData } from '@/data-access/get-category-by-id'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mock Definitions ───────────────────────────────────────────────────────────

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

describe('getCategoryByIdData', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockHeaders.mockResolvedValue(new Headers())
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  // ── Unauthorized ─────────────────────────────────────────────────────────────

  it('returns unauthorized when session has no user id', async () => {
    mockGetSession.mockResolvedValue({ user: {} })

    const result = await getCategoryByIdData('cat-123')

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized User',
    })
    expect(mockGetCategoryById).not.toHaveBeenCalled()
  })

  it('returns unauthorized when session is null', async () => {
    mockGetSession.mockResolvedValue(null)

    const result = await getCategoryByIdData('cat-123')

    expect(result).toEqual({
      success: false,
      message: 'Unauthorized User',
    })
  })

  // ── Success ──────────────────────────────────────────────────────────────────

  it('returns category data on success', async () => {
    const fakeCategory = {
      id: 'cat-123',
      name: 'Groceries',
      icon: '🛒',
      type: 'expense',
    }

    mockGetSession.mockResolvedValue({ user: { id: 'user-abc' } })
    mockGetCategoryById.mockResolvedValue(fakeCategory)

    const result = await getCategoryByIdData('cat-123')

    expect(result).toEqual({
      success: true,
      data: fakeCategory,
      message: 'Category retrieved successfully',
    })
  })

  // ── Not Found ────────────────────────────────────────────────────────────────

  it('returns not-found when the repository returns null', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-abc' } })
    mockGetCategoryById.mockResolvedValue(null)

    const result = await getCategoryByIdData('nonexistent-id')

    expect(result).toEqual({
      success: false,
      message: 'Category not found',
    })
  })

  // ── Error Handling ───────────────────────────────────────────────────────────

  it('returns a generic failure object when the repository throws', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-abc' } })
    mockGetCategoryById.mockRejectedValue(new Error('Database connection failed'))

    const result = await getCategoryByIdData('cat-123')

    expect(result).toEqual({
      success: false,
      message: 'Something went wrong',
    })
  })

  // ── Correct Parameters ───────────────────────────────────────────────────────

  it('calls getCategoryById with the correct id and userId', async () => {
    const categoryId = 'cat-456'
    const userId = 'user-789'

    mockGetSession.mockResolvedValue({ user: { id: userId } })
    mockGetCategoryById.mockResolvedValue({ id: categoryId, name: 'Transport' })

    await getCategoryByIdData(categoryId)

    // Multi-tenancy isolation: only the owner's category can be fetched.
    expect(mockGetCategoryById).toHaveBeenCalledWith(categoryId, userId)
  })
})
