import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

const {
  mockPush,
  mockToastSuccess,
  mockToastError,
  mockDeleteTransactionAction,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockDeleteTransactionAction: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
}

type ChildrenProps = { children: ReactNode }
type DialogProps = ChildrenProps & { open?: boolean }

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: MockLinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

vi.mock('@/actions/transaction/delete-transaction', () => ({
  deleteTransactionAction: mockDeleteTransactionAction,
}))

// jsdom has no Radix portals — render the confirmation content in place
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: DialogProps) =>
    open ? <div data-testid='dialog'>{children}</div> : null,
  DialogContent: ({ children }: ChildrenProps) => <div>{children}</div>,
  DialogDescription: ({ children }: ChildrenProps) => <p>{children}</p>,
  DialogFooter: ({ children }: ChildrenProps) => <div>{children}</div>,
  DialogHeader: ({ children }: ChildrenProps) => <div>{children}</div>,
  DialogTitle: ({ children }: ChildrenProps) => <h2>{children}</h2>,
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import TransacctionDetailAction from '@/app/(financeapp)/transaction/[id]/components/TransacctionDetailAction'

// ── Helpers ────────────────────────────────────────────────────────────────────

const TRANSACTION_ID = '550e8400-e29b-41d4-a716-446655440000'

const setup = () => render(<TransacctionDetailAction id={TRANSACTION_ID} />)

const deleteButton = () => screen.getByRole('button', { name: 'row.delete_transaction' })

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('TransacctionDetailAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteTransactionAction.mockResolvedValue({
      success: true,
      status: 200,
      message: 'Transaction deleted successfully',
    })
  })

  it('renders an edit link to the edit route', () => {
    setup()

    const editLink = screen.getByRole('link', { name: /edit/i })
    expect(editLink).toHaveAttribute('href', `/transaction/${TRANSACTION_ID}/edit`)
  })

  it('opens the confirmation dialog and does not delete until confirmed', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(deleteButton())

    expect(screen.getByTestId('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockDeleteTransactionAction).not.toHaveBeenCalled()
  })

  it('calls the delete action, shows a success toast, and redirects on success', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(deleteButton())
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(mockDeleteTransactionAction).toHaveBeenCalledWith({ id: TRANSACTION_ID })
      expect(mockToastSuccess).toHaveBeenCalledWith('form.delete_success')
      expect(mockPush).toHaveBeenCalledWith('/transaction')
    })
  })

  it('shows an error toast and does not redirect when deletion fails', async () => {
    mockDeleteTransactionAction.mockResolvedValue({
      success: false,
      status: 500,
      message: 'Something went wrong',
    })
    const user = userEvent.setup()
    setup()

    await user.click(deleteButton())
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('delete.error_generic')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('shows an error toast when the delete action throws', async () => {
    mockDeleteTransactionAction.mockRejectedValue(new Error('network'))
    const user = userEvent.setup()
    setup()

    await user.click(deleteButton())
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('delete.error_generic')
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('disables the delete button while deletion is pending', async () => {
    mockDeleteTransactionAction.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    setup()

    await user.click(deleteButton())
    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(deleteButton()).toBeDisabled()
    })
  })
})
