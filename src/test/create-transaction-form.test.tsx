import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Account, Category } from '@/interfaces'

// ── Mocks ──────────────────────────────────────────────────────────────────────

const { toastSuccessMock, toastErrorMock, createActionMock, routerPushMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  createActionMock: vi.fn(),
  routerPushMock: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPushMock, back: vi.fn() }),
}))

vi.mock('@/actions/transaction/create-transaction', () => ({
  createTransactionAction: createActionMock,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/input-group', () => ({
  InputGroup: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  InputGroupInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

vi.mock('@/components/ui/field', () => ({
  Field: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props}>{children}</div>
  ),
  FieldError: ({ errors }: { errors: Array<{ message?: string }> }) => (
    <span data-testid='field-error'>{errors?.[0]?.message}</span>
  ),
  FieldGroup: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  FieldLabel: ({ children, htmlFor }: React.PropsWithChildren<{ htmlFor?: string }>) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: React.PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void }>) => (
    <select
      data-testid='select'
      value={value || ''}
      onChange={e => onValueChange?.(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: React.PropsWithChildren) => <>{children}</>,
  SelectItem: ({ children, value }: React.PropsWithChildren<{ value: string }>) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
}))

vi.mock('@/components/ui/calendar', () => ({
  Calendar: () => <div data-testid='calendar' />,
}))

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  PopoverContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid='popover-content'>{children}</div>
  ),
  PopoverTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

vi.mock('date-fns', () => ({
  format: (d: Date) => d.toLocaleDateString(),
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { CreateTransactionForm } from '@/components/CreateTransactionForm'

// ── Fixtures ───────────────────────────────────────────────────────────────────

const accounts: Account[] = [
  { id: 'acc-1', name: 'Business Checking', bank: 'Chase', currency: 'USD' } as Account,
]
const categories: Category[] = [
  { id: 'e3f7c93e-6c4a-4f21-9b2a-1c8d5f0a3b77', name: 'Salary' } as Category,
]

const setup = () => render(<CreateTransactionForm accounts={accounts} categories={categories} />)

const fillRequired = async () => {
  fireEvent.change(screen.getByLabelText('form.amount'), { target: { value: '100.00' } })
  fireEvent.change(screen.getByLabelText('form.payee'), { target: { value: 'Acme Corp' } })
  const [accountSelect] = screen.getAllByTestId('select')
  fireEvent.change(accountSelect, { target: { value: 'acc-1' } })
  fireEvent.click(screen.getByRole('option', { name: 'Salary' }))
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('CreateTransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders every labelled field with unique per-form ids', () => {
    setup()

    expect(screen.getByLabelText('form.transaction_type')).toBeInTheDocument()
    expect(screen.getByLabelText('form.amount')).toHaveAttribute(
      'id',
      'form-create-transaction-amount',
    )
    expect(screen.getByLabelText('form.payee')).toHaveAttribute(
      'id',
      'form-create-transaction-payee',
    )
    expect(screen.getByLabelText('form.notes')).toHaveAttribute(
      'id',
      'form-create-transaction-notes',
    )
    expect(screen.getByText('form.account')).toBeInTheDocument()
    expect(screen.getByText('form.category')).toBeInTheDocument()
    expect(screen.getByText('form.create_button')).toBeInTheDocument()
  })

  it('uses radiogroup semantics for the type selector', () => {
    setup()

    const group = screen.getByRole('radiogroup')
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'form.type_expense' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('radio', { name: 'form.type_income' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('selects and clears a category with accessible controls', () => {
    setup()

    const categoryControl = screen.getByRole('combobox', { name: 'form.category' })
    expect(categoryControl).toHaveTextContent('category_placeholder')

    fireEvent.click(screen.getByRole('option', { name: 'Salary' }))
    expect(categoryControl).toHaveTextContent('Salary')

    fireEvent.click(screen.getByRole('button', { name: 'category_clear' }))
    expect(categoryControl).toHaveTextContent('category_placeholder')
  })

  it('redirects to the transactions list only after a successful create', async () => {
    createActionMock.mockResolvedValue({ success: true, message: 'ok', data: { id: 'tx-1' } })
    setup()
    await fillRequired()

    fireEvent.click(screen.getByText('form.create_button'))

    await waitFor(() => {
      expect(createActionMock).toHaveBeenCalledTimes(1)
      expect(toastSuccessMock).toHaveBeenCalledWith('ok')
      expect(routerPushMock).toHaveBeenCalledWith('/transaction')
    })
  })

  it('shows the server error and does NOT redirect when creation fails', async () => {
    createActionMock.mockResolvedValue({
      success: false,
      message: 'Server rejected',
      data: null,
    })
    setup()
    await fillRequired()

    fireEvent.click(screen.getByText('form.create_button'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Server rejected')
      expect(routerPushMock).not.toHaveBeenCalled()
    })
  })

  it('shows the generic error and does NOT redirect when the action throws', async () => {
    createActionMock.mockRejectedValue(new Error('boom'))
    setup()
    await fillRequired()

    fireEvent.click(screen.getByText('form.create_button'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('form.error_generic')
      expect(routerPushMock).not.toHaveBeenCalled()
    })
  })

  it('falls back to the generic error when the failure message is empty', async () => {
    createActionMock.mockResolvedValue({ success: false, message: '', data: null })
    setup()
    await fillRequired()

    fireEvent.click(screen.getByText('form.create_button'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('form.error_generic')
      expect(routerPushMock).not.toHaveBeenCalled()
    })
  })
})
