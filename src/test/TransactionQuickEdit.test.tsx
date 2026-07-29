import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Transaction, Account, Category } from '@/interfaces'

// ── Mocks ──────────────────────────────────────────────────────────────────────

const {
  toastSuccessMock,
  toastErrorMock,
  updateTransactionActionMock,
  routerRefreshMock,
} = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  updateTransactionActionMock: vi.fn(),
  routerRefreshMock: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: routerRefreshMock,
  }),
}))

vi.mock('@/actions/transaction/update-transaction', () => ({
  updateTransactionAction: updateTransactionActionMock,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children, open }: React.PropsWithChildren<{ open: boolean; onOpenChange: (open: boolean) => void }>) => (
    open ? <div data-testid='sheet' data-state='open'>{children}</div> : null
  ),
  SheetContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid='sheet-content'>{children}</div>
  ),
  SheetHeader: ({ children }: React.PropsWithChildren) => (
    <div data-testid='sheet-header'>{children}</div>
  ),
  SheetTitle: ({ children }: React.PropsWithChildren) => (
    <div data-testid='sheet-title'>{children}</div>
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
  Select: ({ children, value, onValueChange }: React.PropsWithChildren<{ value?: string; onValueChange?: (v: string) => void }>) => (
    <select data-testid='select' value={value || ''} onChange={e => onValueChange?.(e.target.value)}>
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

vi.mock('@/components/Tab', () => ({
  Tab: ({ activeView, onViewChange, tabs }: { activeView: string; onViewChange: (v: string) => void; tabs: string[] }) => (
    <div data-testid='tab'>
      {tabs.map(tab => (
        <button key={tab} data-testid={`tab-${tab}`} onClick={() => onViewChange(tab)}>
          {tab}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('date-fns', () => ({
  format: (d: Date, _fmt: string) => d.toLocaleDateString(),
}))

vi.mock('@/components/ui/calendar', () => ({
  Calendar: () => <div data-testid='calendar' />,
}))

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  PopoverContent: ({ children }: React.PropsWithChildren) => <div data-testid='popover-content'>{children}</div>,
  PopoverTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionQuickEdit } from '@/components/TransactionQuickEdit'

// ── Test Data ──────────────────────────────────────────────────────────────────

const VALID_TX_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const VALID_ACCOUNT_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'
const VALID_CATEGORY_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012'
const VALID_CATEGORY_ID_2 = 'd4e5f6a7-b8c9-0123-defa-234567890123'

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: VALID_TX_ID,
  type: 'expense',
  amount: '1500',
  payee: 'Grocery Store',
  accountId: VALID_ACCOUNT_ID,
  categoryId: VALID_CATEGORY_ID,
  notes: 'Weekly groceries',
  date: new Date('2024-06-15'),
  userId: 'user-1',
  createdAt: new Date('2024-06-15'),
  updatedAt: new Date('2024-06-15'),
  deletedAt: null,
  accountName: 'Checking',
  categoryName: 'Food',
  ...overrides,
})

const MOCK_ACCOUNTS: Account[] = [
  {
    id: VALID_ACCOUNT_ID,
    name: 'Checking',
    bank: 'Chase',
    type: 'checking',
    currency: 'USD',
    balance: '5000',
    icon: 'dollar-sign',
    color: '137FEC',
    plaidId: null,
    userId: 'user-1',
    transactionsCount: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
    name: 'Savings',
    bank: 'Chase',
    type: 'savings',
    currency: 'USD',
    balance: '10000',
    icon: 'piggy-bank',
    color: '00FF00',
    plaidId: null,
    userId: 'user-1',
    transactionsCount: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
]

const MOCK_CATEGORIES: Category[] = [
  { id: VALID_CATEGORY_ID, name: 'Food' },
  { id: VALID_CATEGORY_ID_2, name: 'Transport' },
]

const DEFAULT_PROPS = {
  accounts: MOCK_ACCOUNTS,
  categories: MOCK_CATEGORIES,
  isOpen: true,
  transaction: makeTransaction(),
  onClose: vi.fn(),
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionQuickEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders nothing when isOpen is false', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} isOpen={false} />)

    expect(screen.queryByTestId('sheet')).not.toBeInTheDocument()
  })

  it('renders the sheet when isOpen is true', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    expect(screen.getByTestId('sheet')).toBeInTheDocument()
    expect(screen.getByTestId('sheet-content')).toBeInTheDocument()
  })

  it('renders the quick edit title', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    expect(screen.getByTestId('sheet-title')).toHaveTextContent('form.quick_edit')
  })

  it('renders all form fields', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    expect(screen.getByTestId('tab')).toBeInTheDocument()
    expect(screen.getByLabelText('form.amount')).toBeInTheDocument()
    expect(screen.getByLabelText('form.payee')).toBeInTheDocument()
    expect(screen.getByLabelText('form.notes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'form.update_button' })).toBeInTheDocument()
  })

  // ── Pre-fill ──────────────────────────────────────────────────────────────

  it('pre-fills payee field with transaction data', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    const payeeInput = screen.getByLabelText('form.payee')
    expect(payeeInput).toHaveValue('Grocery Store')
  })

  it('pre-fills amount field with transaction data', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    const amountInput = screen.getByLabelText('form.amount')
    expect(amountInput).toHaveValue('1500')
  })

  it('pre-fills notes field with transaction data', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    const notesInput = screen.getByLabelText('form.notes')
    expect(notesInput).toHaveValue('Weekly groceries')
  })

  it('pre-fills account select with transaction accountId', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    const selects = screen.getAllByTestId('select')
    // First select is account
    expect(selects[0]).toHaveValue(VALID_ACCOUNT_ID)
  })

  it('pre-fills category select with transaction categoryId', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    const selects = screen.getAllByTestId('select')
    // Second select is category
    expect(selects[1]).toHaveValue(VALID_CATEGORY_ID)
  })

  it('pre-fills type tab with transaction type', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} />)

    expect(screen.getByTestId('tab-expense')).toBeInTheDocument()
  })

  // ── Submit ──────────────────────────────────────────────────────────────────

  it('calls updateTransactionAction on submit with correct data', async () => {
    updateTransactionActionMock.mockResolvedValue({
      success: true,
      message: 'Transaction updated successfully',
    })
    const onClose = vi.fn()

    render(<TransactionQuickEdit {...DEFAULT_PROPS} onClose={onClose} />)

    const form = screen.getByTestId('sheet-content').querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(updateTransactionActionMock).toHaveBeenCalledOnce()
    })

    const calledWith = updateTransactionActionMock.mock.calls[0][0]
    expect(calledWith.id).toBe(VALID_TX_ID)
    expect(calledWith.payee).toBe('Grocery Store')
    expect(calledWith.amount).toBe(1500)
  })

  it('shows success toast and closes drawer on successful update', async () => {
    updateTransactionActionMock.mockResolvedValue({
      success: true,
      message: 'Transaction updated successfully',
    })
    const onClose = vi.fn()

    render(<TransactionQuickEdit {...DEFAULT_PROPS} onClose={onClose} />)

    const form = screen.getByTestId('sheet-content').querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('form.update_success')
      expect(onClose).toHaveBeenCalledOnce()
      expect(routerRefreshMock).toHaveBeenCalledOnce()
    })
  })

  it('shows error toast on failed update', async () => {
    updateTransactionActionMock.mockResolvedValue({
      success: false,
      message: 'Error updating transaction',
    })
    const onClose = vi.fn()

    render(<TransactionQuickEdit {...DEFAULT_PROPS} onClose={onClose} />)

    const form = screen.getByTestId('sheet-content').querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('form.update_error')
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // ── Close behavior ──────────────────────────────────────────────────────────

  it('renders nothing when transaction is null', () => {
    render(<TransactionQuickEdit {...DEFAULT_PROPS} transaction={null} />)

    expect(screen.queryByTestId('sheet')).not.toBeInTheDocument()
  })
})
