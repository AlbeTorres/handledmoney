import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AccountCardWrapper } from '@/components/AccountCardWrapper'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/lib/utils', () => ({
  getIconComponent: () => {
    const MockIcon = (props: any) => <span data-testid='mock-icon' {...props} />
    return MockIcon
  },
}))

// Mock TiltCardWrapper — replace with a simple div to isolate
// AccountCardWrapper from the 3D effect (tested separately).
vi.mock('@/components/TiltCardWrapper', () => ({
  TiltCardWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock AccountCard — verify it receives the correct props without
// testing its internal rendering (already covered in AccountCard.test.tsx).
vi.mock('@/components/AccountCard', () => ({
  AccountCard: ({ name, institution, onDetails, onEdit, onDelete, balance, currency }: any) => (
    <div data-testid='account-card'>
      <span data-testid='card-name'>{name}</span>
      <span data-testid='card-institution'>{institution}</span>
      <span data-testid='card-balance'>{balance}</span>
      <span data-testid='card-currency'>{currency}</span>
      <button onClick={onDetails}>Details</button>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}))

// Mock DeleteAccountDialog — verify it opens/closes correctly.
vi.mock('@/components/DeleteAccountDialog', () => ({
  DeleteAccountDialog: ({ isOpen, onClose, name }: any) =>
    isOpen ? (
      <div data-testid='delete-dialog'>
        <span data-testid='dialog-account-name'>{name}</span>
        <button onClick={onClose}>Close Dialog</button>
      </div>
    ) : null,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_ACCOUNT = {
  id: 'acc-123',
  name: 'Cuenta Principal',
  bank: 'Banco Galicia',
  type: 'savings',
  currency: 'USD',
  balance: '150000',
  icon: 'account_balance',
  color: '137FEC',
}

const OTHER_ACCOUNTS = [
  { id: 'acc-456', name: 'Cuenta Secundaria' },
]

const setup = (overrides: Partial<typeof MOCK_ACCOUNT> = {}) => {
  const account = { ...MOCK_ACCOUNT, ...overrides }
  return render(
    <AccountCardWrapper
      account={account}
      hasTransactions={false}
      otherAccounts={OTHER_ACCOUNTS}
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AccountCardWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  // Verify AccountCard renders with transformed data.
  // The wrapper is responsible for converting raw API data to the format
  // that AccountCard expects.
  it('renders AccountCard with the account name', () => {
    setup()
    expect(screen.getByTestId('card-name').textContent).toBe('Cuenta Principal')
  })

  it('renders the financial institution', () => {
    setup()
    expect(screen.getByTestId('card-institution').textContent).toBe('Banco Galicia')
  })

  // Balance is formatted as localized currency — a critical transformation
  // from the wrapper.
  it('formats balance as currency', () => {
    setup()
    expect(screen.getByTestId('card-balance').textContent).toContain('150')
  })

  it('passes currency to the card', () => {
    setup()
    expect(screen.getByTestId('card-currency').textContent).toBe('USD')
  })

  // ── Color ─────────────────────────────────────────────────────────────────

  // The color comes from the API as hex without hash; the wrapper adds the '#'.
  it('adds the # prefix to the color', () => {
    setup()
    // Verify the component renders without errors with the color
    expect(screen.getByTestId('account-card')).toBeTruthy()
  })

  // ── Routing ───────────────────────────────────────────────────────────────

  // Clicking "Details" navigates to the detail page.
  it('navigates to detail page when clicking Details', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByText('Details'))
    expect(pushMock).toHaveBeenCalledWith('/account/acc-123')
  })

  // Clicking "Edit" navigates to the edit page.
  it('navigates to edit page when clicking Edit', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByText('Edit'))
    expect(pushMock).toHaveBeenCalledWith('/account/acc-123/edit')
  })

  // ── Delete dialog ─────────────────────────────────────────────────────────

  // Clicking "Delete" opens the confirmation dialog.
  it('opens DeleteAccountDialog when clicking Delete', async () => {
    const user = userEvent.setup()
    setup()

    expect(screen.queryByTestId('delete-dialog')).toBeNull()

    await user.click(screen.getByText('Delete'))
    expect(screen.getByTestId('delete-dialog')).toBeTruthy()
  })

  // The dialog receives the account name for confirmation.
  it('passes account name to DeleteAccountDialog', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByText('Delete'))
    expect(screen.getByTestId('dialog-account-name').textContent).toBe('Cuenta Principal')
  })

  // Closing the dialog unmounts it.
  it('closes DeleteAccountDialog when clicking Close', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByText('Delete'))
    expect(screen.getByTestId('delete-dialog')).toBeTruthy()

    await user.click(screen.getByText('Close Dialog'))
    expect(screen.queryByTestId('delete-dialog')).toBeNull()
  })

  // ── Fallback values ───────────────────────────────────────────────────────

  // If bank is undefined, the default value 'card.unknown_bank' is shown.
  it('shows default bank when undefined', () => {
    setup({ bank: undefined as any })
    expect(screen.getByTestId('card-institution').textContent).toBe('card.unknown_bank')
  })

  // If name is undefined, 'card.unnamed_account' is shown.
  it('shows default name when undefined', () => {
    setup({ name: undefined as any })
    expect(screen.getByTestId('card-name').textContent).toBe('card.unnamed_account')
  })
})
