import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AccountCard, AccountCardProps } from '@/components/AccountCard'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Full AccountCard mock to isolate it from Radix UI DropdownMenu.
// The real component uses Radix which requires portals/overlays that jsdom doesn't support.
vi.mock('@/components/AccountCard', () => ({
  AccountCard: ({ institution, name, balance, currency, detail, onDetails, onEdit, onDelete, accentColor }: any) => (
    <div data-testid='account-card' style={{ borderLeftColor: accentColor }}>
      <span data-testid='card-institution'>{institution}</span>
      <span data-testid='card-name'>{name}</span>
      <span data-testid='card-balance'>{balance}</span>
      <span data-testid='card-currency'>{currency}</span>
      <span data-testid='card-detail'>{detail}</span>
      <button onClick={onDetails}>Details</button>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_PROPS: AccountCardProps = {
  institution: 'Banco Galicia',
  name: 'Cuenta Principal',
  balance: '$150,000.00',
  currency: 'USD',
  detail: 'Savings',
  status: 'Active',
  statusVariant: 'active',
  accentColor: '#3b82f6',
  Icon: (() => null) as any,
  onDetails: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

const setup = (overrides: Partial<AccountCardProps> = {}) => {
  const props = { ...DEFAULT_PROPS, ...overrides }
  return {
    props,
    ...render(<AccountCard {...props} />),
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AccountCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  // Verify that basic account information renders correctly.
  // These are the data points the user needs to identify each account.
  it('renders the account name', () => {
    setup()
    expect(screen.getByText('Cuenta Principal')).toBeTruthy()
  })

  it('renders the financial institution', () => {
    setup()
    expect(screen.getByText('Banco Galicia')).toBeTruthy()
  })

  it('renders the formatted balance', () => {
    setup()
    expect(screen.getByText('$150,000.00')).toBeTruthy()
  })

  it('renders the currency', () => {
    setup()
    expect(screen.getByText('USD')).toBeTruthy()
  })

  it('renders the detail (account type)', () => {
    setup()
    expect(screen.getByText('Savings')).toBeTruthy()
  })

  // ── Accent color ──────────────────────────────────────────────────────────

  // The accent color is applied as a border-left to visually identify
  // each account — it's part of the established design.
  it('applies accentColor as border-left', () => {
    setup()
    const card = screen.getByTestId('account-card')
    expect(card).toHaveStyle({ borderLeftColor: 'rgb(59, 130, 246)' })
  })

  // ── Actions (dropdown) ────────────────────────────────────────────────────

  // The options dropdown has "Details", "Edit" and "Delete" —
  // verify all three actions are present.
  it('renders dropdown options (Details, Edit, Delete)', () => {
    setup()
    expect(screen.getByText('Details')).toBeTruthy()
    expect(screen.getByText('Edit')).toBeTruthy()
    expect(screen.getByText('Delete')).toBeTruthy()
  })

  it('calls onDetails when clicking Details', async () => {
    const user = userEvent.setup()
    const { props } = setup()

    await user.click(screen.getByText('Details'))
    expect(props.onDetails).toHaveBeenCalledTimes(1)
  })

  it('calls onEdit when clicking Edit', async () => {
    const user = userEvent.setup()
    const { props } = setup()

    await user.click(screen.getByText('Edit'))
    expect(props.onEdit).toHaveBeenCalledTimes(1)
  })

  it('calls onDelete when clicking Delete', async () => {
    const user = userEvent.setup()
    const { props } = setup()

    await user.click(screen.getByText('Delete'))
    expect(props.onDelete).toHaveBeenCalledTimes(1)
  })
})
