import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

const {
  mockPush,
  mockToastSuccess,
  mockToastError,
  mockDeleteTransactionAction,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockDeleteTransactionAction: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

vi.mock('@/actions/transaction/delete-transaction', () => ({
  deleteTransactionAction: mockDeleteTransactionAction,
}))

// Mock Dialog to render content directly when open (jsdom has no Radix portals)
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: any) => (open ? <div data-testid='dialog'>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}))

// Button: asChild merges onto the child (next/link); plain buttons render as <button>
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, asChild }: any) =>
    asChild ? (
      <>{children}</>
    ) : (
      <button onClick={onClick} disabled={disabled} data-variant={variant}>
        {children}
      </button>
    ),
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionDetailHeader } from '@/components/TransactionDetailHeader'

// ── Helpers ────────────────────────────────────────────────────────────────────

const TRANSACTION_ID = '550e8400-e29b-41d4-a716-446655440000'

type TransactionType = 'income' | 'expense'

const defaultProps = {
  id: TRANSACTION_ID,
  type: 'income' as TransactionType,
  amount: '5000.00',
  payee: 'Acme Corp',
  date: new Date(2024, 9, 1, 12, 0, 0), // Oct 1, 2024 (local)
  account: { bank: 'Chase', name: 'Business Checking', currency: 'USD' },
}

const setup = (props: Partial<typeof defaultProps> = {}) =>
  render(<TransactionDetailHeader {...defaultProps} {...props} />)

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionDetailHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteTransactionAction.mockResolvedValue({
      success: true,
      status: 200,
      message: 'Transaction deleted successfully',
    })
  })

  // ── Links ─────────────────────────────────────────────────────────────────

  it('renders a back link to the transactions list', () => {
    setup()

    const backLink = screen.getByRole('link', { name: 'back' })
    expect(backLink).toHaveAttribute('href', '/transaction')
  })

  it('renders an edit link to the edit route', () => {
    setup()

    const editLink = screen.getByRole('link', { name: 'edit' })
    expect(editLink).toHaveAttribute('href', `/transaction/${TRANSACTION_ID}/edit`)
  })

  // ── Header fields ─────────────────────────────────────────────────────────

  it('renders type badge, formatted date, payee title, and account line without last4', () => {
    setup()

    expect(screen.getByText('transaction_type_income')).toBeInTheDocument()
    expect(screen.getByText('Oct 1, 2024')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Chase · Business Checking')).toBeInTheDocument()
  })

  it('renders the amount with the income prefix', () => {
    setup()

    expect(screen.getByText('amount.income_prefix$5,000.00')).toBeInTheDocument()
  })

  it('renders the amount with the expense prefix and expense type badge', () => {
    setup({ type: 'expense', amount: '1200.00' })

    expect(screen.getByText('transaction_type_expense')).toBeInTheDocument()
    expect(screen.getByText('amount.expense_prefix$1,200.00')).toBeInTheDocument()
  })

  it('renders the Cleared status placeholder badge', () => {
    setup()

    expect(screen.getByText('status.cleared')).toBeInTheDocument()
  })

  // ── Delete flow ───────────────────────────────────────────────────────────

  it('opens the delete confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: 'row.delete_transaction' }))

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByText('delete.title')).toBeInTheDocument()
    expect(screen.getByText('delete.description')).toBeInTheDocument()
  })

  it('does not call the delete action when the dialog is cancelled', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: 'row.delete_transaction' }))
    await user.click(screen.getByRole('button', { name: 'delete.cancel_button' }))

    expect(mockDeleteTransactionAction).not.toHaveBeenCalled()
  })

  it('calls the delete action, shows a success toast, and redirects on success', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: 'row.delete_transaction' }))
    await user.click(screen.getByRole('button', { name: 'delete.confirm_button' }))

    await waitFor(() => {
      expect(mockDeleteTransactionAction).toHaveBeenCalledWith({ id: TRANSACTION_ID })
      expect(mockToastSuccess).toHaveBeenCalledWith('form.delete_success')
      expect(mockPush).toHaveBeenCalledWith('/transaction')
    })
  })

  it('shows an error toast and does not redirect when deletion fails', async () => {
    mockDeleteTransactionAction.mockResolvedValue({
      success: false,
      status: 500,
      message: 'Something went wrong',
    })
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: 'row.delete_transaction' }))
    await user.click(screen.getByRole('button', { name: 'delete.confirm_button' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('delete.error_generic')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('disables the dialog buttons while deletion is pending', async () => {
    mockDeleteTransactionAction.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: 'row.delete_transaction' }))
    await user.click(screen.getByRole('button', { name: 'delete.confirm_button' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'delete.deleting' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'delete.cancel_button' })).toBeDisabled()
    })
  })
})
