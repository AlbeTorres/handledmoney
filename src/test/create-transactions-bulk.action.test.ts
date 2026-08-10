import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTransactionsBulkAction } from '@/actions/transaction/create-transaction'

// ── Section: Hoisted mocks ─────────────────────────────────────────────────────
// vi.hoisted() guarantees the mock references exist before vi.mock factories run.
// ────────────────────────────────────────────────────────────────────────────────

const {
  mockGetSession,
  mockHeaders,
  mockGetBankAccountById,
  mockCreateTransaction,
  mockCreateTransactionsBulk,
  mockRevalidatePath,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockHeaders: vi.fn(),
  mockGetBankAccountById: vi.fn(),
  mockCreateTransaction: vi.fn(),
  mockCreateTransactionsBulk: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

// ── Section: Module mocks ───────────────────────────────────────────────────────
// The real Zod schema (@/lib/schema) and MAX_IMPORT_ROWS (@/lib/csv/constants)
// are NOT mocked so validation and the cap behave as in production.
// ────────────────────────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))

vi.mock('next/headers', () => ({
  headers: mockHeaders,
}))

vi.mock('@/repository/account', () => ({
  getBankAccountById: mockGetBankAccountById,
}))

vi.mock('@/repository/transaction', () => ({
  createTransaction: mockCreateTransaction,
  createTransactionsBulk: mockCreateTransactionsBulk,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

// ── Section: Helpers ────────────────────────────────────────────────────────────
// Valid row data matches the CSVTransaction payload shape (no accountId — D2).
// ────────────────────────────────────────────────────────────────────────────────

const MOCK_USER_ID = 'user-123'
const MOCK_ACCOUNT_ID = 'acc-456'

const AUTHENTICATED_SESSION = { user: { id: MOCK_USER_ID } }
/** { user: { id: null } } — session?.user.id must not throw (matches repo test convention). */
const UNAUTHENTICATED_SESSION = { user: { id: null } }

const MOCK_ACCOUNT = {
  id: MOCK_ACCOUNT_ID,
  userId: MOCK_USER_ID,
  name: 'Checking',
}

/** A valid CSV transaction row: amount positive, payee present, type in enum. */
const VALID_ROW = {
  amount: 2000,
  payee: 'Client Payment',
  date: new Date('2026-08-10T00:00:00'),
  type: 'income' as const,
}

const CREATED_TRANSACTION = {
  id: 'tx-created-001',
  userId: MOCK_USER_ID,
  accountId: MOCK_ACCOUNT_ID,
  amount: '2000',
  payee: 'Client Payment',
  date: new Date('2026-08-10T00:00:00'),
  type: 'income',
}

function setupSuccessfulDefaults() {
  mockGetSession.mockResolvedValue(AUTHENTICATED_SESSION)
  mockHeaders.mockResolvedValue({})
  mockGetBankAccountById.mockResolvedValue(MOCK_ACCOUNT)
  mockCreateTransactionsBulk.mockResolvedValue([CREATED_TRANSACTION])
  mockRevalidatePath.mockImplementation(() => {})
}

// ── Section: Tests ──────────────────────────────────────────────────────────────
// createTransactionsBulkAction({ accountId, rows }): session → account ownership
// → cap → per-row safeParse({...row, accountId}) → RowError[] → all-or-nothing
// → revalidatePath. Covers CSV-IMP-01 (ownership), CSV-IMP-05 (amount), CSV-IMP-09.
// ────────────────────────────────────────────────────────────────────────────────

describe('createTransactionsBulkAction', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    setupSuccessfulDefaults()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  // ── Authentication (CSV-IMP-09: unauthorized → zero rows) ─────────────────

  describe('authentication', () => {
    it('returns 401 when session has no user id', async () => {
      mockGetSession.mockResolvedValue(UNAUTHENTICATED_SESSION)

      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [VALID_ROW],
      })

      expect(result).toEqual({
        success: false,
        status: 401,
        message: 'Unauthorized',
        data: null,
      })
    })

    it('returns 401 when session is null', async () => {
      mockGetSession.mockResolvedValue(null)

      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [VALID_ROW],
      })

      expect(result.success).toBe(false)
      expect(result.status).toBe(401)
    })

    it('does not validate ownership or insert when unauthorized', async () => {
      mockGetSession.mockResolvedValue(null)

      await createTransactionsBulkAction({ accountId: MOCK_ACCOUNT_ID, rows: [VALID_ROW] })

      expect(mockGetBankAccountById).not.toHaveBeenCalled()
      expect(mockCreateTransactionsBulk).not.toHaveBeenCalled()
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })
  })

  // ── Account ownership (CSV-IMP-01/M0.6: foreign account → 0 rows) ─────────

  describe('account ownership', () => {
    it('returns 404 and inserts zero rows when the account does not belong to the user', async () => {
      mockGetBankAccountById.mockResolvedValue(undefined)

      const result = await createTransactionsBulkAction({
        accountId: 'someone-elses-account',
        rows: [VALID_ROW],
      })

      expect(result).toEqual({
        success: false,
        status: 404,
        message: 'Account not found',
        data: null,
      })
      expect(mockCreateTransactionsBulk).not.toHaveBeenCalled()
    })

    it('looks up the account with the session userId', async () => {
      await createTransactionsBulkAction({ accountId: MOCK_ACCOUNT_ID, rows: [VALID_ROW] })

      expect(mockGetBankAccountById).toHaveBeenCalledWith(MOCK_ACCOUNT_ID, MOCK_USER_ID)
    })
  })

  // ── Per-row validation report (CSV-IMP-05/09, M0.9) ───────────────────────

  describe('per-row validation report', () => {
    it('returns a RowError report for a zero amount and inserts nothing', async () => {
      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [{ ...VALID_ROW, amount: 0 }],
      })

      expect(result).toEqual({
        success: false,
        status: 400,
        message: 'Invalid fields',
        data: null,
        errors: [
          { rowIndex: 0, field: 'amount', reason: 'Amount must be positive' },
        ],
      })
      expect(mockCreateTransactionsBulk).not.toHaveBeenCalled()
    })

    it('reports a missing payee with field payee', async () => {
      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [{ ...VALID_ROW, payee: '' }],
      })

      expect(result.success).toBe(false)
      expect(result.errors).toEqual([
        { rowIndex: 0, field: 'payee', reason: expect.stringContaining('Payee') },
      ])
    })

    it('uses 0-based rowIndex over the submitted rows', async () => {
      // First row valid, second row invalid → rowIndex 1.
      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [VALID_ROW, { ...VALID_ROW, amount: -5 }],
      })

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors?.[0]).toMatchObject({ rowIndex: 1, field: 'amount' })
    })

    it('is all-or-nothing: one bad row blocks the whole batch', async () => {
      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [VALID_ROW, { ...VALID_ROW, amount: 0 }, { ...VALID_ROW, amount: 50 }],
      })

      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(mockCreateTransactionsBulk).not.toHaveBeenCalled()
    })
  })

  // ── Server-side cap (D8) ───────────────────────────────────────────────────

  describe('size cap', () => {
    it('rejects more than MAX_IMPORT_ROWS rows before validation', async () => {
      const tooManyRows = Array.from({ length: 1001 }, () => VALID_ROW)

      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: tooManyRows,
      })

      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      expect(result.message).toBe('Too many rows (max 1000)')
      expect(mockCreateTransactionsBulk).not.toHaveBeenCalled()
    })
  })

  // ── Success (D2: server injects accountId per row) ────────────────────────

  describe('successful import', () => {
    it('returns 201 with the created transactions', async () => {
      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [VALID_ROW],
      })

      expect(result).toEqual({
        success: true,
        status: 201,
        data: [CREATED_TRANSACTION],
        message: '1 transactions created successfully!',
      })
    })

    it('injects accountId into every row before passing them to the repository', async () => {
      const rows = [
        VALID_ROW,
        { ...VALID_ROW, amount: 500, payee: 'Cash Deposit' },
        { ...VALID_ROW, amount: 120.5, type: 'expense' as const },
      ]

      await createTransactionsBulkAction({ accountId: MOCK_ACCOUNT_ID, rows })

      expect(mockCreateTransactionsBulk).toHaveBeenCalledTimes(1)
      const [validatedRows, userId] = mockCreateTransactionsBulk.mock.calls[0] as [
        Array<{ accountId: string; amount: number; type: 'expense' | 'income' }>,
        string,
      ]
      expect(userId).toBe(MOCK_USER_ID)
      expect(validatedRows).toHaveLength(3)
      validatedRows.forEach(row => {
        expect(row.accountId).toBe(MOCK_ACCOUNT_ID)
      })
      expect(validatedRows[0]).toMatchObject({ amount: 2000, type: 'income' })
      expect(validatedRows[2]).toMatchObject({ amount: 120.5, type: 'expense' })
    })

    it('revalidates /transaction after a successful import', async () => {
      await createTransactionsBulkAction({ accountId: MOCK_ACCOUNT_ID, rows: [VALID_ROW] })

      expect(mockRevalidatePath).toHaveBeenCalledWith('/transaction')
    })
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('returns 500 when the repository throws', async () => {
      mockCreateTransactionsBulk.mockRejectedValue(new Error('DB connection failed'))

      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [VALID_ROW],
      })

      expect(result).toEqual({
        success: false,
        status: 500,
        message: 'Something went wrong',
        data: null,
      })
      expect(mockRevalidatePath).not.toHaveBeenCalled()
    })

    it('returns 500 when the account lookup throws', async () => {
      mockGetBankAccountById.mockRejectedValue(new Error('DB connection failed'))

      const result = await createTransactionsBulkAction({
        accountId: MOCK_ACCOUNT_ID,
        rows: [VALID_ROW],
      })

      expect(result.success).toBe(false)
      expect(result.status).toBe(500)
      expect(mockCreateTransactionsBulk).not.toHaveBeenCalled()
    })
  })
})
