import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryColumn } from '@/components/CategoryColumn'

// ── Module mocks ─────────────────────────────────────────────────────────────

// Mock next-intl so that useTranslations returns the key string directly.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Section: Renders category name ───────────────────────────────────────────

describe('CategoryColumn', () => {
  it('renders category name when provided', () => {
    render(<CategoryColumn categoryName='Groceries' />)

    expect(screen.getByText('Groceries')).toBeTruthy()
  })

  // ── Section: Hides warning icon when name is provided ──────────────────────

  it('does not render warning icon when name is provided', () => {
    const { container } = render(<CategoryColumn categoryName='Groceries' />)

    // TriangleAlertIcon renders an <svg> — none should exist when name is provided
    expect(container.querySelector('svg')).toBeNull()
  })

  // ── Section: Uncategorized state ───────────────────────────────────────────

  it('renders uncategorized warning when name is undefined', () => {
    render(<CategoryColumn />)

    // useTranslations mock returns the key itself
    expect(screen.getByText('column.uncategorized')).toBeTruthy()
  })

  it('renders uncategorized warning when name is empty string', () => {
    render(<CategoryColumn categoryName='' />)

    expect(screen.getByText('column.uncategorized')).toBeTruthy()
  })

  it('contains a TriangleAlertIcon (svg) in uncategorized state', () => {
    const { container } = render(<CategoryColumn />)

    // TriangleAlertIcon renders as an <svg> element inside the span
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.tagName).toBe('svg')
  })
})
