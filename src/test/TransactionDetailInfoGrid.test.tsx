import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const { MockDefaultIcon, MockShoppingIcon } = vi.hoisted(() => {
  const MockDefaultIcon = ({ className }: { className?: string }) => (
    <span data-testid='icon-default' className={className}>
      DefaultIcon
    </span>
  )
  const MockShoppingIcon = ({ className }: { className?: string }) => (
    <span data-testid='icon-shopping' className={className}>
      ShoppingIcon
    </span>
  )
  return { MockDefaultIcon, MockShoppingIcon }
})

vi.mock('@/lib/data', () => ({
  ICONS: [
    { name: 'account_balance', label: 'Checkings', icon: MockDefaultIcon },
    { name: 'shopping_cart', label: 'Shopping', icon: MockShoppingIcon },
  ],
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionDetailInfoGrid } from '@/components/TransactionDetailInfoGrid'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionDetailInfoGrid', () => {
  const category = { id: 'cat-1', name: 'Groceries', icon: 'shopping_cart' }

  it('renders payee, category name with icon, and notes', () => {
    render(
      <TransactionDetailInfoGrid
        payee='Whole Foods'
        category={category}
        notes='Weekly groceries'
      />,
    )

    expect(screen.getByText('Whole Foods')).toBeInTheDocument()
    expect(screen.getByText('Groceries')).toBeInTheDocument()
    expect(screen.getByTestId('icon-shopping')).toBeInTheDocument()
    expect(screen.getByText('Weekly groceries')).toBeInTheDocument()
  })

  it('renders the uncategorized fallback when category is null', () => {
    render(<TransactionDetailInfoGrid payee='Whole Foods' category={null} notes={null} />)

    expect(screen.getByText('category_cell.uncategorized')).toBeInTheDocument()
    expect(screen.getByTestId('icon-default')).toBeInTheDocument()
  })

  it('renders an em dash for null notes without crashing', () => {
    render(<TransactionDetailInfoGrid payee='Whole Foods' category={category} notes={null} />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders the placeholder tags from the typed constant, marked as placeholder', () => {
    render(<TransactionDetailInfoGrid payee='Whole Foods' category={category} notes={null} />)

    expect(screen.getByText('Work, Q4')).toBeInTheDocument()
    const tagsRow = screen.getByTestId('tags-placeholder')
    expect(tagsRow).toHaveAttribute('data-placeholder', 'true')
  })
})
