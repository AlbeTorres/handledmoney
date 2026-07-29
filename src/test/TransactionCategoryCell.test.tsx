import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock ICONS with controlled mock icons so we can assert on specific rendering.
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

import { TransactionCategoryCell } from '@/components/TransactionCategoryCell'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionCategoryCell', () => {
  // ── Section: Category name rendering ─────────────────────────────────────────

  it('renders category name when provided', () => {
    render(<TransactionCategoryCell categoryName='Groceries' icon='shopping_cart' />)

    expect(screen.getByText('Groceries')).toBeTruthy()
  })

  it('renders uncategorized fallback when categoryName is undefined', () => {
    render(<TransactionCategoryCell categoryName={undefined} />)

    // useTranslations mock returns the key itself, so the fallback text is the translation key
    expect(screen.getByText('category_cell.uncategorized')).toBeTruthy()
  })

  it('renders uncategorized fallback when categoryName is empty', () => {
    render(<TransactionCategoryCell categoryName='' />)

    expect(screen.getByText('category_cell.uncategorized')).toBeTruthy()
  })

  // ── Section: Icon rendering ──────────────────────────────────────────────────

  it('renders an icon element', () => {
    const { container } = render(
      <TransactionCategoryCell categoryName='Food' icon='shopping_cart' />,
    )

    // The icon component renders a <span> with data-testid='icon-shopping'
    const icon = screen.getByTestId('icon-shopping')
    expect(icon).toBeTruthy()
  })

  it('renders default icon when no icon prop is provided', () => {
    render(<TransactionCategoryCell categoryName='Food' />)

    // With no icon prop, getIconComponent falls back to ICONS[0].icon (MockDefaultIcon)
    expect(screen.getByTestId('icon-default')).toBeTruthy()
  })

  it('renders default icon when icon name is not found in ICONS', () => {
    render(<TransactionCategoryCell categoryName='Food' icon='nonexistent_icon' />)

    // Unknown name → getIconComponent falls back to ICONS[0].icon
    expect(screen.getByTestId('icon-default')).toBeTruthy()
  })
})
