import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionStatusBadge } from '@/components/TransactionStatusBadge'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionStatusBadge', () => {
  it('renders cleared badge with correct label', () => {
    render(<TransactionStatusBadge status='cleared' />)
    expect(screen.getByText('status.cleared')).toBeTruthy()
  })

  it('renders pending badge with correct label', () => {
    render(<TransactionStatusBadge status='pending' />)
    expect(screen.getByText('status.pending')).toBeTruthy()
  })

  it('renders recurring badge with correct label', () => {
    render(<TransactionStatusBadge status='recurring' />)
    expect(screen.getByText('status.recurring')).toBeTruthy()
  })

  it('renders nothing when status is null', () => {
    const { container } = render(<TransactionStatusBadge status={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when status is undefined', () => {
    const { container } = render(<TransactionStatusBadge status={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('applies green styling for cleared status', () => {
    render(<TransactionStatusBadge status='cleared' />)
    const badge = screen.getByText('status.cleared').closest('span')
    expect(badge?.className).toContain('bg-emerald')
  })

  it('applies amber styling for pending status', () => {
    render(<TransactionStatusBadge status='pending' />)
    const badge = screen.getByText('status.pending').closest('span')
    expect(badge?.className).toContain('bg-amber')
  })

  it('applies slate styling for recurring status', () => {
    render(<TransactionStatusBadge status='recurring' />)
    const badge = screen.getByText('status.recurring').closest('span')
    expect(badge?.className).toContain('bg-slate')
  })
})
