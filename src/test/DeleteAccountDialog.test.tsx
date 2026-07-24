import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DeleteAccountDialog } from '@/components/DeleteAccountDialog'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { removeBankAccountMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  removeBankAccountMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('@/actions/account/delete-account', () => ({
  removeBankAccount: (...args: any[]) => removeBankAccountMock(...args),
}))

// Mock Dialog — jsdom doesn't support Radix portals, so we mock it
// to render content directly when open=true.
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: any) => open ? <div data-testid='dialog'>{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select data-testid='transfer-select' value={value || ''} onChange={e => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>{children}</button>
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const OTHER_ACCOUNTS = [
  { id: 'acc-456', name: 'Cuenta Secundaria' },
  { id: 'acc-789', name: 'Cuenta Tercera' },
]

interface SetupProps {
  isOpen?: boolean
  hasTransactions?: boolean
  otherAccounts?: typeof OTHER_ACCOUNTS
}

const setup = ({ isOpen = true, hasTransactions = false, otherAccounts = OTHER_ACCOUNTS }: SetupProps = {}) => {
  const onClose = vi.fn()
  const result = render(
    <DeleteAccountDialog
      id='acc-123'
      name='Cuenta a Eliminar'
      isOpen={isOpen}
      onClose={onClose}
      hasTransactions={hasTransactions}
      otherAccounts={otherAccounts}
    />,
  )
  return { onClose, ...result }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DeleteAccountDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  // The dialog only renders when isOpen=true.
  it('renders nothing when isOpen is false', () => {
    setup({ isOpen: false })
    expect(screen.queryByTestId('dialog')).toBeNull()
  })

  it('renders the dialog when isOpen is true', () => {
    setup({ isOpen: true })
    expect(screen.getByTestId('dialog')).toBeTruthy()
  })

  // Title and description are shown with translation keys.
  it('shows the dialog title and description', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'delete.title' })).toBeTruthy()
    expect(screen.getByText('delete.description')).toBeTruthy()
  })

  // ── Without transactions ──────────────────────────────────────────────────

  // When there are no transactions, a simple message is shown without a transfer select.
  it('shows no-transactions message when hasTransactions=false', () => {
    setup({ hasTransactions: false })
    expect(screen.getByText('delete.no_transactions')).toBeTruthy()
    expect(screen.queryByTestId('transfer-select')).toBeNull()
  })

  // ── With transactions ─────────────────────────────────────────────────────

  // When there are transactions, a warning and the transfer select are shown.
  it('shows warning and transfer select when hasTransactions=true', () => {
    setup({ hasTransactions: true })
    expect(screen.getByText('delete.has_transactions_warning')).toBeTruthy()
    expect(screen.getByTestId('transfer-select')).toBeTruthy()
  })

  // The select shows other available accounts as options.
  it('shows other accounts in the transfer select', () => {
    setup({ hasTransactions: true })
    const select = screen.getByTestId('transfer-select')
    expect(select).toBeTruthy()
    expect(screen.getByText('Cuenta Secundaria')).toBeTruthy()
    expect(screen.getByText('Cuenta Tercera')).toBeTruthy()
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  // The cancel button closes the dialog by calling onClose.
  it('calls onClose when clicking cancel', async () => {
    const user = userEvent.setup()
    const { onClose } = setup()

    await user.click(screen.getByText('delete.cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ── Delete — no transferAccount required ──────────────────────────────────

  // When there are no transactions, delete proceeds without transferToAccountId.
  it('calls removeBankAccount without transferToAccountId when there are no transactions', async () => {
    const user = userEvent.setup()
    removeBankAccountMock.mockResolvedValue({ success: true, message: 'Account deleted successfully!' })

    setup({ hasTransactions: false })

    await user.click(screen.getByText('delete.confirm_button'))

    await waitFor(() => {
      expect(removeBankAccountMock).toHaveBeenCalledWith({
        id: 'acc-123',
        transferToAccountId: undefined,
      })
    })
  })

  // ── Successful delete ─────────────────────────────────────────────────────

  // After successful deletion, a toast is shown and the dialog closes.
  it('shows success toast and closes dialog on delete', async () => {
    const user = userEvent.setup()
    removeBankAccountMock.mockResolvedValue({ success: true, message: 'Account deleted successfully!' })
    const { onClose } = setup()

    await user.click(screen.getByText('delete.confirm_button'))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('Account deleted successfully!')
      expect(onClose).toHaveBeenCalled()
    })
  })

  // ── Failed delete ─────────────────────────────────────────────────────────

  // When deletion fails, an error toast is shown and the dialog remains open.
  it('shows error toast when removeBankAccount fails', async () => {
    const user = userEvent.setup()
    removeBankAccountMock.mockResolvedValue({ success: false, message: 'Something went wrong' })

    setup()

    await user.click(screen.getByText('delete.confirm_button'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Something went wrong')
    })
  })

  // If an exception occurs, a generic error toast is shown.
  it('shows generic error toast when removeBankAccount throws an exception', async () => {
    const user = userEvent.setup()
    removeBankAccountMock.mockRejectedValue(new Error('Network error'))

    setup()

    await user.click(screen.getByText('delete.confirm_button'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('delete.error_generic')
    })
  })

  // ── Delete with transfer ──────────────────────────────────────────────────

  // With transactions and a selected account, transferToAccountId is included.
  it('includes transferToAccountId when a destination account is selected', async () => {
    const user = userEvent.setup()
    removeBankAccountMock.mockResolvedValue({ success: true, message: 'Deleted!' })

    setup({ hasTransactions: true })

    await user.selectOptions(screen.getByTestId('transfer-select'), 'acc-456')
    await user.click(screen.getByText('delete.confirm_button'))

    await waitFor(() => {
      expect(removeBankAccountMock).toHaveBeenCalledWith({
        id: 'acc-123',
        transferToAccountId: 'acc-456',
      })
    })
  })

  // With transactions but no account selected, an error toast is shown.
  it('shows error toast when there are transactions but no transfer account selected', async () => {
    const user = userEvent.setup()
    setup({ hasTransactions: true })

    await user.click(screen.getByText('delete.confirm_button'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('delete.error_no_transfer')
      expect(removeBankAccountMock).not.toHaveBeenCalled()
    })
  })

  // ── Loading state ─────────────────────────────────────────────────────────

  // During deletion, buttons are disabled.
  it('disables buttons during deletion', async () => {
    const user = userEvent.setup()
    removeBankAccountMock.mockImplementation(() => new Promise(() => {}))

    setup()

    await user.click(screen.getByText('delete.confirm_button'))

    await waitFor(() => {
      expect(screen.getByText('delete.deleting')).toBeDisabled()
      expect(screen.getByText('delete.cancel')).toBeDisabled()
    })
  })
})
