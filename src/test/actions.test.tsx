import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

const {
  mockPush,
  mockRouterRefresh,
  mockToastSuccess,
  mockToastError,
  mockDeleteTransactionAction,
  mockConfirm,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRouterRefresh: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
  mockDeleteTransactionAction: vi.fn(),
  mockConfirm: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRouterRefresh,
  }),
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

vi.mock('@/hooks/use-confirm', () => ({
  useConfirm: () => [
    ({ children }: { children: React.ReactNode }) => <div data-testid='confirm-dialog'>{children}</div>,
    mockConfirm,
  ],
}))

// Mock dropdown menu to render content directly (bypass Radix UI portal issues in jsdom)
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid='dropdown'>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid='dropdown-content'>{children}</div>,
  DropdownMenuItem: ({ children, onClick, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button onClick={onClick as () => void} data-testid='dropdown-item' {...props}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button {...props}>{children}</button>
  ),
}))

// ── Component Under Test ───────────────────────────────────────────────────────

import { Actions } from '@/components/actions'

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('Actions', () => {
  const TRANSACTION_ID = '550e8400-e29b-41d4-a716-446655440000'

  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteTransactionAction.mockResolvedValue({
      success: true,
      status: 200,
      message: 'Transaction deleted successfully',
    })
    mockConfirm.mockResolvedValue(true)
  })

  // ── Rendering ─────────────────────────────────────────────────────────────

  it('renders the dropdown trigger button', () => {
    render(<Actions id={TRANSACTION_ID} />)
    expect(screen.getByTestId('dropdown')).toBeTruthy()
  })

  it('renders the edit menu item', () => {
    render(<Actions id={TRANSACTION_ID} />)
    const items = screen.getAllByTestId('dropdown-item')
    expect(items.some(item => item.textContent?.includes('form.edit_transaction'))).toBe(true)
  })

  it('renders the delete menu item', () => {
    render(<Actions id={TRANSACTION_ID} />)
    const items = screen.getAllByTestId('dropdown-item')
    expect(items.length).toBeGreaterThanOrEqual(2)
    expect(items.some(item => item.textContent?.includes('form.delete_transaction'))).toBe(true)
  })

  // ── Edit navigation ───────────────────────────────────────────────────────

  it('navigates to edit page when edit menu item is clicked', async () => {
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const editItem = items.find(item => item.textContent?.includes('form.edit_transaction'))!
    await user.click(editItem)

    expect(mockPush).toHaveBeenCalledWith(`/transaction/${TRANSACTION_ID}/edit`)
  })

  it('navigates to detail page when view details menu item is clicked', async () => {
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const viewDetailsItem = items.find(item => item.textContent?.includes('row.view_details'))!
    await user.click(viewDetailsItem)

    expect(mockPush).toHaveBeenCalledWith(`/transaction/${TRANSACTION_ID}`)
  })

  it('orders the menu items: view details, edit, then delete', () => {
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    expect(items[0].textContent).toContain('row.view_details')
    expect(items[1].textContent).toContain('form.edit_transaction')
    expect(items[items.length - 1].textContent).toContain('form.delete_transaction')
  })

  // ── Delete confirmation ───────────────────────────────────────────────────

  it('shows confirmation dialog when delete is clicked', async () => {
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const deleteItem = items.find(item => item.textContent?.includes('form.delete_transaction'))!
    await user.click(deleteItem)

    expect(mockConfirm).toHaveBeenCalled()
  })

  // ── Delete success flow ───────────────────────────────────────────────────

  it('calls deleteTransactionAction on confirm with correct id', async () => {
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const deleteItem = items.find(item => item.textContent?.includes('form.delete_transaction'))!
    await user.click(deleteItem)

    await waitFor(() => {
      expect(mockDeleteTransactionAction).toHaveBeenCalledWith({ id: TRANSACTION_ID })
    })
  })

  it('shows success toast after successful deletion', async () => {
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const deleteItem = items.find(item => item.textContent?.includes('form.delete_transaction'))!
    await user.click(deleteItem)

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('form.delete_success')
    })
  })

  it('refreshes the page after successful deletion', async () => {
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const deleteItem = items.find(item => item.textContent?.includes('form.delete_transaction'))!
    await user.click(deleteItem)

    await waitFor(() => {
      expect(mockRouterRefresh).toHaveBeenCalled()
    })
  })

  // ── Delete error flow ─────────────────────────────────────────────────────

  it('shows error toast when deleteTransactionAction fails', async () => {
    mockDeleteTransactionAction.mockResolvedValue({
      success: false,
      status: 500,
      message: 'Something went wrong',
    })
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const deleteItem = items.find(item => item.textContent?.includes('form.delete_transaction'))!
    await user.click(deleteItem)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('form.delete_error')
    })
  })

  it('does not call deleteTransactionAction when confirmation is cancelled', async () => {
    mockConfirm.mockResolvedValue(false)
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const deleteItem = items.find(item => item.textContent?.includes('form.delete_transaction'))!
    await user.click(deleteItem)

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled()
      expect(mockDeleteTransactionAction).not.toHaveBeenCalled()
    })
  })

  it('does not show success toast when delete fails', async () => {
    mockDeleteTransactionAction.mockResolvedValue({
      success: false,
      status: 500,
      message: 'Something went wrong',
    })
    const user = userEvent.setup()
    render(<Actions id={TRANSACTION_ID} />)

    const items = screen.getAllByTestId('dropdown-item')
    const deleteItem = items.find(item => item.textContent?.includes('form.delete_transaction'))!
    await user.click(deleteItem)

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalled()
      expect(mockToastSuccess).not.toHaveBeenCalled()
    })
  })
})
