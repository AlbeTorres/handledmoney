import { getCategoriesByUserData } from '@/data-access/get-categories'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('getCategoriesByUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeaders.mockResolvedValue(new Headers())
  })

  // ── Unauthorized Cases ──

  it('returns unauthorized when session has no user id', async () => {
    mockGetSession.mockResolvedValue({ user: {} })

    const result = await getCategoriesByUserData()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Unauthorized User')
    expect(result.data).toEqual([])
    expect(mockGetCategoriesByUserId).not.toHaveBeenCalled()
  })

  it('returns unauthorized when session is null', async () => {
    mockGetSession.mockResolvedValue(null)

    const result = await getCategoriesByUserData()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Unauthorized User')
    expect(result.data).toEqual([])
  })

  // ── Success Cases ──

  it('returns categories on success', async () => {
    const fakeCategories = [
      { id: '1', name: 'Food', userId: 'user-123' },
      { id: '2', name: 'Transport', userId: 'user-123' },
    ]

    mockGetSession.mockResolvedValue({ user: { id: 'user-123' } })
    mockGetCategoriesByUserId.mockResolvedValue(fakeCategories)

    const result = await getCategoriesByUserData()

    expect(result.success).toBe(true)
    expect(result.message).toBe('Categories retrieved successfully')
    expect(result.data).toEqual(fakeCategories)
  })

  it('returns empty data array when no categories are found', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-123' } })
    mockGetCategoriesByUserId.mockResolvedValue([])

    const result = await getCategoriesByUserData()

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  // ── Error Handling ──

  it('returns 500-style failure object when the repository throws', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-123' } })
    mockGetCategoriesByUserId.mockRejectedValue(new Error('Database connection failed'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const result = await getCategoriesByUserData()

    expect(result.success).toBe(false)
    expect(result.message).toBe('Something went wrong')
    expect(result.data).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error in getCategories:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  // ── Argument Verification ──

  it('passes the authenticated user id and optional type filter to the repository', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-456' } })
    mockGetCategoriesByUserId.mockResolvedValue([])

    await getCategoriesByUserData('expense')

    expect(mockGetCategoriesByUserId).toHaveBeenCalledWith('user-456', 'expense')
    expect(mockGetCategoriesByUserId).toHaveBeenCalledTimes(1)
  })
})
