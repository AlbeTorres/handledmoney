import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/components/TransactionStatusBadge', () => ({
  TransactionStatusBadge: ({ status }: { status: string }) => (
    <span data-testid='status-badge'>{status}</span>
  ),
}))

import { TransactionAmountCell } from '@/components/TransactionAmountCell'

describe('TransactionAmountCell', () => {
  it('renders income amount with dollar prefix', () => {
    render(<TransactionAmountCell amount={4250} type='income' />)
    const cell = screen.getByTestId('amount-cell')
    expect(cell.textContent).toContain('4,250.00')
  })

  it('renders expense amount', () => {
    render(<TransactionAmountCell amount={142.3} type='expense' />)
    const cell = screen.getByTestId('amount-cell')
    expect(cell.textContent).toContain('142.30')
  })

  it('applies emerald color for income', () => {
    render(<TransactionAmountCell amount={100} type='income' />)
    const cell = screen.getByTestId('amount-cell')
    expect(cell.className).toContain('text-emerald')
  })

  it('renders status badge when status is provided', () => {
    render(<TransactionAmountCell amount={100} type='expense' status='cleared' />)
    expect(screen.getByTestId('status-badge')).toBeTruthy()
  })

  it('does not render status badge when status is null', () => {
    render(<TransactionAmountCell amount={100} type='expense' status={null} />)
    expect(screen.queryByTestId('status-badge')).toBeNull()
  })

  it('does not render status badge when status is undefined', () => {
    render(<TransactionAmountCell amount={100} type='expense' />)
    expect(screen.queryByTestId('status-badge')).toBeNull()
  })
})
