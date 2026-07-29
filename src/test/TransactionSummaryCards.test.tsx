import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionSummaryCards } from '@/components/TransactionSummaryCards'

// ── Helpers ────────────────────────────────────────────────────────────────────

const DEFAULT_PROPS = {
  totalIncome: 8450,
  totalExpenses: 3214.5,
  netBalance: 5235.5,
}

const setup = (overrides: Partial<typeof DEFAULT_PROPS> = {}) => {
  const props = { ...DEFAULT_PROPS, ...overrides }
  return render(<TransactionSummaryCards {...props} />)
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionSummaryCards', () => {
  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders three summary cards', () => {
    setup()
    expect(screen.getByTestId('summary-income')).toBeTruthy()
    expect(screen.getByTestId('summary-expenses')).toBeTruthy()
    expect(screen.getByTestId('summary-balance')).toBeTruthy()
  })

  it('renders localized labels for each card', () => {
    setup()
    expect(screen.getByText('summary.total_income')).toBeTruthy()
    expect(screen.getByText('summary.total_expenses')).toBeTruthy()
    expect(screen.getByText('summary.net_balance')).toBeTruthy()
  })

  // ── Amount formatting ────────────────────────────────────────────────────

  // The $ sign and amount are in separate elements (<span>$</span> + text node),
  // so we use `within` to search inside each card's container.
  it('formats income amount correctly', () => {
    setup()
    const card = screen.getByTestId('summary-income')
    expect(within(card).getByText('8,450.00')).toBeTruthy()
    expect(within(card).getByText('$')).toBeTruthy()
  })

  it('formats expenses amount correctly', () => {
    setup()
    const card = screen.getByTestId('summary-expenses')
    expect(within(card).getByText('3,214.50')).toBeTruthy()
    expect(within(card).getByText('$')).toBeTruthy()
  })

  it('formats net balance amount correctly', () => {
    setup()
    const card = screen.getByTestId('summary-balance')
    expect(within(card).getByText('5,235.50')).toBeTruthy()
    expect(within(card).getByText('$')).toBeTruthy()
  })

  // ── Zero values ──────────────────────────────────────────────────────────

  it('formats zero values correctly', () => {
    setup({ totalIncome: 0, totalExpenses: 0, netBalance: 0 })
    expect(screen.getAllByText('$').length).toBe(3)
    expect(screen.getAllByText('0.00').length).toBe(3)
  })

  // ── Negative net balance ─────────────────────────────────────────────────

  it('handles negative net balance', () => {
    setup({ totalIncome: 1000, totalExpenses: 3000, netBalance: -2000 })
    const card = screen.getByTestId('summary-balance')
    expect(within(card).getByText('-2,000.00')).toBeTruthy()
  })

  // ── Large numbers ────────────────────────────────────────────────────────

  it('formats large numbers correctly', () => {
    setup({ totalIncome: 1234567.89, totalExpenses: 987654.32, netBalance: 246913.57 })
    const incomeCard = screen.getByTestId('summary-income')
    const expensesCard = screen.getByTestId('summary-expenses')
    const balanceCard = screen.getByTestId('summary-balance')
    expect(within(incomeCard).getByText('1,234,567.89')).toBeTruthy()
    expect(within(expensesCard).getByText('987,654.32')).toBeTruthy()
    expect(within(balanceCard).getByText('246,913.57')).toBeTruthy()
  })
})
