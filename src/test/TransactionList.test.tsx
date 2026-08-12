import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Transaction } from '@/interfaces'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${key}:${JSON.stringify(params)}`
    return key
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: vi.fn(),
  }),
}))

// The real action transitively loads @/lib/auth → send-email.ts, which builds a
// Resend client and throws without RESEND_API_KEY in the test env — mock it.
vi.mock('@/actions/transaction/update-transactions-category', () => ({
  updateTransactionsCategoryAction: vi.fn(),
}))

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input type='checkbox' {...props} />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: React.PropsWithChildren) => <table>{children}</table>,
  TableHeader: ({ children }: React.PropsWithChildren) => <thead>{children}</thead>,
  TableBody: ({ children }: React.PropsWithChildren) => <tbody>{children}</tbody>,
  TableRow: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <tr {...props}>{children}</tr>
  ),
  TableHead: ({ children }: React.PropsWithChildren) => <th>{children}</th>,
  TableCell: ({ children }: React.PropsWithChildren) => <td>{children}</td>,
}))

vi.mock('@/hooks/use-confirm', () => ({
  useConfirm: () => [
    () => null,
    () => Promise.resolve(true),
  ],
}))

vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  fmtDate: (d: Date) => d.toLocaleDateString(),
}))

vi.mock('@/components/CategoryColumn', () => ({
  CategoryColumn: ({ categoryName }: { categoryName?: string }) => (
    <span data-testid='category-cell'>{categoryName ?? 'uncategorized'}</span>
  ),
}))

vi.mock('@/components/actions', () => ({
  Actions: ({ id }: { id: string }) => (
    <span data-testid='actions-cell'>{id}</span>
  ),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionList } from '@/components/TransactionList'

// ── Helpers ────────────────────────────────────────────────────────────────────

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

const DEFAULT_PROPS = {
  totalPages: 5,
  currentPage: 1,
  categories: [],
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionList', () => {
  it('renders account name in table', () => {
    render(<TransactionList data={[makeTransaction({ accountName: 'Main Savings' })]} {...DEFAULT_PROPS} />)

    expect(screen.getByText('Main Savings')).toBeTruthy()
  })

  it('renders category cell for each row', () => {
    render(<TransactionList data={[makeTransaction({ categoryName: 'Transport' })]} {...DEFAULT_PROPS} />)

    expect(screen.getByText('Transport')).toBeTruthy()
  })

  it('renders actions cell for each row', () => {
    render(<TransactionList data={[makeTransaction({ id: 'tx-1' })]} {...DEFAULT_PROPS} />)

    expect(screen.getByTestId('actions-cell')).toBeTruthy()
    expect(screen.getByTestId('actions-cell').textContent).toBe('tx-1')
  })

  it('renders checkbox for row selection', () => {
    render(<TransactionList data={[makeTransaction()]} {...DEFAULT_PROPS} />)

    const checkboxes = screen.getAllByRole('checkbox')
    // 1 select-all + 1 row checkbox
    expect(checkboxes.length).toBe(2)
  })

  it('renders multiple rows', () => {
    const txns = [
      makeTransaction({ id: 'tx-1', accountName: 'Account A' }),
      makeTransaction({ id: 'tx-2', accountName: 'Account B' }),
    ]
    render(<TransactionList data={txns} {...DEFAULT_PROPS} />)

    expect(screen.getByText('Account A')).toBeTruthy()
    expect(screen.getByText('Account B')).toBeTruthy()
  })

  it('renders empty state when data is empty', () => {
    render(<TransactionList data={[]} {...DEFAULT_PROPS} />)

    expect(screen.getByText('table.no_results')).toBeTruthy()
  })

  it('renders localized column headers', () => {
    render(<TransactionList data={[makeTransaction()]} {...DEFAULT_PROPS} />)

    expect(screen.getByText('table.header_date')).toBeTruthy()
    expect(screen.getByText('table.header_amount')).toBeTruthy()
    expect(screen.getByText('table.header_account')).toBeTruthy()
    expect(screen.getByText('table.header_category')).toBeTruthy()
    expect(screen.getByText('table.header_notes')).toBeTruthy()
  })

  it('renders pagination with page numbers', () => {
    render(<TransactionList data={[makeTransaction()]} {...DEFAULT_PROPS} />)

    // Pagination renders prev/next icon buttons and page number buttons
    // With totalPages=5 and 1 data row, should have at least 3 buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

})

