import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { EditAccountForm } from '@/components/EditAccountForm'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { pushMock, refreshMock, backMock, editBankAccountMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
  backMock: vi.fn(),
  editBankAccountMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock, back: backMock }),
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

vi.mock('@/actions/account/update-account', () => ({
  editBankAccount: (...args: any[]) => editBankAccountMock(...args),
}))

vi.mock('@/components/AppearanceSection', () => ({
  AppearanceSection: () => <div data-testid='appearance-section' />,
}))

vi.mock('@/components/FormActions', () => ({
  FormActions: ({ onCancel, isPending, text, loadingText }: any) => (
    <div data-testid='form-actions'>
      <button onClick={onCancel} disabled={isPending}>cancel</button>
      <button type='submit' disabled={isPending}>{isPending ? loadingText : text}</button>
    </div>
  ),
}))

vi.mock('@/components/ui/field', () => ({
  Field: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FieldDescription: ({ children }: any) => <span>{children}</span>,
  FieldError: ({ errors }: any) => <span data-testid='field-error'>{errors?.[0]?.message}</span>,
  FieldGroup: ({ children }: any) => <div>{children}</div>,
  FieldLabel: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
}))

vi.mock('@/components/ui/input-group', () => ({
  InputGroup: ({ children }: any) => <div>{children}</div>,
  InputGroupInput: (props: any) => <input {...props} />,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, name }: any) => (
    <select data-testid={`select-${name}`} value={value} onChange={e => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => null,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const INITIAL_VALUES = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Cuenta Original',
  bank: 'Banco Galicia',
  type: 'savings' as const,
  currency: 'USD' as const,
  icon: 'account_balance',
  color: '137FEC',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EditAccountForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  // Verify the form pre-fills fields with the initial account values.
  it('pre-fills fields with initial values', () => {
    render(<EditAccountForm initialValues={INITIAL_VALUES} />)

    expect(screen.getByLabelText('form.account_name')).toHaveValue('Cuenta Original')
    expect(screen.getByLabelText('form.bank_name')).toHaveValue('Banco Galicia')
  })

  // The submit button shows the update text.
  it('renders the update button with correct text', () => {
    render(<EditAccountForm initialValues={INITIAL_VALUES} />)
    expect(screen.getByRole('button', { name: /form.update_button/i })).toBeTruthy()
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  // Canceling navigates back to the previous page.
  it('calls router.back() on cancel', async () => {
    const user = userEvent.setup()
    render(<EditAccountForm initialValues={INITIAL_VALUES} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(backMock).toHaveBeenCalled()
  })

  // ── Successful submit ─────────────────────────────────────────────────────

  // When the update succeeds, a toast is shown, navigation occurs, and refresh is called.
  it('shows success toast and navigates on update', async () => {
    const user = userEvent.setup()
    editBankAccountMock.mockResolvedValue({ success: true, message: 'Account updated successfully!' })

    render(<EditAccountForm initialValues={INITIAL_VALUES} />)

    await user.clear(screen.getByLabelText('form.account_name'))
    await user.type(screen.getByLabelText('form.account_name'), 'Cuenta Nueva')

    await user.click(screen.getByRole('button', { name: /form.update_button/i }))

    await waitFor(() => {
      expect(editBankAccountMock).toHaveBeenCalled()
      expect(toastSuccessMock).toHaveBeenCalledWith('Account updated successfully!')
      expect(pushMock).toHaveBeenCalledWith('/account')
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  // ── Failed submit ─────────────────────────────────────────────────────────

  // When the update fails, an error toast is shown and the user stays on the form.
  it('shows error toast when editBankAccount fails', async () => {
    const user = userEvent.setup()
    editBankAccountMock.mockResolvedValue({ success: false, message: 'Something went wrong' })

    render(<EditAccountForm initialValues={INITIAL_VALUES} />)

    await user.click(screen.getByRole('button', { name: /form.update_button/i }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Something went wrong')
    })
  })

  // If an exception occurs, a generic error toast is shown.
  it('shows generic error toast when editBankAccount throws an exception', async () => {
    const user = userEvent.setup()
    editBankAccountMock.mockRejectedValue(new Error('Network error'))

    render(<EditAccountForm initialValues={INITIAL_VALUES} />)

    await user.click(screen.getByRole('button', { name: /form.update_button/i }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('form.error_generic')
    })
  })

  // ── Loading state ─────────────────────────────────────────────────────────

  // During submission, the form shows loading text and buttons are disabled.
  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    editBankAccountMock.mockImplementation(() => new Promise(() => {}))

    render(<EditAccountForm initialValues={INITIAL_VALUES} />)

    await user.click(screen.getByRole('button', { name: /form.update_button/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /form.updating/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})
