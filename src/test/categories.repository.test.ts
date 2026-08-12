import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getCategoriesByUserId,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  countCategoriesByUserId,
  createManyCategories,
} from '@/repository/categories'

// ── Mocks ─────────────────────────────────────────────────────────────────────
// We hoist all mock references so vi.mock can use them (vi.mock is also hoisted,
// but vi.hoisted guarantees these variables exist before any mock factory runs).

const {
  mockFindMany,
  mockFindFirst,
  mockInsertReturning,
  mockUpdateReturning,
  mockSelectWhere,
  mockDeleteReturning,
} = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockFindFirst: vi.fn(),
  mockInsertReturning: vi.fn(),
  mockUpdateReturning: vi.fn(),
  mockSelectWhere: vi.fn(),
  mockDeleteReturning: vi.fn(),
}))

// The mock replicates the drizzle-orm chainable API:
//   db.query.categoriesTable.findMany / findFirst
//   db.insert(table).values(data).returning()
//   db.update(table).set(data).where(cond).returning()
//   db.select(cols).from(table).where(cond)          ← returns array directly
//   db.delete(table).where(cond).returning()
//
// Intermediate chain steps (.values, .set, .where, .from) are plain functions
// that return the next step object.  Only the terminal mocks are hoisted so
// vi.clearAllMocks() in beforeEach won't break the chain structure.

vi.mock('@/db', () => ({
  db: {
    query: {
      categoriesTable: {
        findMany: mockFindMany,
        findFirst: mockFindFirst,
      },
    },
    // insert chain: insert() → values() → returning()
    insert: (_table: unknown) => ({
      values: (_data: unknown) => ({
        returning: mockInsertReturning,
      }),
    }),
    // update chain: update() → set() → where() → returning()
    update: (_table: unknown) => ({
      set: (_data: unknown) => ({
        where: (_where: unknown) => ({
          returning: mockUpdateReturning,
        }),
      }),
    }),
    // select chain: select() → from() → where()  (returns result array)
    select: (_columns: unknown) => ({
      from: (_table: unknown) => ({
        where: mockSelectWhere,
        innerJoin: (_table: unknown, _condition: unknown) => ({ where: mockSelectWhere }),
      }),
    }),
    // delete chain: delete() → where() → returning()
    delete: (_table: unknown) => ({
      where: (_where: unknown) => ({
        returning: mockDeleteReturning,
      }),
    }),
  },
}))

// ── Test Data ─────────────────────────────────────────────────────────────────

const mockUserId = 'user-123'
const mockCategoryId = 'cat-456'

/** A full category row as returned by a select query. */
const mockCategory = {
  id: mockCategoryId,
  plaidId: null,
  userId: mockUserId,
  name: 'Food',
  icon: '🍽️',
  color: '#FF0000',
  type: 'expense' as const,
  isDefault: false,
  order: 0,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
}

/** Minimal insert payload (required fields only). */
const mockInsertData = {
  userId: mockUserId,
  name: 'Food',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Categories Repository', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress expected console.error output from error-path tests.
    // The source code logs errors via console.error() — this is correct behavior,
    // but it clutters test output. We spy and suppress during tests, then restore.
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  // ── getCategoriesByUserId ──────────────────────────────────────────────────

  describe('getCategoriesByUserId', () => {
    it('returns all categories for the given user when no type filter is provided', async () => {
      mockFindMany.mockResolvedValue([mockCategory])

      const result = await getCategoriesByUserId(mockUserId)

      expect(result).toEqual([mockCategory])
      expect(mockFindMany).toHaveBeenCalledTimes(1)
      // The where clause and orderBy are generated internally; we verify the
      // call shape without asserting exact drizzle condition objects.
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.anything(),
          orderBy: expect.any(Function),
        }),
      )
    })

    it('passes the type filter in the where clause when type is provided', async () => {
      const expenseOnly = [{ ...mockCategory, type: 'expense' as const }]
      mockFindMany.mockResolvedValue(expenseOnly)

      const result = await getCategoriesByUserId(mockUserId, 'expense')

      expect(result).toEqual(expenseOnly)
      expect(mockFindMany).toHaveBeenCalledTimes(1)
      // We can't inspect the drizzle condition object easily, but we verify
      // findMany was still called with the expected shape.
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      )
    })

    it('throws "Error getting categories" when the database query fails', async () => {
      mockFindMany.mockRejectedValue(new Error('DB connection lost'))

      await expect(getCategoriesByUserId(mockUserId)).rejects.toThrow(
        'Error getting categories',
      )
    })
  })

  // ── getCategoryById ────────────────────────────────────────────────────────

  describe('getCategoryById', () => {
    it('returns the matching category when found', async () => {
      mockFindFirst.mockResolvedValue(mockCategory)

      const result = await getCategoryById(mockCategoryId, mockUserId)

      expect(result).toEqual(mockCategory)
      expect(mockFindFirst).toHaveBeenCalledTimes(1)
      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.anything() }),
      )
    })

    it('returns undefined when no category matches the id and userId', async () => {
      mockFindFirst.mockResolvedValue(undefined)

      const result = await getCategoryById('non-existent-id', mockUserId)

      expect(result).toBeUndefined()
    })

    it('throws "Error getting category" when the database query fails', async () => {
      mockFindFirst.mockRejectedValue(new Error('DB timeout'))

      await expect(getCategoryById(mockCategoryId, mockUserId)).rejects.toThrow(
        'Error getting category',
      )
    })
  })

  // ── createCategory ─────────────────────────────────────────────────────────

  describe('createCategory', () => {
    it('inserts and returns the newly created category', async () => {
      // .returning() returns an array; the function destructures the first element.
      mockInsertReturning.mockResolvedValue([mockCategory])

      const result = await createCategory(mockInsertData)

      expect(result).toEqual(mockCategory)
    })

    it('throws "Error creating category" when the insert fails', async () => {
      mockInsertReturning.mockRejectedValue(new Error('unique constraint violation'))

      await expect(createCategory(mockInsertData)).rejects.toThrow(
        'Error creating category',
      )
    })
  })

  // ── updateCategory ─────────────────────────────────────────────────────────

  describe('updateCategory', () => {
    it('updates and returns the modified category', async () => {
      const updatedCategory = { ...mockCategory, name: 'Groceries' }
      mockUpdateReturning.mockResolvedValue([updatedCategory])

      const result = await updateCategory(mockCategoryId, mockUserId, {
        name: 'Groceries',
      })

      expect(result).toEqual(updatedCategory)
    })

    it('throws "Error updating category" when the update fails', async () => {
      mockUpdateReturning.mockRejectedValue(new Error('DB connection lost'))

      await expect(
        updateCategory(mockCategoryId, mockUserId, { name: 'X' }),
      ).rejects.toThrow('Error updating category')
    })
  })

  // ── deleteCategory ─────────────────────────────────────────────────────────

  describe('deleteCategory', () => {
    it('deletes and returns the category when no transactions reference it', async () => {
      // count = 0 → no transactions → delete proceeds
      mockSelectWhere.mockResolvedValue([{ count: 0 }])
      mockDeleteReturning.mockResolvedValue([mockCategory])

      const result = await deleteCategory(mockCategoryId, mockUserId)

      expect(result).toEqual({ category: mockCategory, archived: false })
      expect(mockSelectWhere).toHaveBeenCalledTimes(2)
      // The delete query should follow.
      expect(mockDeleteReturning).toHaveBeenCalledTimes(1)
    })

    it('archives when the category has associated transactions', async () => {
      mockSelectWhere.mockResolvedValue([{ count: 5 }])
      mockUpdateReturning.mockResolvedValue([mockCategory])

      await expect(deleteCategory(mockCategoryId, mockUserId)).resolves.toEqual({
        category: mockCategory,
        archived: true,
      })
      expect(mockDeleteReturning).not.toHaveBeenCalled()
    })

    it('propagates database errors from the transaction-check select query', async () => {
      mockSelectWhere.mockRejectedValue(new Error('DB read error'))

      await expect(deleteCategory(mockCategoryId, mockUserId)).rejects.toThrow(
        'DB read error',
      )

      // Delete should never be reached.
      expect(mockDeleteReturning).not.toHaveBeenCalled()
    })
  })

  // ── countCategoriesByUserId ────────────────────────────────────────────────

  describe('countCategoriesByUserId', () => {
    it('returns the numeric count of categories for the user', async () => {
      mockSelectWhere.mockResolvedValue([{ count: 7 }])

      const result = await countCategoriesByUserId(mockUserId)

      // The function wraps the raw count with Number().
      expect(result).toBe(7)
      expect(mockSelectWhere).toHaveBeenCalledTimes(1)
    })

    it('returns 0 when the user has no categories', async () => {
      mockSelectWhere.mockResolvedValue([{ count: 0 }])

      const result = await countCategoriesByUserId(mockUserId)

      expect(result).toBe(0)
    })

    it('throws "Error counting categories" when the query fails', async () => {
      mockSelectWhere.mockRejectedValue(new Error('DB read error'))

      await expect(countCategoriesByUserId(mockUserId)).rejects.toThrow(
        'Error counting categories',
      )
    })
  })

  // ── createManyCategories ───────────────────────────────────────────────────

  describe('createManyCategories', () => {
    it('bulk-inserts and returns all created categories', async () => {
      const secondCategory = {
        ...mockCategory,
        id: 'cat-789',
        name: 'Transport',
      }
      mockInsertReturning.mockResolvedValue([mockCategory, secondCategory])

      const result = await createManyCategories([
        mockInsertData,
        { ...mockInsertData, name: 'Transport' },
      ])

      expect(result).toHaveLength(2)
      expect(result).toEqual([mockCategory, secondCategory])
    })

    it('throws "Error creating multiple categories" when the bulk insert fails', async () => {
      mockInsertReturning.mockRejectedValue(new Error('DB constraint violation'))

      await expect(createManyCategories([mockInsertData])).rejects.toThrow(
        'Error creating multiple categories',
      )
    })
  })
})
