import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTransactionDrawer } from '@/hooks/use-transaction-drawer'
import type { Transaction } from '@/interfaces'

// ── Test Data ──────────────────────────────────────────────────────────────────

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'tx-1',
  type: 'expense',
  amount: '1500',
  payee: 'Grocery Store',
  accountId: 'acc-1',
  categoryId: 'cat-1',
  notes: null,
  date: new Date('2024-06-15'),
  userId: 'user-1',
  createdAt: new Date('2024-06-15'),
  updatedAt: new Date('2024-06-15'),
  deletedAt: null,
  accountName: 'Checking',
  categoryName: 'Food',
  ...overrides,
})

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useTransactionDrawer', () => {
  it('initializes with drawer closed and no selected transaction', () => {
    const { result } = renderHook(() => useTransactionDrawer())

    expect(result.current.isOpen).toBe(false)
    expect(result.current.transaction).toBeNull()
  })

  it('opens drawer with transaction data when onOpen is called', () => {
    const { result } = renderHook(() => useTransactionDrawer())
    const tx = makeTransaction()

    act(() => {
      result.current.onOpen(tx)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.transaction).toEqual(tx)
  })

  it('closes drawer and clears transaction when onClose is called', () => {
    const { result } = renderHook(() => useTransactionDrawer())
    const tx = makeTransaction()

    act(() => {
      result.current.onOpen(tx)
    })

    expect(result.current.isOpen).toBe(true)
    expect(result.current.transaction).not.toBeNull()

    act(() => {
      result.current.onClose()
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.transaction).toBeNull()
  })

  it('replaces previous transaction when onOpen is called with a different transaction', () => {
    const { result } = renderHook(() => useTransactionDrawer())
    const tx1 = makeTransaction({ id: 'tx-1', payee: 'Store A' })
    const tx2 = makeTransaction({ id: 'tx-2', payee: 'Store B' })

    act(() => {
      result.current.onOpen(tx1)
    })

    expect(result.current.transaction?.id).toBe('tx-1')

    act(() => {
      result.current.onOpen(tx2)
    })

    expect(result.current.transaction?.id).toBe('tx-2')
  })

  it('can open and close multiple times without issues', () => {
    const { result } = renderHook(() => useTransactionDrawer())
    const tx = makeTransaction()

    // Open → Close → Open → Close
    act(() => result.current.onOpen(tx))
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.onClose())
    expect(result.current.isOpen).toBe(false)

    act(() => result.current.onOpen(tx))
    expect(result.current.isOpen).toBe(true)

    act(() => result.current.onClose())
    expect(result.current.isOpen).toBe(false)
  })
})
