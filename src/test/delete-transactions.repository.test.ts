import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteTransactions } from '@/repository/transaction'
import { bankAccountsTable, transactionsTable } from '@/db/schema'

// ── Section: Hoisted mocks ─────────────────────────────────────────────────────
// vi.hoisted() guarantees the mock references exist before vi.mock factories run.
// ────────────────────────────────────────────────────────────────────────────────

const {
  mockTransaction,
  mockSelectFrom,
  mockSelectWhere,
  mockDeleteTable,
  mockDeleteWhere,
  mockDeleteReturning,
  mockUpdateTable,
  mockUpdateSet,
  mockUpdateWhere,
} = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
  mockSelectFrom: vi.fn(),
  mockSelectWhere: vi.fn(),
  mockDeleteTable: vi.fn(),
  mockDeleteWhere: vi.fn(),
  mockDeleteReturning: vi.fn(),
  mockUpdateTable: vi.fn(),
  mockUpdateSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
}))

// ── Section: Module mocks ──────────────────────────────────────────────────────
// Replicates the drizzle chainable API inside a db.transaction callback for the
// shapes used by deleteTransactions:
//   tx.select(...).from(table).where(cond)              ← resolves owned rows
//   tx.delete(table).where(cond).returning()            ← resolves deleted rows
//   tx.update(table).set(data).where(cond)              ← resolves undefined
// ────────────────────────────────────────────────────────────────────────────────

mockTransaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
  const tx = {
    select: () => {
      return { from: mockSelectFrom }
    },
    delete: (table: unknown) => {
      mockDeleteTable(table)
      return { where: mockDeleteWhere }
    },
    update: (table: unknown) => {
      mockUpdateTable(table)
      return { set: mockUpdateSet }
    },
  }
  return callback(tx)
})

mockSelectFrom.mockReturnValue({ where: mockSelectWhere })
mockSelectWhere.mockResolvedValue([])
mockDeleteWhere.mockReturnValue({ returning: mockDeleteReturning })
mockDeleteReturning.mockResolvedValue([])
mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
mockUpdateWhere.mockResolvedValue(undefined)

vi.mock('@/db', () => ({
  db: { transaction: mockTransaction },
}))

// ── Section: Helpers ────────────────────────────────────────────────────────────

/**
 * Flattens every string leaf of a drizzle `sql` template in order. Walks both
 * the `queryChunks` arrays and the `value` arrays of StringChunk wrappers so
 * interpolated values and `sql.raw(...)` signs are all visible.
 */
const flattenStrings = (node: unknown): string[] => {
  if (typeof node === 'string') return [node]
  if (typeof node === 'number') return [String(node)]
  if (node && typeof node === 'object') {
    const out: string[] = []
    const chunks = (node as { queryChunks?: unknown[] }).queryChunks
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) out.push(...flattenStrings(chunk))
    }
    const value = (node as { value?: unknown }).value
    if (Array.isArray(value)) {
      for (const leaf of value) out.push(...flattenStrings(leaf))
    }
    return out
  }
  return []
}

const MOCK_USER_ID = 'user-123'

const OWNED_ROW = (id: string, amount: string, type: 'income' | 'expense', accountId: string) => ({
  id,
  amount,
  type,
  accountId,
})

// ── Section: Tests ──────────────────────────────────────────────────────────────

describe('deleteTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns [] without touching the database when ids is empty', async () => {
    const result = await deleteTransactions([], MOCK_USER_ID)

    expect(result).toEqual([])
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('only selects transactions owned by the user', async () => {
    mockSelectWhere.mockResolvedValue([
      OWNED_ROW('tx-1', '100', 'income', 'acc-a'),
      OWNED_ROW('tx-2', '40', 'expense', 'acc-a'),
    ])
    mockDeleteReturning.mockResolvedValue([{ id: 'tx-1' }, { id: 'tx-2' }])

    await deleteTransactions(['tx-1', 'tx-2', 'tx-3'], MOCK_USER_ID)

    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockSelectFrom).toHaveBeenCalledWith(transactionsTable)
    expect(mockDeleteTable).toHaveBeenCalledWith(transactionsTable)
  })

  it('deletes exactly the owned ids, never rows of another user', async () => {
    mockSelectWhere.mockResolvedValue([OWNED_ROW('tx-1', '50', 'expense', 'acc-a')])
    mockDeleteReturning.mockResolvedValue([{ id: 'tx-1' }])

    const result = await deleteTransactions(['tx-1', 'foreign-tx'], MOCK_USER_ID)

    expect(result).toHaveLength(1)
    expect(mockDeleteReturning).toHaveBeenCalledTimes(1)
  })

  it('returns [] and skips updates when the user owns none of the ids', async () => {
    mockSelectWhere.mockResolvedValue([])

    const result = await deleteTransactions(['tx-1'], MOCK_USER_ID)

    expect(result).toEqual([])
    expect(mockUpdateSet).not.toHaveBeenCalled()
  })

  it('reverses the net balance and count once per affected account', async () => {
    mockSelectWhere.mockResolvedValue([
      OWNED_ROW('tx-1', '100', 'income', 'acc-a'),
      OWNED_ROW('tx-2', '40', 'expense', 'acc-a'),
    ])
    mockDeleteReturning.mockResolvedValue([{ id: 'tx-1' }, { id: 'tx-2' }])

    await deleteTransactions(['tx-1', 'tx-2'], MOCK_USER_ID)

    expect(mockUpdateTable).toHaveBeenCalledTimes(1)
    expect(mockUpdateTable).toHaveBeenCalledWith(bankAccountsTable)
    const setPayload = mockUpdateSet.mock.calls[0][0] as {
      balance: unknown
      transactionsCount: unknown
    }
    // income 100 removed (−), expense 40 added back (+) → net effect was +60
    expect(flattenStrings(setPayload.balance)).toContain('-')
    expect(flattenStrings(setPayload.balance)).toContain('60')
    expect(flattenStrings(setPayload.transactionsCount)).toContain('2')
  })

  it('handles multiple accounts with independent reversals', async () => {
    mockSelectWhere.mockResolvedValue([
      OWNED_ROW('tx-1', '500', 'income', 'acc-a'),
      OWNED_ROW('tx-2', '30', 'expense', 'acc-b'),
      OWNED_ROW('tx-3', '20', 'expense', 'acc-b'),
    ])
    mockDeleteReturning.mockResolvedValue([{ id: 'tx-1' }, { id: 'tx-2' }, { id: 'tx-3' }])

    await deleteTransactions(['tx-1', 'tx-2', 'tx-3'], MOCK_USER_ID)

    expect(mockUpdateSet).toHaveBeenCalledTimes(2)

    const calls = mockUpdateSet.mock.calls.map((call: unknown[]) => {
      const payload = call[0] as { balance: unknown; transactionsCount: unknown }
      return {
        balance: flattenStrings(payload.balance),
        count: flattenStrings(payload.transactionsCount),
      }
    })

    // acc-a: income 500 removed → balance − 500, count − 1
    expect(calls).toContainEqual({
      balance: expect.arrayContaining(['-', '500']),
      count: expect.arrayContaining(['1']),
    })
    // acc-b: two expenses 30 + 20 added back → balance + 50, count − 2
    expect(calls).toContainEqual({
      balance: expect.arrayContaining(['+', '50']),
      count: expect.arrayContaining(['2']),
    })
  })
})
