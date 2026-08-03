import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionDetailExpenseBreakdown } from '@/components/TransactionDetailExpenseBreakdown'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionDetailExpenseBreakdown', () => {
  const fullDetails = {
    salesTax: '42.50',
    taxRate: '0.0725',
    isDeductible: true,
    deductionCategory: 'Office Supplies',
  }

  it('renders sales tax, formatted tax rate, deductible indicator, and deduction category', () => {
    render(<TransactionDetailExpenseBreakdown expenseDetails={fullDetails} />)

    expect(screen.getByText('expense_breakdown')).toBeInTheDocument()
    expect(screen.getByText('sales_tax')).toBeInTheDocument()
    expect(screen.getByText('$42.50')).toBeInTheDocument()
    expect(screen.getByText('tax_rate')).toBeInTheDocument()
    // 0.0725 * 100 → 7.25%
    expect(screen.getByText('7.25%')).toBeInTheDocument()
    expect(screen.getByText('deductible')).toBeInTheDocument()
    expect(screen.getByTestId('deductible-yes')).toBeInTheDocument()
    expect(screen.getByText('deduction_category')).toBeInTheDocument()
    expect(screen.getByText('Office Supplies')).toBeInTheDocument()
  })

  it('renders nothing when expenseDetails is null', () => {
    const { container } = render(<TransactionDetailExpenseBreakdown expenseDetails={null} />)

    expect(container.firstChild).toBeNull()
    expect(screen.queryByText('expense_breakdown')).not.toBeInTheDocument()
  })

  it('omits missing fields and shows the minus indicator when not deductible', () => {
    render(
      <TransactionDetailExpenseBreakdown
        expenseDetails={{
          salesTax: '10.00',
          taxRate: null,
          isDeductible: false,
          deductionCategory: null,
        }}
      />,
    )

    expect(screen.getByText('$10.00')).toBeInTheDocument()
    expect(screen.getByTestId('deductible-no')).toBeInTheDocument()
    expect(screen.queryByTestId('deductible-yes')).not.toBeInTheDocument()

    // Missing fields are omitted, not rendered empty
    expect(screen.queryByText('tax_rate')).not.toBeInTheDocument()
    expect(screen.queryByText('deduction_category')).not.toBeInTheDocument()
  })
})
