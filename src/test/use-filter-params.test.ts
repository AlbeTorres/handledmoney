import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useFilterParam, useFilterParams } from '@/hooks/use-filter-params'

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

// Configure the searchParams mock to simulate a URL with the given query string.
// This lets us control exactly what the hook sees as the current URL state.
const setupSearchParams = (queryString = '') => {
  getMock.mockImplementation((key: string) => {
    const params = new URLSearchParams(queryString)
    return params.get(key)
  })
  toStringMock.mockReturnValue(queryString)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useFilterParam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupSearchParams('')
  })

  // ── Reading params ────────────────────────────────────────────────────────

  // When there is no value for the key in the URL, the hook must return an
  // empty array. This is what the component sees with no active filters.
  it('returns empty array when there is no value in URL', () => {
    const { result } = renderHook(() => useFilterParam('currency'))
    expect(result.current[0]).toEqual([])
  })

  // The hook parses comma-separated values into an array — this is the
  // standard format for multi-selection filters in the URL.
  it('returns comma-separated values as an array', () => {
    setupSearchParams('currency=USD,EUR')
    const { result } = renderHook(() => useFilterParam('currency'))
    expect(result.current[0]).toEqual(['USD', 'EUR'])
  })

  // A single value in the URL must also be returned as a one-element array,
  // so consuming components don't need to handle branching.
  it('returns a single value as a one-element array', () => {
    setupSearchParams('currency=GBP')
    const { result } = renderHook(() => useFilterParam('currency'))
    expect(result.current[0]).toEqual(['GBP'])
  })

  // ── Writing params ────────────────────────────────────────────────────────

  // setValues updates the URL with the new values — router.push is what
  // tells Next.js to update the URL without a full page reload.
  it('setValues with new values updates the URL', () => {
    setupSearchParams('')
    const { result } = renderHook(() => useFilterParam('currency'))

    act(() => {
      result.current[1](['ARS'])
    })

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('currency=ARS'),
      { scroll: false },
    )
  })

  // When the user deselects all filters, the param is removed from the URL
  // instead of remaining as an empty string — cleaner output.
  it('setValues with empty array removes the param', () => {
    setupSearchParams('currency=USD')
    const { result } = renderHook(() => useFilterParam('currency'))

    act(() => {
      result.current[1]([])
    })

    const calledWith = pushMock.mock.calls[0][0]
    expect(calledWith).not.toContain('currency')
  })

  // If there are other params in the URL (like sort), setValues preserves
  // them. This is critical for filters and sorting to coexist.
  it('preserves other existing URL params', () => {
    setupSearchParams('sort=name')
    const { result } = renderHook(() => useFilterParam('currency'))

    act(() => {
      result.current[1](['USD'])
    })

    const calledWith = pushMock.mock.calls[0][0]
    expect(calledWith).toContain('currency=USD')
    expect(calledWith).toContain('sort=name')
  })
})

describe('useFilterParams coordinated setter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupSearchParams('')
  })

  it('applies multiple key updates in a single push', () => {
    setupSearchParams('mode=monthly&year=2026&month=3')
    const { result } = renderHook(() => useFilterParams())

    act(() => {
      result.current({ mode: ['annual'], month: [] })
    })

    expect(pushMock).toHaveBeenCalledTimes(1)
    const calledWith = pushMock.mock.calls[0][0]
    expect(calledWith).toContain('mode=annual')
    expect(calledWith).toContain('year=2026')
    expect(calledWith).not.toContain('month')
  })

  it('sets and deletes keys from the same updates object', () => {
    setupSearchParams('mode=monthly&year=2026&month=3&sort=name')
    const { result } = renderHook(() => useFilterParams())

    act(() => {
      result.current({ mode: ['annual'], month: [], year: ['2027'], sort: ['name'] })
    })

    const calledWith = pushMock.mock.calls[0][0]
    expect(calledWith).toContain('mode=annual')
    expect(calledWith).toContain('year=2027')
    expect(calledWith).toContain('sort=name')
    expect(calledWith).not.toContain('month')
  })
})
