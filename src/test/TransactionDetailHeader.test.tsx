import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionDetailHeader } from '@/components/TransactionDetailHeader'

// ── Helpers ────────────────────────────────────────────────────────────────────

const defaultProps = {
  type: 'income' as const,
  amount: '5000.00',
  payee: 'Acme Corp',
  date: new Date(2024, 9, 1, 12, 0, 0), // Oct 1, 2024 (local)
  account: { bank: 'Chase', name: 'Business Checking', currency: 'USD' },
}

const setup = (props: Partial<typeof defaultProps> = {}) =>
  render(<TransactionDetailHeader {...defaultProps} {...props} />)

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionDetailHeader', () => {
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

  it('does not render a fabricated status badge (no persisted status field)', () => {
    setup()

    expect(screen.queryByText('status.cleared')).not.toBeInTheDocument()
    expect(screen.queryByText('status.pending')).not.toBeInTheDocument()
    expect(screen.queryByText('status.recurring')).not.toBeInTheDocument()
  })
})
