import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionDetailAttachments } from '@/components/TransactionDetailAttachments'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionDetailAttachments', () => {
  it('renders the translated empty state when no files exist', () => {
    render(<TransactionDetailAttachments />)

    expect(screen.getByText('attachments')).toBeInTheDocument()
    expect(screen.getByTestId('attachments-empty')).toBeInTheDocument()
    expect(screen.getByTestId('attachments-empty').textContent).toContain('attachments_empty')
    expect(screen.getByTestId('attachments-count').textContent).toBe('0')
  })

  it('renders an explicit empty state instead of fabricated files', () => {
    render(<TransactionDetailAttachments />)

    expect(screen.queryByText('Paystub_Oct24.pdf')).not.toBeInTheDocument()
    expect(screen.queryByText('Bonus_Letter.png')).not.toBeInTheDocument()
  })

  it('never renders download affordances (no fake download links)', () => {
    render(<TransactionDetailAttachments />)

    expect(screen.queryByTestId('attachment-download')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders real files when provided', () => {
    render(<TransactionDetailAttachments files={[{ name: 'receipt.pdf', size: '48 KB' }]} />)

    expect(screen.getByText('receipt.pdf')).toBeInTheDocument()
    expect(screen.getByText('48 KB')).toBeInTheDocument()
    expect(screen.getByTestId('attachments-count').textContent).toBe('1')
    expect(screen.queryByTestId('attachments-empty')).not.toBeInTheDocument()
  })
})
