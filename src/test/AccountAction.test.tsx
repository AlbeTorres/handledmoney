import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import AccountAction from '@/components/AccountAction'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/hooks/use-debounced-search-params', () => ({
  useDebouncedSearchParam: () => ['search-term', vi.fn()],
}))

vi.mock('@/hooks/use-filter-params', () => ({
  useFilterParam: () => [['USD'], vi.fn()],
}))

vi.mock('@/hooks/use-sort-params', () => ({
  useSortParam: () => ['highest_balance', vi.fn()],
}))

// Mock ActionBar — verify it receives the correct props.
vi.mock('@/components/ActionBar', () => ({
  default: ({ searchTerm, href, placeholder, buttonText, children }: any) => (
    <div data-testid='action-bar'>
      <span data-testid='search-term'>{searchTerm}</span>
      <span data-testid='href'>{href}</span>
      <span data-testid='placeholder'>{placeholder}</span>
      <span data-testid='button-text'>{buttonText}</span>
      {children}
    </div>
  ),
}))

vi.mock('@/components/FilterDropdown', () => ({
  default: ({ label, options, selected }: any) => (
    <div data-testid='filter-dropdown'>
      <span data-testid='filter-label'>{label}</span>
      <span data-testid='filter-options'>{options.length}</span>
      <span data-testid='filter-selected'>{selected.join(',')}</span>
    </div>
  ),
}))

vi.mock('@/components/SortDropdown', () => ({
  default: ({ options, selected }: any) => (
    <div data-testid='sort-dropdown'>
      <span data-testid='sort-options'>{options.length}</span>
      <span data-testid='sort-selected'>{selected}</span>
    </div>
  ),
}))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AccountAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Verify ActionBar renders with the correct href for creating a new account.
  it('renders ActionBar with href to /account/create', () => {
    render(<AccountAction />)
    expect(screen.getByTestId('href').textContent).toBe('/account/create')
  })

  // The search placeholder uses the translation key.
  it('renders the search placeholder with translation key', () => {
    render(<AccountAction />)
    expect(screen.getByTestId('placeholder').textContent).toBe('action.search_placeholder')
  })

  // The new account button text uses the translation key.
  it('renders the new account button text', () => {
    render(<AccountAction />)
    expect(screen.getByTestId('button-text').textContent).toBe('action.new_account')
  })

  // FilterDropdown renders with 4 currency options (USD, EUR, ARS, GBP).
  it('renders FilterDropdown with 4 currency options', () => {
    render(<AccountAction />)
    expect(screen.getByTestId('filter-dropdown')).toBeTruthy()
    expect(screen.getByTestId('filter-options').textContent).toBe('4')
  })

  // SortDropdown renders with 3 sort options.
  it('renders SortDropdown with 3 sort options', () => {
    render(<AccountAction />)
    expect(screen.getByTestId('sort-dropdown')).toBeTruthy()
    expect(screen.getByTestId('sort-options').textContent).toBe('3')
  })
})
