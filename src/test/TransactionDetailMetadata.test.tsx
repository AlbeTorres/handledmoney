import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { TransactionDetailMetadata } from '@/components/TransactionDetailMetadata'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransactionDetailMetadata', () => {
  it('renders the raw transaction id and the formatted creation date', () => {
    const createdAt = new Date(2024, 9, 1, 12, 0, 0) // Oct 1, 2024 (local)

    render(<TransactionDetailMetadata id='tx-123-abc' createdAt={createdAt} />)

    expect(screen.getByText('tx-123-abc')).toBeInTheDocument()
    expect(screen.getByText('Oct 1, 2024')).toBeInTheDocument()
  })

  it('renders the transaction id and added on labels', () => {
    render(<TransactionDetailMetadata id='tx-1' createdAt={new Date(2024, 0, 15)} />)

    expect(screen.getByText('transaction_id')).toBeInTheDocument()
    expect(screen.getByText('added_on')).toBeInTheDocument()
  })
})
