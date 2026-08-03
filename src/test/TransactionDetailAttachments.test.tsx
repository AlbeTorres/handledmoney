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
  it('renders the two placeholder files with names, sizes, and a count badge', () => {
    render(<TransactionDetailAttachments />)

    expect(screen.getByText('attachments')).toBeInTheDocument()
    expect(screen.getByText('attachments_placeholder_note')).toBeInTheDocument()

    expect(screen.getByText('Paystub_Oct24.pdf')).toBeInTheDocument()
    expect(screen.getByText('142 KB')).toBeInTheDocument()
    expect(screen.getByText('Bonus_Letter.png')).toBeInTheDocument()
    expect(screen.getByText('1.2 MB')).toBeInTheDocument()

    expect(screen.getByTestId('attachments-count').textContent).toBe('2')
  })

  it('renders a download affordance per file', () => {
    render(<TransactionDetailAttachments />)

    expect(screen.getAllByTestId('attachment-download')).toHaveLength(2)
  })

  it('renders an empty state without crashing when the file list is empty', () => {
    render(<TransactionDetailAttachments files={[]} />)

    expect(screen.getByTestId('attachments-empty')).toBeInTheDocument()
    expect(screen.queryByText('Paystub_Oct24.pdf')).not.toBeInTheDocument()
    expect(screen.getByTestId('attachments-count').textContent).toBe('0')
  })
})
