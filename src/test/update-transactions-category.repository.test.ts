import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { updateTransactionsCategory } from '@/repository/transaction'
import { bankAccountsTable, transactionsTable } from '@/db/schema'

// ── Section: Hoisted mocks ─────────────────────────────────────────────────────
// vi.hoisted() guarantees the mock references exist before vi.mock factories run.
// The mock replicates the drizzle chainable API:
//   db.update(table).set(data).where(cond)          ← where resolves
// The terminal fn is hoisted; chain steps are plain objects so clearAllMocks
// does not break the chain structure.
// ────────────────────────────────────────────────────────────────────────────────

const {
  mockDbUpdate,
  mockUpdateSet,
  mockUpdateWhere,
} = vi.hoisted(() => ({
  mockDbUpdate: vi.fn(),
  mockUpdateSet: vi.fn(),
  mockUpdateWhere: vi.fn(),
}))

mockDbUpdate.mockReturnValue({ set: mockUpdateSet })
mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
mockUpdateWhere.mockResolvedValue({ rowCount: 2 })

vi.mock('@/db', () => ({
  db: { update: mockDbUpdate },
}))

// ── Section: Helpers ────────────────────────────────────────────────────────────
// Drizzle SQL objects (and/eq/inArray) embed column refs and param values as
// nested chunks. This walker flattens them into a stable string list so the
// WHERE clause (ownership filter) is assertable without compiling to SQL.
// ────────────────────────────────────────────────────────────────────────────────

const NAME = Symbol.for('drizzle:Name')

const whereChunks = (node: unknown): string[] => {
  if (node === null || node === undefined) return []
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return [`${typeof node}:${String(node)}`]
  }
  if (typeof node === 'object') {
    const n = node as Record<string, unknown> & { value?: unknown; name?: string; table?: unknown }
    const out: string[] = []
    if (Array.isArray(n.queryChunks)) {
      for (const chunk of n.queryChunks) out.push(...whereChunks(chunk))
    } else if (Array.isArray(n.value)) {
      for (const v of n.value) out.push(...whereChunks(v))
    } else if (typeof n.value !== 'undefined' && n.value !== null) {
      out.push(`param:${String(n.value)}`)
    } else if (typeof n.name === 'string' && n.table) {
      const t = n.table as { [NAME]?: string }
      out.push(`column:${t[NAME] ?? '?'}.${n.name}`)
    }
    return out
  }
  return []
}

const MOCK_USER_ID = 'user-123'
const MOCK_CATEGORY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const MOCK_TX_IDS = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
]

// ── Section: Tests ──────────────────────────────────────────────────────────────
// updateTransactionsCategory(categoryId, ids, userId): ONE UPDATE on the
// transactions table scoped by inArray(id) AND eq(userId) — ownership is
// enforced in the repo. Category changes never touch account balances.
// ────────────────────────────────────────────────────────────────────────────────

describe('updateTransactionsCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbUpdate.mockReturnValue({ set: mockUpdateSet })
    mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue({ rowCount: 2 })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('update', () => {
    it('runs a single UPDATE on the transactions table', async () => {
      await updateTransactionsCategory(MOCK_CATEGORY_ID, MOCK_TX_IDS, MOCK_USER_ID)

      expect(mockDbUpdate).toHaveBeenCalledTimes(1)
      expect(mockDbUpdate).toHaveBeenCalledWith(transactionsTable)
    })

    it('sets only the categoryId column', async () => {
      await updateTransactionsCategory(MOCK_CATEGORY_ID, MOCK_TX_IDS, MOCK_USER_ID)

      expect(mockUpdateSet).toHaveBeenCalledTimes(1)
      expect(mockUpdateSet).toHaveBeenCalledWith({ categoryId: MOCK_CATEGORY_ID })
    })

    it('returns the number of updated rows', async () => {
      mockUpdateWhere.mockResolvedValue({ rowCount: 3 })

      const result = await updateTransactionsCategory(MOCK_CATEGORY_ID, MOCK_TX_IDS, MOCK_USER_ID)

      expect(result).toBe(3)
    })

    it('returns 0 when no rows matched', async () => {
      mockUpdateWhere.mockResolvedValue({ rowCount: 0 })

      const result = await updateTransactionsCategory(MOCK_CATEGORY_ID, MOCK_TX_IDS, MOCK_USER_ID)

      expect(result).toBe(0)
    })

    it('returns 0 without querying when ids is empty', async () => {
      const result = await updateTransactionsCategory(MOCK_CATEGORY_ID, [], MOCK_USER_ID)

      expect(result).toBe(0)
      expect(mockDbUpdate).not.toHaveBeenCalled()
    })
  })

  describe('ownership filter', () => {
    it('scopes the update by both id AND userId', async () => {
      await updateTransactionsCategory(MOCK_CATEGORY_ID, MOCK_TX_IDS, MOCK_USER_ID)

      expect(mockUpdateWhere).toHaveBeenCalledTimes(1)
      const whereClause = mockUpdateWhere.mock.calls[0][0]
      const chunks = whereChunks(whereClause)
      expect(chunks).toContain('column:transaction.id')
      expect(chunks).toContain('column:transaction.userId')
      expect(chunks).toContain(`param:${MOCK_USER_ID}`)
    })

    it('never updates rows owned by another user', async () => {
      // rowCount 0 simulates the user-owner WHERE matching no rows.
      mockUpdateWhere.mockResolvedValue({ rowCount: 0 })

      const result = await updateTransactionsCategory(
        MOCK_CATEGORY_ID,
        ['11111111-1111-4111-8111-111111111111'],
        MOCK_USER_ID,
      )

      expect(result).toBe(0)
      const whereClause = mockUpdateWhere.mock.calls[0][0]
      expect(whereChunks(whereClause)).toContain('column:transaction.userId')
      expect(whereChunks(whereClause)).toContain(`param:${MOCK_USER_ID}`)
    })
  })

  describe('account balance untouched', () => {
    it('only touches the transactions table, never the bank accounts table', async () => {
      await updateTransactionsCategory(MOCK_CATEGORY_ID, MOCK_TX_IDS, MOCK_USER_ID)

      expect(mockDbUpdate).toHaveBeenCalledTimes(1)
      expect(mockDbUpdate).not.toHaveBeenCalledWith(bankAccountsTable)
    })
  })

  describe('error handling', () => {
    it('throws when the database rejects', async () => {
      mockUpdateWhere.mockRejectedValue(new Error('DB connection failed'))

      await expect(
        updateTransactionsCategory(MOCK_CATEGORY_ID, MOCK_TX_IDS, MOCK_USER_ID),
      ).rejects.toThrow('Could not update the transactions category.')
    })
  })
})
