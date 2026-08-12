import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: vi.fn(),
  }),
}))

vi.mock('@/hooks/use-debounced-search-params', () => ({
  useDebouncedSearchParam: vi.fn(() => ['', vi.fn()]),
}))

vi.mock('@/hooks/use-filter-params', () => ({
  useFilterParam: vi.fn(() => ['', vi.fn()]),
}))

vi.mock('@/hooks/use-sort-params', () => ({
  useSortParam: vi.fn(() => ['date', vi.fn()]),
}))

vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes: string[]) => classes.filter(Boolean).join(' ')),
  fmt: vi.fn((v: number) => v.toFixed(2)),
  fmtDate: vi.fn((d: Date) => d.toLocaleDateString()),
}))

vi.mock('@/components/TransactionCategoryCell', () => ({
  TransactionCategoryCell: ({ categoryName }: { categoryName?: string }) => (
    <span data-testid='category-cell'>{categoryName ?? 'uncategorized'}</span>
  ),
}))

vi.mock('@/components/TransactionAmountCell', () => ({
  TransactionAmountCell: ({ amount, type }: { amount: number; type: string }) => (
    <span data-testid='amount-cell'>
      {type}:{amount}
    </span>
  ),
}))

vi.mock('@/lib/export-csv', () => ({
  exportTransactionsToCSV: vi.fn(),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/Pagination', () => ({
  default: ({ page, totalPages, total }: { page: number; totalPages: number; total: number }) => (
    <div data-testid='pagination'>
      <span>{page}</span>
      <span>{totalPages}</span>
      <span>{total}</span>
    </div>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input type='checkbox' {...props} />
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
  useConfirm: () => [() => null, () => Promise.resolve(true)],
}))

vi.mock('@/components/CategoryColumn', () => ({
  CategoryColumn: ({ categoryName }: { categoryName?: string }) => (
    <span data-testid='category-cell'>{categoryName ?? 'uncategorized'}</span>
  ),
}))

vi.mock('@/components/actions', () => ({
  Actions: ({ id }: { id: string }) => <span data-testid='actions-cell'>{id}</span>,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/hooks/use-transaction-drawer', () => ({
  useTransactionDrawer: () => ({
    isOpen: false,
    transaction: null,
    onOpen: vi.fn(),
    onClose: vi.fn(),
  }),
}))

vi.mock('@/components/TransactionQuickEdit', () => ({
  TransactionQuickEdit: () => <div data-testid='transaction-quick-edit' />,
}))

// The real action transitively loads @/lib/auth → send-email.ts, which builds a
// Resend client and throws without RESEND_API_KEY in the test env — mock it.
vi.mock('@/actions/transaction/update-transactions-category', () => ({
  updateTransactionsCategoryAction: vi.fn(),
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionPageContent } from '@/components/_TransactionPageContent_'

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
    notes: null,
    date: new Date('2024-01-01'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    accountName: 'Savings',
    categoryName: 'Salary',
  },
]

const mockCategories = [
  { id: 'cat1', name: 'Food' },
  { id: 'cat2', name: 'Salary' },
]

const mockAccounts = [
  {
    id: 'acc1',
    name: 'Checking',
    bank: 'Bank A',
    type: 'checking',
    currency: 'USD',
    balance: '1000',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    color: '#000',
    plaidId: null,
    icon: 'building',
    transactionsCount: 5,
  },
  {
    id: 'acc2',
    name: 'Savings',
    bank: 'Bank B',
    type: 'savings',
    currency: 'USD',
    balance: '5000',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    color: '#000',
    plaidId: null,
    icon: 'piggy-bank',
    transactionsCount: 2,
  },
]

const DEFAULT_PROPS = {
  data: mockTransactions,
  totalPages: 1,
  currentPage: 1,
  categories: mockCategories,
  accounts: mockAccounts,
  totalIncome: 1000,
  totalExpenses: 50,
  netBalance: 950,
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionPageContent', () => {
  it('renders summary cards with calculated totals', () => {
    render(<TransactionPageContent {...DEFAULT_PROPS} />)

    expect(screen.getByTestId('summary-income')).toBeDefined()
    expect(screen.getByTestId('summary-expenses')).toBeDefined()
    expect(screen.getByTestId('summary-balance')).toBeDefined()
  })

  it('renders action bar with categories', () => {
    render(<TransactionPageContent {...DEFAULT_PROPS} />)

    expect(screen.getByPlaceholderText('action.search_placeholder')).toBeDefined()
  })

  it('renders transaction list with data', () => {
    render(<TransactionPageContent {...DEFAULT_PROPS} />)

    expect(screen.getByText('Checking')).toBeDefined()
    expect(screen.getByText('Savings')).toBeDefined()
  })

  it('renders empty state when no transactions', () => {
    render(
      <TransactionPageContent
        {...DEFAULT_PROPS}
        data={[]}
        totalPages={0}
        totalIncome={0}
        totalExpenses={0}
        netBalance={0}
      />,
    )

    expect(screen.getByText('table.no_results')).toBeDefined()
  })
})
