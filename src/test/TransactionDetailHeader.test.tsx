import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionDetailHeader } from '@/app/(financeapp)/transaction/[id]/components/TransactionDetailHeader'

// ── Helpers ────────────────────────────────────────────────────────────────────

const defaultProps: {
  type: 'income' | 'expense'
  amount: string | null
  payee: string
  date: Date
  account: { bank: string; name: string; currency: string }
} = {
  type: 'income',
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
  })

  it('renders type badge, formatted date, payee title, and account line', () => {
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

  it('renders the Cleared status badge', () => {
    setup()

    expect(screen.getByText('status.cleared')).toBeInTheDocument()
  })

  it('falls back to a zero amount when amount is null', () => {
    setup({ amount: null })

    expect(screen.getByText('amount.income_prefix$0.00')).toBeInTheDocument()
  })
})
