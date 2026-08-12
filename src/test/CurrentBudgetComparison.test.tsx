import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }))
import { CurrentBudgetComparison } from '@/components/CurrentBudgetComparison'

const comparison = {
  budget: { id: 'budget-1', userId: 'user-1', name: 'August plan', startDate: new Date(), endDate: null, createdAt: new Date(), updatedAt: new Date() },
  categories: [{ categoryId: 'rent', categoryName: 'Rent', type: 'expense' as const, plannedAmount: 1000, actualAmount: 900, variance: 100 }],
  actualWithoutPlan: [{ categoryId: 'coffee', categoryName: 'Coffee', type: 'expense' as const, plannedAmount: 0, actualAmount: 25, variance: -25 }],
  plannedWithoutActual: [],
  income: { plannedAmount: 0, actualAmount: 0, variance: 0 },
  outflow: { plannedAmount: 1000, actualAmount: 925, variance: 75 },
}

describe('CurrentBudgetComparison', () => {
  it('renders an accessible current plan comparison including unplanned actual categories', () => {
    render(<CurrentBudgetComparison comparison={comparison} />)
    expect(screen.getByRole('heading', { name: 'August plan' })).toBeInTheDocument()
    expect(screen.getByText('Rent')).toBeInTheDocument()
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText('Unplanned')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Outflow')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View budget' })).toHaveAttribute('href', '/budget/budget-1')
  })

  it('explains how to continue when no current budget exists', () => {
    render(<CurrentBudgetComparison comparison={null} />)
    expect(screen.getByText(/Select a budget to compare/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Select current budget' })).toHaveAttribute('href', '/budget')
  })
})
