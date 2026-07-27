import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryPreview } from '@/components/CategoryPreview'
import { LucideIcon } from 'lucide-react'

// ── Module mocks ─────────────────────────────────────────────────────────────

// Mock next-intl so that useTranslations returns the key string directly.
// The component calls useTranslations('handledmoney.category') and then invokes
// returned functions like t('preview.live_preview'), t('preview.category_name'),
// t('preview.type'). The mock returns the last segment for easy assertion.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Test helpers ─────────────────────────────────────────────────────────────

// Simple mock icon component that the component will render via <Icon />.
const MockIcon = () => <svg data-testid='mock-icon' />

// Default props covering a happy-path scenario.
const defaultProps = {
  name: 'Groceries',
  color: '6366f1',
  type: 'expense',
  Icon: MockIcon as unknown as LucideIcon,
}

// ── Section: Renders category name ───────────────────────────────────────────

// The preview card should display the name passed via props.
// When name is empty the component falls back to the translation key
// 'preview.category_name'.
describe('CategoryPreview', () => {
  it('renders category name', () => {
    render(<CategoryPreview {...defaultProps} />)

    expect(screen.getByText('Groceries')).toBeTruthy()
  })

  it('falls back to translation key when name is empty', () => {
    render(<CategoryPreview {...defaultProps} name='' />)

    // useTranslations mock returns the key itself, so the fallback text is 'preview.category_name'
    expect(screen.getByText('preview.category_name')).toBeTruthy()
  })

  // ── Section: Renders capitalized type ─────────────────────────────────────

  // The component capitalizes the first letter of the type string.
  // "expense" should become "Expense".
  it('renders type with first letter capitalized', () => {
    render(<CategoryPreview {...defaultProps} />)

    expect(screen.getByText('Expense')).toBeTruthy()
  })

  // ── Section: Renders the provided Icon component ──────────────────────────

  // The Icon prop is a LucideIcon component. The component renders it inside
  // a colored circle. We verify it appears in the DOM via data-testid.
  it('renders the provided Icon component', () => {
    render(<CategoryPreview {...defaultProps} />)

    expect(screen.getByTestId('mock-icon')).toBeTruthy()
  })

  // ── Section: Applies color-based styles ───────────────────────────────────

  // The card wrapper applies backgroundColor and borderColor derived from
  // the hex color prop. The icon circle applies backgroundColor directly.
  // We check the inline style object on the rendered elements.
  it('applies color-based background style', () => {
    render(<CategoryPreview {...defaultProps} />)

    // The card wrapper derives its background and border from the color prop.
    // The component sets backgroundColor: '#' + color + '08' and borderColor: '#' + color + '30'.
    // jsdom normalizes these hex+alpha values to rgba, so we match the normalized output.
    // color '6366f1' = rgb(99,102,241); alpha '08' → 0.03, alpha '30' → 0.19.
    const card = document.querySelector('.rounded-2xl.border')
    expect(card).not.toBeNull()

    const style = card!.getAttribute('style')!
    expect(style).toContain('rgba(99, 102, 241, 0.03)')
    expect(style).toContain('rgba(99, 102, 241, 0.19)')
  })
})
