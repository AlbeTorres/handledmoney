import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedSearchParam } from '@/hooks/use-debounced-search-params'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
// vi.hoisted is used so the references exist BEFORE vi.mock() replaces
// the modules. Without this, pushMock would be undefined inside the mock factory.

const { pushMock, getMock, toStringMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  getMock: vi.fn(),
  toStringMock: vi.fn(),
}))

// Mock next/navigation: we only need router.push, a fixed pathname,
// and searchParams that behaves like real URLSearchParams so that
// `new URLSearchParams(searchParams.toString())` works correctly.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/account',
  useSearchParams: () => ({
    get: getMock,
    toString: toStringMock,
    [Symbol.iterator]: function* () {},
  }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Configure the searchParams mock to behave like real URLSearchParams.
 * This allows `new URLSearchParams(searchParams.toString())` inside the hook
 * to generate the correct params, since toString() returns the query string
 * and get() returns the actual value for each key.
 */
const setupSearchParams = (queryString = '') => {
  const realParams = new URLSearchParams(queryString)
  getMock.mockImplementation((key: string) => realParams.get(key))
  toStringMock.mockReturnValue(queryString)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useDebouncedSearchParam', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    setupSearchParams('')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── Initial state ─────────────────────────────────────────────────────────

  // If there are no query params in the URL, the hook must start with an
  // empty string. This ensures the consuming component can distinguish
  // "no filter" from "active filter with empty value".
  it('returns empty initial value when there is no param in URL', () => {
    const { result } = renderHook(() => useDebouncedSearchParam('search'))

    expect(result.current[0]).toBe('')
  })

  // When the URL already has the parameter (e.g. from a previous navigation),
  // the hook MUST initialize with that value. This is critical for the input
  // to show the current filter on mount.
  it('returns URL value as initial state', () => {
    setupSearchParams('search=test')

    const { result } = renderHook(() => useDebouncedSearchParam('search'))

    expect(result.current[0]).toBe('test')
  })

  // ── Immediate state update ────────────────────────────────────────────────

  // setValue updates local state IMMEDIATELY so the input is responsive.
  // The debounce only applies to router.push, not to local state.
  it('setValue updates the hook value immediately', () => {
    const { result } = renderHook(() => useDebouncedSearchParam('search'))

    act(() => {
      result.current[1]('hello')
    })

    expect(result.current[0]).toBe('hello')
  })

  // ── Debounce: does not navigate immediately ───────────────────────────────

  // After setValue, router.push must NOT execute instantly. If it did,
  // every keystroke would trigger a navigation, causing performance issues
  // and UI flickering.
  it('does NOT call router.push immediately after setValue', () => {
    const { result } = renderHook(() => useDebouncedSearchParam('search'))

    act(() => {
      result.current[1]('test')
    })

    expect(pushMock).not.toHaveBeenCalled()
  })

  // ── Debounce: navigates after delay ───────────────────────────────────────

  // Advance timers by the configured delay (300ms default).
  // At 300ms, the setTimeout inside useEffect must trigger router.push
  // with the updated query string. This is the core functionality of the hook.
  it('calls router.push after the delay (debounce)', () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useDebouncedSearchParam('search'))

    act(() => {
      result.current[1]('test')
    })

    // Advance the timer by 300ms (default delay)
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/account?search=test', { scroll: false })
  })

  // ── Timeout cleanup on unmount ────────────────────────────────────────────

  // If the component unmounts before 300ms pass, the timeout MUST be cancelled
  // (via the useEffect return cleanup). Otherwise, router.push would execute
  // on an already unmounted component, causing a memory leak and possibly
  // a React 19 error.
  it('does NOT call router.push if component unmounts before delay', () => {
    vi.useFakeTimers()

    const { result, unmount } = renderHook(() => useDebouncedSearchParam('search'))

    act(() => {
      result.current[1]('test')
    })

    // Unmount before 300ms pass
    unmount()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(pushMock).not.toHaveBeenCalled()
  })

  // ── Param removal ─────────────────────────────────────────────────────────

  // When the user clears the input (empty value), the hook MUST remove the
  // parameter from the URL instead of setting it to empty. This prevents
  // dirty URLs like `/account?search=` and ensures the pathname is identical
  // to the "no filter" state.
  it('removes the param from URL when value is empty', () => {
    vi.useFakeTimers()

    // Start from a URL with the parameter active
    setupSearchParams('search=old')

    const { result } = renderHook(() => useDebouncedSearchParam('search'))

    // Clear the value
    act(() => {
      result.current[1]('')
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    // router.push must be called WITHOUT the 'search' parameter
    expect(pushMock).toHaveBeenCalledTimes(1)
    expect(pushMock).toHaveBeenCalledWith('/account', { scroll: false })
  })
})
