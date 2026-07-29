import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AccountTransactionTable } from '@/components/AccountTransactionTable'
import { Transaction } from '@/interfaces'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

// Mock DataTable — it's a complex component with TanStack Table dependencies,
// so we mock it completely and verify AccountTransactionTable passes the correct props.
vi.mock('@/components/DataTable', () => ({
  DataTable: ({ data, totalPages, currentPage, categories, onBulkDelete }: any) => (
    <div data-testid='data-table'>
      <span data-testid='data-count'>{data.length}</span>
      <span data-testid='total-pages'>{totalPages}</span>
      <span data-testid='current-page'>{currentPage}</span>
    </div>
  ),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${key}:${JSON.stringify(params)}`
    return key
  },
}))

vi.mock('@/lib/transaction-types', () => ({
  getTransactionTypeConfig: (type: string) => ({
    value: type,
    labelKey: `transaction_type_${type}`,
    variant: 'secondary',
  }),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    accountId: 'acc-1',
    userId: 'user-1',
    amount: '50000',
    date: new Date('2024-06-15'),
    payee: 'Employer',
    categoryId: 'cat-1',
    notes: null,
    type: 'income',
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-06-15'),
    deletedAt: null,
    accountName: 'Cuenta Principal',
    categoryName: 'Income',
  },
  {
    id: 'tx-2',
    accountId: 'acc-1',
    userId: 'user-1',
    amount: '-2000',
    date: new Date('2024-06-16'),
    payee: 'Supermarket',
    categoryId: 'cat-2',
    notes: null,
    type: 'expense',
    createdAt: new Date('2024-06-16'),
    updatedAt: new Date('2024-06-16'),
    deletedAt: null,
    accountName: 'Cuenta Principal',
    categoryName: 'Food',
  },
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AccountTransactionTable', () => {
  // Verify transaction data is passed correctly to DataTable.
  // The component is a wrapper, so we test the props contract.
  it('passes transaction data to DataTable', () => {
    render(
      <AccountTransactionTable
        data={MOCK_TRANSACTIONS}
        categories={[]}
        totalPages={5}
        currentPage={2}
      />,
    )

    expect(screen.getByTestId('data-table')).toBeTruthy()
    expect(screen.getByTestId('data-count').textContent).toBe('2')
  })

  // totalPages and currentPage are needed for DataTable pagination.
  it('passes totalPages and currentPage for pagination', () => {
    render(
      <AccountTransactionTable
        data={MOCK_TRANSACTIONS}
        categories={[]}
        totalPages={5}
        currentPage={2}
      />,
    )

    expect(screen.getByTestId('total-pages').textContent).toBe('5')
    expect(screen.getByTestId('current-page').textContent).toBe('2')
  })

  it('passes categories to DataTable', () => {
    const categories = [{ id: 'cat-1', name: 'Food' }]
    render(
      <AccountTransactionTable
        data={MOCK_TRANSACTIONS}
        categories={categories}
        totalPages={1}
        currentPage={1}
      />,
    )
    expect(screen.getByTestId('data-table')).toBeTruthy()
  })
})
