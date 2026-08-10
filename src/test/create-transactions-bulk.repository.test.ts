import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTransactionsBulk } from '@/repository/transaction'
import { bankAccountsTable, transactionsTable } from '@/db/schema'

// ── Section: Hoisted mocks ─────────────────────────────────────────────────────
// vi.hoisted() guarantees the mock references exist before vi.mock factories run.
// ────────────────────────────────────────────────────────────────────────────────

const {
  mockTransaction,
  mockInsertTable,
  mockInsertValues,
  mockInsertReturning,
  mockUpdateTable,
  mockUpdateSet,
  mockUpdateWhere,
} = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
  mockInsertTable: vi.fn(),
  mockInsertValues: vi.fn(),
  mockInsertReturning: vi.fn(),
  mockUpdateTable: vi.fn(),
  mockUpdateSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
}))

// ── Section: Module mocks ──────────────────────────────────────────────────────
// The mock replicates the drizzle chainable API inside a db.transaction callback:
//   tx.insert(table).values(data).returning()
//   tx.update(table).set(data).where(cond)          ← where resolves
// The terminal fns are hoisted; chain steps are plain objects so clearAllMocks
// does not break the chain structure.
// ────────────────────────────────────────────────────────────────────────────────

mockTransaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
  const tx = {
    insert: (table: unknown) => {
      mockInsertTable(table)
      return {
        values: (data: unknown) => {
          mockInsertValues(data)
          return { returning: mockInsertReturning }
        },
      }
    },
    update: (table: unknown) => {
      mockUpdateTable(table)
      return { set: mockUpdateSet }
    },
  }
  return callback(tx)
})

mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
mockUpdateWhere.mockResolvedValue(undefined)

vi.mock('@/db', () => ({
  db: { transaction: mockTransaction },
}))

// ── Section: Helpers ────────────────────────────────────────────────────────────
// Drizzle `sql` templates embed interpolated strings as raw string chunks (the
// String(rounded) conversion in D3 keeps the net delta as a decimal literal).
// This walker collects those raw chunks so the net-balance UPDATE is assertable.
// ────────────────────────────────────────────────────────────────────────────────

const sqlStringChunks = (node: unknown): string[] => {
  if (typeof node === 'string') return [node]
  if (typeof node === 'number') return [String(node)]
  if (
    node &&
    typeof node === 'object' &&
    Array.isArray((node as { queryChunks?: unknown[] }).queryChunks)
  ) {
    return (node as { queryChunks: unknown[] }).queryChunks.flatMap(chunk => sqlStringChunks(chunk))
  }
  // Boxed number chunk (drizzle Number wrapper around an interpolated count).
  if (node && typeof node === 'object' && (node as { constructor?: { name?: string } }).constructor?.name === 'Number') {
    return [String(Number(node))]
  }
  return []
}

const MOCK_USER_ID = 'user-123'
const MOCK_ACCOUNT_ID = 'acc-456'

/** A validated row exactly as createTransactionsBulk receives it (accountId injected). */
const VALID_ROW = {
  accountId: MOCK_ACCOUNT_ID,
  amount: 2000,
  payee: 'Client Payment',
  date: new Date('2026-08-10T00:00:00'),
  type: 'income' as const,
}

// ── Section: Tests ──────────────────────────────────────────────────────────────
// createTransactionsBulk(rows, userId): one db.transaction → insert all rows →
// single net balance/count UPDATE (D3, defect 6). Fixture CSV-IMP-09:
// income 2000.00 + income 500.00 − expense 120.50 → net +2379.50, count +3.
// ────────────────────────────────────────────────────────────────────────────────

describe('createTransactionsBulk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('inserts', () => {
    it('runs inside a single db.transaction', async () => {
      mockInsertReturning.mockResolvedValue([])

      await createTransactionsBulk([], MOCK_USER_ID)

      expect(mockTransaction).toHaveBeenCalledTimes(1)
    })

    it('inserts all rows into transactionsTable with userId and String(amount)', async () => {
      const created = [
        { id: 'tx-1', amount: '2000' },
        { id: 'tx-2', amount: '120.5' },
      ]
      mockInsertReturning.mockResolvedValue(created)

      const result = await createTransactionsBulk(
        [VALID_ROW, { ...VALID_ROW, amount: 120.5, payee: 'Grocery', type: 'expense' }],
        MOCK_USER_ID,
      )

      expect(result).toEqual(created)
      expect(mockInsertTable).toHaveBeenCalledWith(transactionsTable)
      expect(mockInsertValues).toHaveBeenCalledTimes(1)
      const inserted = mockInsertValues.mock.calls[0][0]
      expect(inserted).toHaveLength(2)
      expect(inserted[0]).toMatchObject({ userId: MOCK_USER_ID, amount: '2000', accountId: MOCK_ACCOUNT_ID })
      expect(inserted[1]).toMatchObject({ userId: MOCK_USER_ID, amount: '120.5', type: 'expense' })
    })

    it('returns the created transactions', async () => {
      const created = [
        { id: 'tx-1', amount: '2000', userId: MOCK_USER_ID },
        { id: 'tx-2', amount: '500', userId: MOCK_USER_ID },
        { id: 'tx-3', amount: '120.5', userId: MOCK_USER_ID },
      ]
      mockInsertReturning.mockResolvedValue(created)

      const result = await createTransactionsBulk(
        [
          VALID_ROW,
          { ...VALID_ROW, amount: 500, payee: 'Cash Deposit' },
          { ...VALID_ROW, amount: 120.5, payee: 'Grocery', type: 'expense' },
        ],
        MOCK_USER_ID,
      )

      expect(result).toHaveLength(3)
      expect(result).toEqual(created)
    })
  })

  describe('net balance UPDATE (D3, defect 6)', () => {
    const fixtureRows = [
      VALID_ROW, // income 2000.00
      { ...VALID_ROW, amount: 500, payee: 'Cash Deposit' }, // income 500.00
      { ...VALID_ROW, amount: 120.5, payee: 'Grocery Store', type: 'expense' as const }, // expense 120.50
    ]

    it('applies exactly ONE balance/count UPDATE after the insert', async () => {
      mockInsertReturning.mockResolvedValue([{ id: 'tx-1' }, { id: 'tx-2' }, { id: 'tx-3' }])

      await createTransactionsBulk(fixtureRows, MOCK_USER_ID)

      expect(mockUpdateSet).toHaveBeenCalledTimes(1)
      expect(mockUpdateWhere).toHaveBeenCalledTimes(1)
    })

    it('updates bankAccountsTable with the rounded net delta as a decimal string', async () => {
      mockInsertReturning.mockResolvedValue([{ id: 'tx-1' }, { id: 'tx-2' }, { id: 'tx-3' }])

      await createTransactionsBulk(fixtureRows, MOCK_USER_ID)

      expect(mockUpdateTable).toHaveBeenCalledWith(bankAccountsTable)
      const setPayload = mockUpdateSet.mock.calls[0][0] as { balance: unknown; transactionsCount: unknown }
      // income 2000.00 + 500.00 − 120.50 = 2379.50 → String(2379.5)
      expect(sqlStringChunks(setPayload.balance)).toContain('2379.5')
      expect(sqlStringChunks(setPayload.transactionsCount)).toContain('3')
    })

    it('targets the account shared by the rows', async () => {
      mockInsertReturning.mockResolvedValue([{ id: 'tx-1' }])

      await createTransactionsBulk([VALID_ROW], MOCK_USER_ID)

      expect(mockUpdateWhere).toHaveBeenCalledTimes(1)
    })

    it('skips the balance UPDATE when no rows were inserted', async () => {
      mockInsertReturning.mockResolvedValue([])

      await createTransactionsBulk([], MOCK_USER_ID)

      expect(mockUpdateSet).not.toHaveBeenCalled()
      expect(mockUpdateWhere).not.toHaveBeenCalled()
    })
  })
})
