import { describe, expect, it, beforeEach } from 'vitest'
import { useAccountState } from '@/store/AccountSheetSate'

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAccountState', () => {
  // Reset the store to its initial state before each test to prevent
  // previous tests from polluting the next one's state.
  beforeEach(() => {
    useAccountState.setState({ isOpen: false, id: undefined })
  })

  // ── Initial state ─────────────────────────────────────────────────────────

  // Verify the store starts closed and without an id — this is what consuming
  // components expect on first mount.
  it('starts with isOpen=false and id=undefined', () => {
    const state = useAccountState.getState()
    expect(state.isOpen).toBe(false)
    expect(state.id).toBeUndefined()
  })

  // ── onOpen ────────────────────────────────────────────────────────────────

  // onOpen() without argument opens the sheet — used when creating a new
  // account and there is no specific id to display.
  it('onOpen() without argument opens the sheet without id', () => {
    useAccountState.getState().onOpen()
    const state = useAccountState.getState()
    expect(state.isOpen).toBe(true)
    expect(state.id).toBeUndefined()
  })

  // onOpen(id) opens the sheet with a specific id — used when selecting
  // an existing account to view its details.
  it('onOpen(id) opens the sheet with the provided id', () => {
    useAccountState.getState().onOpen('account-123')
    const state = useAccountState.getState()
    expect(state.isOpen).toBe(true)
    expect(state.id).toBe('account-123')
  })

  // ── onClose ───────────────────────────────────────────────────────────────

  // onClose() closes the sheet AND clears the id — this is critical so that
  // reopening doesn't show a stale id from the previous account.
  it('onClose() closes the sheet and clears the id', () => {
    useAccountState.getState().onOpen('account-456')
    useAccountState.getState().onClose()
    const state = useAccountState.getState()
    expect(state.isOpen).toBe(false)
    expect(state.id).toBeUndefined()
  })

  // ── Sequence ──────────────────────────────────────────────────────────────

  // Verify a full open→close→open sequence works correctly —
  // this simulates the real flow of a user navigating accounts.
  it('open→close→open sequence works correctly', () => {
    useAccountState.getState().onOpen('account-789')
    expect(useAccountState.getState().id).toBe('account-789')

    useAccountState.getState().onClose()
    expect(useAccountState.getState().isOpen).toBe(false)

    useAccountState.getState().onOpen()
    expect(useAccountState.getState().isOpen).toBe(true)
    expect(useAccountState.getState().id).toBeUndefined()
  })
})
