import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryCard } from '@/components/CategoryCard'

// ── Module mocks ─────────────────────────────────────────────────────────────

// Mock next-intl so that useTranslations returns the key string directly.
// This lets us verify the correct translation keys are used without loading JSON files.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock next/link so that <Link> renders as a plain <a> element.
// In jsdom the Next.js Link component doesn't produce a real anchor,
// so this mock ensures we can assert on href and rendered text.
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock the ICONS array from @/lib/data with two controlled mock icons.
// vi.hoisted ensures these values exist before vi.mock factories run (mocks are hoisted).
// Each icon is a simple component that outputs its name in a <span> for easy assertion.
const { MockIconA, MockIconB } = vi.hoisted(() => {
  const MockIconA = ({ className }: { className?: string }) => (
    <span data-testid='icon-a' className={className}>
      MockIconA
    </span>
  )
  const MockIconB = ({ className }: { className?: string }) => (
    <span data-testid='icon-b' className={className}>
      MockIconB
    </span>
  )
  return { MockIconA, MockIconB }
})

vi.mock('@/lib/data', () => ({
  ICONS: [
    { name: 'mock_icon_a', label: 'Icon A', icon: MockIconA },
    { name: 'mock_icon_b', label: 'Icon B', icon: MockIconB },
  ],
}))

// ── Test data ────────────────────────────────────────────────────────────────

const baseCategory = {
  id: 'cat-42',
  name: 'Groceries',
  type: 'expense' as const,
  icon: 'mock_icon_a',
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

// ── Section: Renders category name ───────────────────────────────────────────

// The card should display the category name passed via props.
// When no name is provided, it should fall back to the translation key 'card.category_name'.
describe('CategoryCard', () => {
  it('renders the category name', () => {
    render(<CategoryCard category={baseCategory} />)

    expect(screen.getByText('Groceries')).toBeTruthy()
  })

  it('falls back to translation key when name is empty', () => {
    const categoryWithoutName = { ...baseCategory, name: '' }

    render(<CategoryCard category={categoryWithoutName} />)

    // useTranslations mock returns the key itself, so the fallback text is 'card.category_name'
    expect(screen.getByText('card.category_name')).toBeTruthy()
  })

  // ── Section: Renders capitalized type ───────────────────────────────────────

  // The component capitalizes the first letter of category.type.
  // "expense" should become "Expense", "income" should become "Income", etc.
  it('renders the type with the first letter capitalized', () => {
    render(<CategoryCard category={baseCategory} />)

    expect(screen.getByText('Expense')).toBeTruthy()
  })

  it('capitalizes "income" type correctly', () => {
    const incomeCategory = { ...baseCategory, type: 'income' as const }

    render(<CategoryCard category={incomeCategory} />)

    expect(screen.getByText('Income')).toBeTruthy()
  })

  it('falls back to translation key when type is empty', () => {
    // Intentionally pass an empty string to test the component's fallback behavior.
    // CategorySelect type requires "expense" | "income", but we override for edge case coverage.
    const categoryWithoutType = { ...baseCategory, type: '' } as typeof baseCategory & { type: '' }

    render(<CategoryCard category={categoryWithoutType as any} />)

    // useTranslations mock returns the key itself, so the fallback text is 'card.type'
    expect(screen.getByText('card.type')).toBeTruthy()
  })

  // ── Section: Links to edit page ─────────────────────────────────────────────

  // The card wraps everything in a <Link> that navigates to the category edit page.
  // The href must follow the pattern /category/{id}/edit.
  it('links to the edit page with the correct href', () => {
    render(<CategoryCard category={baseCategory} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/category/cat-42/edit')
  })

  it('uses a different category id in the href when category changes', () => {
    const differentCategory = { ...baseCategory, id: 'cat-99' }

    render(<CategoryCard category={differentCategory} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/category/cat-99/edit')
  })

  // ── Section: Icon fallback ──────────────────────────────────────────────────

  // When the category's icon name does not match any entry in the ICONS array,
  // the component should look for the 'more_horizontal' icon. Since our mock ICONS
  // does not contain 'more_horizontal', the final fallback is ICONS[0].icon (MockIconA).
  it('falls back to the first icon when icon name is not found in ICONS', () => {
    const categoryWithUnknownIcon = { ...baseCategory, icon: 'nonexistent_icon' }

    render(<CategoryCard category={categoryWithUnknownIcon} />)

    // The fallback path: find('nonexistent') → null, find('more_horizontal') → null, ICONS[0].icon → MockIconA
    expect(screen.getByTestId('icon-a')).toBeTruthy()
  })

  // ── Section: Correct icon rendering ─────────────────────────────────────────

  // When the category's icon name matches an entry in the ICONS array,
  // the corresponding icon component should be rendered.
  it('renders the correct icon when the icon name matches an entry in ICONS', () => {
    render(<CategoryCard category={baseCategory} />)

    expect(screen.getByTestId('icon-a')).toBeTruthy()
    // The other icon should NOT be present in the DOM
    expect(screen.queryByTestId('icon-b')).toBeNull()
  })

  it('renders a different icon when the category uses another valid icon name', () => {
    const categoryWithIconB = { ...baseCategory, icon: 'mock_icon_b' }

    render(<CategoryCard category={categoryWithIconB} />)

    expect(screen.getByTestId('icon-b')).toBeTruthy()
    expect(screen.queryByTestId('icon-a')).toBeNull()
  })
})
