import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { exportTransactionsToCSV } from '@/lib/export-csv'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('papaparse', () => ({
  default: {
    unparse: vi.fn((data: Record<string, unknown>[]) => {
      if (data.length === 0) return ''
      const headers = Object.keys(data[0])
      const rows = data.map(row => headers.map(h => row[h]).join(','))
      return [headers.join(','), ...rows].join('\n')
    }),
  },
}))

// ── DOM mocks ──────────────────────────────────────────────────────────────────

const mockClick = vi.fn()
let mockLink: HTMLAnchorElement

beforeEach(() => {
  mockLink = {
    click: mockClick,
    setAttribute: vi.fn((_: string, val: string) => {
      if (_ === 'download') mockLink.download = val
      if (_ === 'href') mockLink.href = val
    }),
    href: '',
    download: '',
  } as unknown as HTMLAnchorElement

  vi.spyOn(document, 'createElement').mockReturnValue(mockLink)
  vi.spyOn(document.body, 'appendChild').mockImplementation(node => node)
  vi.spyOn(document.body, 'removeChild').mockImplementation(node => node)
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Helpers ────────────────────────────────────────────────────────────────────

const mockTransactions = [
  {
    id: '1',
    type: 'expense' as const,
    amount: '50.00',
    payee: 'Test Store',
    accountId: 'acc1',
    categoryId: 'cat1',
    notes: null,
    date: new Date('2024-01-15'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    accountName: 'Checking',
    categoryName: 'Food',
  },
  {
    id: '2',
    type: 'income' as const,
    amount: '1000.00',
    payee: 'Employer',
    accountId: 'acc2',
    categoryId: 'cat2',
    notes: 'Monthly salary',
    date: new Date('2024-01-01'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    accountName: 'Savings',
    categoryName: 'Salary',
  },
]

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('exportTransactionsToCSV', () => {
  it('calls Papa.unparse with correct data structure', async () => {
    const Papa = await import('papaparse')
    exportTransactionsToCSV(mockTransactions)

    expect(Papa.default.unparse).toHaveBeenCalledWith([
      {
        Date: '2024-01-15',
        Payee: 'Test Store',
        Category: 'Food',
        Account: 'Checking',
        Type: 'expense',
        Amount: 50,
        Notes: '',
      },
      {
        Date: '2024-01-01',
        Payee: 'Employer',
        Category: 'Salary',
        Account: 'Savings',
        Type: 'income',
        Amount: 1000,
        Notes: 'Monthly salary',
      },
    ])
  })

  it('creates and clicks download link', () => {
    exportTransactionsToCSV(mockTransactions, 'my-transactions.csv')

    expect(document.createElement).toHaveBeenCalledWith('a')
    expect(mockClick).toHaveBeenCalled()
    expect(mockLink.download).toBe('my-transactions.csv')
  })

  it('uses default filename when none provided', () => {
    exportTransactionsToCSV(mockTransactions)

    expect(mockLink.download).toBe('transactions.csv')
  })

  it('appends link to body and removes it after click', () => {
    exportTransactionsToCSV(mockTransactions)

    expect(document.body.appendChild).toHaveBeenCalledWith(mockLink)
    expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)
  })

  it('revokes object URL after download', () => {
    exportTransactionsToCSV(mockTransactions)

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('handles empty transactions array', async () => {
    const Papa = await import('papaparse')
    ;(Papa.default.unparse as ReturnType<typeof vi.fn>).mockClear()

    exportTransactionsToCSV([])

    expect(Papa.default.unparse).toHaveBeenCalledWith([])
  })

  it('handles transactions with undefined categoryName as Uncategorized', async () => {
    const Papa = await import('papaparse')
    const unparseSpy = Papa.default.unparse as ReturnType<typeof vi.fn>
    unparseSpy.mockClear()

    const txWithoutCategory = {
      ...mockTransactions[0],
      categoryName: undefined,
    }

    exportTransactionsToCSV([txWithoutCategory])

    expect(unparseSpy).toHaveBeenCalledTimes(1)
    const callArgs = unparseSpy.mock.calls[0][0] as Record<string, unknown>[]
    expect(callArgs[0].Category).toBe('Uncategorized')
  })
})
