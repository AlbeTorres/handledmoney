import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useSortParam } from '@/hooks/use-sort-params'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { pushMock, getMock, toStringMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  getMock: vi.fn<(key: string) => string | null>(),
  toStringMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/account',
  useSearchParams: () => ({
    get: getMock,
    toString: toStringMock,
  }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const setupSearchParams = (queryString = '') => {
  getMock.mockImplementation((key: string) => {
    const params = new URLSearchParams(queryString)
    return params.get(key)
  })
  toStringMock.mockReturnValue(queryString)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useSortParam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupSearchParams('')
  })

  // ── Reading ───────────────────────────────────────────────────────────────

  // When there is no sort in the URL, the hook returns the defaultValue ('default').
  // This ensures there is always a valid sort value for the UI.
  it('returns defaultValue when there is no sort in URL', () => {
    const { result } = renderHook(() => useSortParam())
    expect(result.current[0]).toBe('default')
  })

  // When the URL has an active sort, the hook reads it correctly.
  // This allows the sort to persist when navigating between pages.
  it('returns the URL value when it exists', () => {
    setupSearchParams('sort=account_name')
    const { result } = renderHook(() => useSortParam())
    expect(result.current[0]).toBe('account_name')
  })

  // ── Writing ───────────────────────────────────────────────────────────────

  // setValue with a non-default value adds the parameter to the URL.
  // This is the normal flow when the user selects a sort criterion.
  it('setValue with non-default value adds the param', () => {
    setupSearchParams('')
    const { result } = renderHook(() => useSortParam())

    act(() => {
      result.current[1]('highest_balance')
    })

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('sort=highest_balance'),
      { scroll: false },
    )
  })

  // If the user selects the default value, the param is removed from the URL
  // instead of staying as sort=default — cleaner and more consistent.
  it('setValue with defaultValue removes the param', () => {
    setupSearchParams('sort=account_name')
    const { result } = renderHook(() => useSortParam())

    act(() => {
      result.current[1]('default')
    })

    const calledWith = pushMock.mock.calls[0][0]
    expect(calledWith).not.toContain('sort')
  })

  // An empty string behaves the same as the default — removes the param.
  it('setValue with empty string removes the param', () => {
    setupSearchParams('sort=account_name')
    const { result } = renderHook(() => useSortParam())

    act(() => {
      result.current[1]('')
    })

    const calledWith = pushMock.mock.calls[0][0]
    expect(calledWith).not.toContain('sort')
  })

  // Changing the sort doesn't clear other existing params like currency or search.
  it('preserves other existing params', () => {
    setupSearchParams('currency=USD')
    const { result } = renderHook(() => useSortParam())

    act(() => {
      result.current[1]('account_name')
    })

    const calledWith = pushMock.mock.calls[0][0]
    expect(calledWith).toContain('sort=account_name')
    expect(calledWith).toContain('currency=USD')
  })
})
