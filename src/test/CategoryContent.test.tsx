import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryContent } from '@/components/CategoryContent'

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/components/CategoryCard', () => ({
  CategoryCard: ({ category }: any) => (
    <div data-testid='category-card'>{category.name}</div>
  ),
}))

// ── Test data ────────────────────────────────────────────────────────────────

const makeCategory = (overrides: Record<string, any>) => ({
  id: 'id-1',
  userId: 'user-1',
  name: 'Food',
  icon: 'utensils',
  color: '#ff0000',
  type: 'expense' as const,
  isDefault: false,
  order: 0,
  plaidId: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
  archivedAt: null,
  ...overrides,
})

const categories = [
  makeCategory({ id: '1', name: 'Groceries', type: 'expense', createdAt: new Date('2025-06-01') }),
  makeCategory({ id: '2', name: 'Salary', type: 'income', createdAt: new Date('2025-07-01') }),
  makeCategory({ id: '3', name: 'Rent', type: 'expense', createdAt: new Date('2025-05-01') }),
  makeCategory({ id: '4', name: 'Dividends', type: 'income', createdAt: new Date('2025-04-01') }),
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const renderAll = (overrides: Partial<Parameters<typeof CategoryContent>[0]> = {}) => {
  const props = {
    categories,
    activeType: [] as ('expense' | 'income')[],
    search: '',
    sort: '',
    ...overrides,
  }
  render(<CategoryContent {...props} />)
}

const cardNames = () =>
  screen.getAllByTestId('category-card').map(el => el.textContent)

// ── Section: Default rendering ───────────────────────────────────────────────

describe('CategoryContent', () => {
  it('renders all categories when no filter and no search', () => {
    renderAll()

    expect(cardNames()).toHaveLength(4)
    expect(screen.getAllByTestId('category-card')).toHaveLength(4)
  })

  // ── Section: Type filtering ──────────────────────────────────────────────

  it('filters by type when activeType contains expense', () => {
    renderAll({ activeType: ['expense'] })

    expect(cardNames()).toEqual(['Groceries', 'Rent'])
  })

  it('filters by type when activeType contains income', () => {
    renderAll({ activeType: ['income'] })

    expect(cardNames()).toEqual(['Salary', 'Dividends'])
  })

  it('shows all when activeType is empty array', () => {
    renderAll({ activeType: [] })

    expect(cardNames()).toHaveLength(4)
  })

  // ── Section: Search filtering ────────────────────────────────────────────

  it('filters by search case-insensitive', () => {
    renderAll({ search: 'SALA' })

    expect(cardNames()).toEqual(['Salary'])
  })

  // ── Section: Sorting ─────────────────────────────────────────────────────

  it('sorts alphabetically by name when sort is category_name', () => {
    renderAll({ sort: 'category_name' })

    expect(cardNames()).toEqual(['Dividends', 'Groceries', 'Rent', 'Salary'])
  })

  it('sorts by date descending when sort is recently_added', () => {
    renderAll({ sort: 'recently_added' })

    // Salary 2025-07-01, Groceries 2025-06-01, Rent 2025-05-01, Dividends 2025-04-01
    expect(cardNames()).toEqual(['Salary', 'Groceries', 'Rent', 'Dividends'])
  })

  // ── Section: Combined filtering ──────────────────────────────────────────

  it('combines type filter and search', () => {
    renderAll({ activeType: ['expense'], search: 'ren' })

    expect(cardNames()).toEqual(['Rent'])
  })

  // ── Section: Empty results ───────────────────────────────────────────────

  it('shows nothing when no categories match filter', () => {
    renderAll({ search: 'xyz' })

    expect(screen.queryAllByTestId('category-card')).toHaveLength(0)
  })
})
