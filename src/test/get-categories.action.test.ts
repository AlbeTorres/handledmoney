import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCategoriesByUserAction } from '@/actions/category/get-categories'

// ── Mock Definitions ──

const { mockGetSession, mockGetCategoriesByUserId, mockHeaders } = vi.hoisted(() => {
  return {
    mockGetSession: vi.fn(),
    mockGetCategoriesByUserId: vi.fn(),
    mockHeaders: vi.fn(),
  }
})

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}))

vi.mock('@/repository/categories', () => ({
  getCategoriesByUserId: mockGetCategoriesByUserId,
}))

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}))

// ── Test Suite ──

describe('getCategoriesByUserAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders.mockResolvedValue(new Headers())
  })

  // ── Unauthorized Cases ──

  it('returns 401 when session has no user id — user object exists but id is missing', async () => {
    // Session is returned but user object is empty, so userId is undefined
    mockGetSession.mockResolvedValue({ user: {} })

    const result = await getCategoriesByUserAction()

    expect(result.status).toBe(401)
    expect(result.success).toBe(false)
    expect(result.message).toBe('Unauthorized User')
    expect(result.data).toEqual([])
  })

  it('returns 401 when session is null — no active session at all', async () => {
    // Session is null, meaning the user is not authenticated
    mockGetSession.mockResolvedValue(null)

    const result = await getCategoriesByUserAction()

    expect(result.status).toBe(401)
    expect(result.success).toBe(false)
    expect(result.message).toBe('Unauthorized User')
    expect(result.data).toEqual([])
  })

  // ── Success Cases ──

  it('returns 200 with categories on success — user is authenticated and categories exist', async () => {
    const fakeCategories = [
      { id: '1', name: 'Food', userId: 'user-123' },
      { id: '2', name: 'Transport', userId: 'user-123' },
    ]

    mockGetSession.mockResolvedValue({
      user: { id: 'user-123' },
    })
    mockGetCategoriesByUserId.mockResolvedValue(fakeCategories)

    const result = await getCategoriesByUserAction()

    expect(result.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.message).toBe('Categories retrieved successfully')
    expect(result.data).toEqual(fakeCategories)
  })

  it('returns empty data array when no categories are found — authenticated user with zero categories', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-123' },
    })
    mockGetCategoriesByUserId.mockResolvedValue([])

    const result = await getCategoriesByUserAction()

    expect(result.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.message).toBe('Categories retrieved successfully')
    expect(result.data).toEqual([])
  })

  // ── Error Handling ──

  it('returns 500 when repository throws an unexpected error — database or network failure', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-123' },
    })
    mockGetCategoriesByUserId.mockRejectedValue(new Error('Database connection failed'))

    // Suppress expected console.error output during the test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getCategoriesByUserAction()

    expect(result.status).toBe(500)
    expect(result.success).toBe(false)
    expect(result.message).toBe('Something went wrong')
    expect(result.data).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error in getCategories:',
      expect.any(Error),
    )

    consoleSpy.mockRestore()
  })

  // ── Integration / Argument Verification ──

  it('calls getCategoriesByUserId with the correct userId extracted from session', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: 'user-456' },
    })
    mockGetCategoriesByUserId.mockResolvedValue([])

    await getCategoriesByUserAction()

    // The action must pass the authenticated user's id to the repository layer
    expect(mockGetCategoriesByUserId).toHaveBeenCalledWith('user-456')
    expect(mockGetCategoriesByUserId).toHaveBeenCalledTimes(1)
  })
})
