import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import TransactionDetailPage from '@/app/(financeapp)/transaction/[id]/page'

// ── Mocks ──────────────────────────────────────────────────────────────────────

const { mockGetTransactionByIdAction, mockNotFound } = vi.hoisted(() => ({
  mockGetTransactionByIdAction: vi.fn(),
  mockNotFound: vi.fn(() => {
    // The real next/navigation notFound() throws; keep that contract so the page
    // stops executing after the guard.
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next-intl/server', () => ({
  getTranslations: () => Promise.resolve((key: string) => key),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  notFound: mockNotFound,
}))

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/actions/transaction/delete-transaction', () => ({
  deleteTransactionAction: vi.fn(),
}))

vi.mock('@/actions/transaction/get-transaction', () => ({
  getTransactionByIdAction: mockGetTransactionByIdAction,
}))

// Dialog stays closed on the page; mock renders nothing when closed (jsdom-safe)
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}))

// ── Test data ──────────────────────────────────────────────────────────────────

const TRANSACTION_ID = '550e8400-e29b-41d4-a716-446655440000'

const incomeTransaction = {
  id: TRANSACTION_ID,
  type: 'income',
  amount: '5000.00',
  payee: 'Acme Corp',
  notes: 'Monthly invoice',
  date: new Date(2024, 9, 1, 12, 0, 0),
  createdAt: new Date(2024, 9, 2, 9, 0, 0),
  updatedAt: new Date(2024, 9, 2, 9, 0, 0),
  deletedAt: null,
  userId: 'user-1',
  accountId: 'account-1',
  categoryId: 'cat-1',
  account: { bank: 'Chase', name: 'Business Checking', currency: 'USD' },
  category: { id: 'cat-1', name: 'Salary', icon: 'bank' },
  incomeDetails: {
    incomeType: 'service_w2',
    billingType: 'salary',
    grossAmount: '5000.00',
    taxesWithheld: '1000.00',
    taxBreakdown: null,
  },
  expenseDetails: null,
}

const expenseTransaction = {
  ...incomeTransaction,
  type: 'expense',
  amount: '1200.00',
  incomeDetails: null,
  expenseDetails: {
    salesTax: '100.00',
    taxRate: '0.0725',
    isDeductible: true,
    deductionCategory: 'Supplies',
  },
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionDetailPage (Server Component)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the full detail view for an income transaction', async () => {
    mockGetTransactionByIdAction.mockResolvedValue({
      success: true,
      status: 200,
      message: 'ok',
      data: incomeTransaction,
    })

    const component = await TransactionDetailPage({
      params: Promise.resolve({ id: TRANSACTION_ID }),
    })
    render(component)

    // Single fetch with the route id (REQ-1)
    expect(mockGetTransactionByIdAction).toHaveBeenCalledTimes(1)
    expect(mockGetTransactionByIdAction).toHaveBeenCalledWith(TRANSACTION_ID)

    // Breadcrumb: transactions link + payee as current page
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(
      within(breadcrumb).getByRole('link', { name: 'breadcrumbs.transactions' }),
    ).toHaveAttribute('href', '/transaction')
    expect(within(breadcrumb).getByText('Acme Corp')).toBeInTheDocument()

    // Header: payee title (breadcrumb + h1), income badge, prefixed amount
    expect(screen.getAllByText('Acme Corp').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('transaction_type_income')).toBeInTheDocument()
    expect(screen.getByText('amount.income_prefix$5,000.00')).toBeInTheDocument()

    // Info grid + metadata + attachments
    expect(screen.getByText('Monthly invoice')).toBeInTheDocument()
    expect(screen.getByText('transaction_id')).toBeInTheDocument()
    expect(screen.getByText(TRANSACTION_ID)).toBeInTheDocument()
    expect(screen.getByText('Paystub_Oct24.pdf')).toBeInTheDocument()

    // Income breakdown present, expense breakdown absent
    expect(screen.getByText('income_breakdown')).toBeInTheDocument()
    expect(screen.queryByText('expense_breakdown')).not.toBeInTheDocument()
  })

  it('renders the expense breakdown for an expense transaction', async () => {
    mockGetTransactionByIdAction.mockResolvedValue({
      success: true,
      status: 200,
      message: 'ok',
      data: expenseTransaction,
    })

    const component = await TransactionDetailPage({
      params: Promise.resolve({ id: TRANSACTION_ID }),
    })
    render(component)

    expect(screen.getByText('transaction_type_expense')).toBeInTheDocument()
    expect(screen.getByText('amount.expense_prefix$1,200.00')).toBeInTheDocument()
    expect(screen.getByText('expense_breakdown')).toBeInTheDocument()
    expect(screen.queryByText('income_breakdown')).not.toBeInTheDocument()
  })

  it('calls notFound when the transaction fetch fails', async () => {
    mockGetTransactionByIdAction.mockResolvedValue({
      success: false,
      status: 404,
      message: 'Transaction not found',
      data: null,
    })

    const params = Promise.resolve({ id: TRANSACTION_ID })
    await expect(TransactionDetailPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('calls notFound on unauthorized response', async () => {
    mockGetTransactionByIdAction.mockResolvedValue({
      success: false,
      status: 401,
      message: 'Unauthorized',
      data: null,
    })

    const params = Promise.resolve({ id: TRANSACTION_ID })
    await expect(TransactionDetailPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(mockNotFound).toHaveBeenCalled()
  })
})
