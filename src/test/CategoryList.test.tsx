import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryList } from '@/components/CategoryList'

// ── Module mocks ─────────────────────────────────────────────────────────────

// Mock next-intl so that useTranslations returns the key string directly.
// This lets us verify the correct translation keys are used without loading JSON files.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock CategoryCard so we can assert on props without rendering the full card tree.
// Each mock renders a div with data-testid="category-card" and the category name.
vi.mock('@/components/CategoryCard', () => ({
  CategoryCard: ({ category }: { category: { name: string } }) => (
    <div data-testid='category-card'>{category.name}</div>
  ),
}))

// ── Test data ────────────────────────────────────────────────────────────────

const baseCategory = {
  id: 'cat-42',
  name: 'Groceries',
  type: 'expense' as const,
  icon: 'shopping_cart',
  color: '6366f1',
  userId: 'user-1',
  plaidId: null,
  isDefault: false,
  order: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  archivedAt: null,
}

// ── Section: Empty state ─────────────────────────────────────────────────────

// When no categories are provided, CategoryList renders a centered empty state
// with a Search icon and two translation keys: "list.no_results" and "list.try_adjusting_search".
describe('CategoryList', () => {
  it('renders empty state when categories array is empty', () => {
    render(<CategoryList categories={[]} />)

    // The empty state should not render any CategoryCard components.
    expect(screen.queryByTestId('category-card')).toBeNull()
  })

  it('shows "list.no_results" text in empty state', () => {
    render(<CategoryList categories={[]} />)

    // useTranslations mock returns the key itself, so we expect the raw translation key.
    expect(screen.getByText('list.no_results')).toBeTruthy()
  })

  // ── Section: Category cards ────────────────────────────────────────────────

  // When categories are provided, CategoryList renders a grid of CategoryCard components.
  // The number of rendered cards must match the length of the input array.
  it('renders correct number of CategoryCards when categories provided', () => {
    const categories = [
      { ...baseCategory, id: 'cat-1', name: 'Groceries' },
      { ...baseCategory, id: 'cat-2', name: 'Transport' },
      { ...baseCategory, id: 'cat-3', name: 'Entertainment' },
    ]

    render(<CategoryList categories={categories} />)

    const cards = screen.getAllByTestId('category-card')
    expect(cards).toHaveLength(3)
  })

  it('each CategoryCard receives the correct category data', () => {
    const categories = [
      { ...baseCategory, id: 'cat-1', name: 'Groceries' },
      { ...baseCategory, id: 'cat-2', name: 'Transport' },
    ]

    render(<CategoryList categories={categories} />)

    const cards = screen.getAllByTestId('category-card')
    expect(cards[0].textContent).toBe('Groceries')
    expect(cards[1].textContent).toBe('Transport')
  })

  // ── Section: No empty state when categories exist ──────────────────────────

  // When at least one category is passed, the empty state should NOT appear.
  // The no_results text should be absent from the DOM.
  it('does not show empty state when categories exist', () => {
    const categories = [
      { ...baseCategory, id: 'cat-1', name: 'Groceries' },
    ]

    render(<CategoryList categories={categories} />)

    expect(screen.queryByText('list.no_results')).toBeNull()
    expect(screen.queryByText('list.try_adjusting_search')).toBeNull()
  })
})
