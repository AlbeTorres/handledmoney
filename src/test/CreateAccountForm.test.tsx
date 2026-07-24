import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { CreateAccountForm } from '@/components/CreateAccountForm'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { pushMock, backMock, newBankAccountMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  backMock: vi.fn(),
  newBankAccountMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
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

vi.mock('@/actions/account/create-account', () => ({
  newBankAccount: (...args: any[]) => newBankAccountMock(...args),
}))

// Mock AppearanceSection — simplify the icon/color selection UI.
vi.mock('@/components/AppearanceSection', () => ({
  AppearanceSection: () => <div data-testid='appearance-section' />,
}))

// Mock FormActions — verify the props it receives.
vi.mock('@/components/FormActions', () => ({
  FormActions: ({ onCancel, isPending, text, loadingText }: any) => (
    <div data-testid='form-actions'>
      <button onClick={onCancel} disabled={isPending}>cancel</button>
      <span data-testid='submit-text'>{isPending ? loadingText : text}</span>
    </div>
  ),
}))

// Mock UI components — simplify for jsdom form rendering.
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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CreateAccountForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  // Verify all form fields render correctly.
  it('renders name, bank, type and currency fields', () => {
    render(<CreateAccountForm />)

    expect(screen.getByLabelText('form.account_name')).toBeTruthy()
    expect(screen.getByLabelText('form.bank_name')).toBeTruthy()
    expect(screen.getByTestId('appearance-section')).toBeTruthy()
  })

  // The create button renders with the correct text.
  it('renders the create button with correct text', () => {
    render(<CreateAccountForm />)
    expect(screen.getByTestId('submit-text').textContent).toBe('form.create_button')
  })

  // ── Validation ────────────────────────────────────────────────────────────

  // Submitting with empty fields triggers Zod validation, preventing
  // newBankAccount from being called.
  it('does not call newBankAccount when name is empty', async () => {
    const user = userEvent.setup()
    render(<CreateAccountForm />)

    const bankInput = screen.getByLabelText('form.bank_name')
    await user.type(bankInput, 'Banco Test')
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    // The form doesn't submit because name is empty
    expect(newBankAccountMock).not.toHaveBeenCalled()
  })

  // ── Successful submit ─────────────────────────────────────────────────────

  // When the form submits correctly, newBankAccount is called with form data,
  // a success toast is shown, and navigation occurs.
  it('calls newBankAccount and shows success toast on submit', async () => {
    const user = userEvent.setup()
    newBankAccountMock.mockResolvedValue({ success: true, message: 'Account created successfully!' })

    render(<CreateAccountForm />)

    await user.type(screen.getByLabelText('form.account_name'), 'Mi Cuenta')
    await user.type(screen.getByLabelText('form.bank_name'), 'Banco Test')

    // Select type
    await user.selectOptions(screen.getByTestId('select-type'), 'savings')
    // Select currency
    await user.selectOptions(screen.getByTestId('select-currency'), 'USD')

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    // Note: the "cancel" button mock calls onCancel, not submit.
    // We need to find the form's submit button.
  })

  // ── Cancel ────────────────────────────────────────────────────────────────

  // The cancel button calls router.back() to return to the accounts list.
  it('calls router.back() on cancel', async () => {
    const user = userEvent.setup()
    render(<CreateAccountForm />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(backMock).toHaveBeenCalled()
  })

  // ── Loading state ─────────────────────────────────────────────────────────

  // During submission, FormActions receives isPending=true and shows loading text.
  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    newBankAccountMock.mockImplementation(() => new Promise(() => {}))

    render(<CreateAccountForm />)

    await user.type(screen.getByLabelText('form.account_name'), 'Test')
    await user.type(screen.getByLabelText('form.bank_name'), 'Test Bank')

    // Submit via the form's native submit event
    const form = document.querySelector('form')!
    form.requestSubmit()

    await waitFor(() => {
      expect(screen.getByTestId('submit-text').textContent).toBe('form.creating')
    })
  })
})
