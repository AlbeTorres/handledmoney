import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionDetailIncomeBreakdown } from '@/components/TransactionDetailIncomeBreakdown'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionDetailIncomeBreakdown', () => {
  const fullDetails = {
    incomeType: 'service_w2',
    billingType: 'salary',
    grossAmount: '5000.00',
    taxesWithheld: '1200.00',
    taxBreakdown: { federal: 1000, state: 100, fica: 62, medicare: 14.5 },
  }

  it('renders badges, gross, taxes withheld with negative prefix, net, and all four tax rows', () => {
    render(<TransactionDetailIncomeBreakdown incomeDetails={fullDetails} />)

    // Type badges
    expect(screen.getByText('W2')).toBeInTheDocument()
    expect(screen.getByText('Salary')).toBeInTheDocument()

    // Section title
    expect(screen.getByText('income_breakdown')).toBeInTheDocument()

    // Amounts: gross $5,000.00; taxes withheld shown as -$1,200.00; net 5000-1200 = $3,800.00
    expect(screen.getByText('gross_amount')).toBeInTheDocument()
    expect(screen.getByText('$5,000.00')).toBeInTheDocument()
    expect(screen.getByText('taxes_withheld')).toBeInTheDocument()
    expect(screen.getByText('amount.expense_prefix$1,200.00')).toBeInTheDocument()
    expect(screen.getByText('net_amount')).toBeInTheDocument()
    expect(screen.getByText('$3,800.00')).toBeInTheDocument()

    // Tax details: all four known keys render
    expect(screen.getByText('tax_details')).toBeInTheDocument()
    expect(screen.getByText('tax_federal')).toBeInTheDocument()
    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    expect(screen.getByText('tax_state')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText('tax_fica')).toBeInTheDocument()
    expect(screen.getByText('$62.00')).toBeInTheDocument()
    expect(screen.getByText('tax_medicare')).toBeInTheDocument()
    expect(screen.getByText('$14.50')).toBeInTheDocument()
  })

  it('renders nothing when incomeDetails is null', () => {
    const { container } = render(<TransactionDetailIncomeBreakdown incomeDetails={null} />)

    expect(container.firstChild).toBeNull()
    expect(screen.queryByText('income_breakdown')).not.toBeInTheDocument()
  })

  it('renders only the tax rows present in a partial tax breakdown', () => {
    render(
      <TransactionDetailIncomeBreakdown
        incomeDetails={{
          incomeType: 'service_1099',
          billingType: 'project',
          grossAmount: '2500.00',
          taxesWithheld: '500.00',
          taxBreakdown: { federal: 400, state: 100 },
        }}
      />,
    )

    expect(screen.getByText('1099')).toBeInTheDocument()
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('tax_federal')).toBeInTheDocument()
    expect(screen.getByText('$400.00')).toBeInTheDocument()
    expect(screen.getByText('tax_state')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()

    // medicare (and fica) absent from the breakdown → not rendered
    expect(screen.queryByText('tax_fica')).not.toBeInTheDocument()
    expect(screen.queryByText('tax_medicare')).not.toBeInTheDocument()
  })

  it('omits badges when incomeType and billingType are missing but still renders amounts', () => {
    render(
      <TransactionDetailIncomeBreakdown
        incomeDetails={{
          incomeType: null,
          billingType: null,
          grossAmount: '3000.00',
          taxesWithheld: '200.00',
          taxBreakdown: null,
        }}
      />,
    )

    expect(screen.queryByText('W2')).not.toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()

    // Amounts still render: net = 3000 - 200
    expect(screen.getByText('$3,000.00')).toBeInTheDocument()
    expect(screen.getByText('amount.expense_prefix$200.00')).toBeInTheDocument()
    expect(screen.getByText('$2,800.00')).toBeInTheDocument()
    expect(screen.queryByText('tax_details')).not.toBeInTheDocument()
  })
})
