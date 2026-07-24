import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AccountInfo } from '@/components/AccountInfo'
import { Account } from '@/interfaces/Account'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/lib/utils', () => ({
  fmt: (value: number) => `$${value.toLocaleString('en-US')}`,
  getIconComponent: () => {
    // Return a simple mock component that renders a span
    const MockIcon = (props: any) => <span data-testid='mock-icon' {...props} />
    return MockIcon
  },
}))

vi.mock('@/components/Breadcrumb', () => ({
  Breadcrumb: ({ pathTitle }: { pathTitle: string }) => (
    <nav data-testid='breadcrumb'>{pathTitle}</nav>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_ACCOUNT: Account = {
  id: 'acc-123',
  userId: 'user-1',
  name: 'Cuenta Principal',
  bank: 'Banco Galicia',
  type: 'savings',
  currency: 'USD',
  balance: '150000',
  icon: 'account_balance',
  color: '137FEC',
  plaidId: null,
  transactionsCount: 42,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-06-20'),
  deletedAt: null,
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AccountInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Verify the account name is displayed as the main heading.
  // It is the most important identifier for the user.
  it('renders the account name in the h1 heading', () => {
    render(<AccountInfo account={MOCK_ACCOUNT} />)
    expect(screen.getAllByText('Cuenta Principal').length).toBeGreaterThanOrEqual(1)
  })

  // The bank is shown as the financial institution — helps the user
  // identify which entity the account belongs to.
  it('renders the bank name', () => {
    render(<AccountInfo account={MOCK_ACCOUNT} />)
    expect(screen.getByText('Banco Galicia')).toBeTruthy()
  })

  // The account type renders with capitalize.
  it('renders the account type', () => {
    render(<AccountInfo account={MOCK_ACCOUNT} />)
    expect(screen.getByText('savings')).toBeTruthy()
  })

  // The balance is displayed formatted using fmt() with the currency as suffix.
  it('renders the formatted balance and currency', () => {
    render(<AccountInfo account={MOCK_ACCOUNT} />)
    expect(screen.getByText('$150,000')).toBeTruthy()
    expect(screen.getByText('USD')).toBeTruthy()
  })

  // The breadcrumb shows the account name for navigation.
  it('renders the breadcrumb with the account name', () => {
    render(<AccountInfo account={MOCK_ACCOUNT} />)
    expect(screen.getByTestId('breadcrumb')).toBeTruthy()
    expect(screen.getAllByText('Cuenta Principal').length).toBeGreaterThanOrEqual(1)
  })

  // The CSV export button must be present.
  it('renders the CSV export button', () => {
    render(<AccountInfo account={MOCK_ACCOUNT} />)
    expect(screen.getByText('info.export_csv')).toBeTruthy()
  })
})
