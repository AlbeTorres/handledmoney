import UpdatePasswordSettings from '@/components/UpdatePasswordSettings'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ────────────────────────────────────────────────────────────

const { changePasswordMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  changePasswordMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    changePassword: changePasswordMock,
  },
}))

// ── Test suite ───────────────────────────────────────────────────────────────

describe('UpdatePasswordSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Renderizado inicial ──────────────────────────────────────────────────

  it('renders all password fields and the submit button', () => {
    render(<UpdatePasswordSettings />)

    expect(screen.getByLabelText(/current password/i)).toBeTruthy()
    expect(screen.getByLabelText(/^new password/i)).toBeTruthy()
    expect(screen.getByLabelText(/confirm new password/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /update password/i })).toBeTruthy()
  })

  it('all password fields start with type="password"', () => {
    render(<UpdatePasswordSettings />)

    expect(screen.getByLabelText(/current password/i)).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText(/^new password/i)).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText(/confirm new password/i)).toHaveAttribute('type', 'password')
  })

  // ── Toggle de visibilidad ────────────────────────────────────────────────

  it('toggles visibility for current password independently', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    const toggleButton = screen.getByTestId('toggle-current-password')
    const input = screen.getByLabelText(/current password/i)

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggles visibility for new password independently', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    const toggleButton = screen.getByTestId('toggle-new-password')
    const input = screen.getByLabelText(/^new password/i)

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggles visibility for confirm new password independently', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    const toggleButton = screen.getByTestId('toggle-confirm-password')
    const input = screen.getByLabelText(/confirm new password/i)

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  // ── Validación ───────────────────────────────────────────────────────────

  it('does not call changePassword when submitted empty', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  it('does not call changePassword when new password does not meet requirements', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    await user.type(screen.getByLabelText(/current password/i), 'oldPassword123!')
    await user.type(screen.getByLabelText(/^new password/i), 'weak')
    await user.type(screen.getByLabelText(/confirm new password/i), 'weak')

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  it('does not call changePassword when confirm password does not match', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    await user.type(screen.getByLabelText(/current password/i), 'oldPassword123!')
    await user.type(screen.getByLabelText(/^new password/i), 'StrongNewPass1!')
    await user.type(screen.getByLabelText(/confirm new password/i), 'StrongNewPass1@')

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  // ── Submit exitoso ───────────────────────────────────────────────────────

  it('calls changePassword with correct payload on valid submit', async () => {
    const user = userEvent.setup()
    changePasswordMock.mockResolvedValueOnce({ error: null })

    render(<UpdatePasswordSettings />)

    await user.type(screen.getByLabelText(/current password/i), 'oldPassword123!')
    await user.type(screen.getByLabelText(/^new password/i), 'StrongNewPass1!')
    await user.type(screen.getByLabelText(/confirm new password/i), 'StrongNewPass1!')

    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledWith({
        newPassword: 'StrongNewPass1!',
        currentPassword: 'oldPassword123!',
        revokeOtherSessions: true,
      })
    })
  })

  it('shows success toast and resets form on successful update', async () => {
    const user = userEvent.setup()
    changePasswordMock.mockResolvedValueOnce({ error: null })

    render(<UpdatePasswordSettings />)

    const currentInput = screen.getByLabelText(/current password/i)
    const newPasswordInput = screen.getByLabelText(/^new password/i)
    const confirmInput = screen.getByLabelText(/confirm new password/i)

    await user.type(currentInput, 'oldPassword123!')
    await user.type(newPasswordInput, 'StrongNewPass1!')
    await user.type(confirmInput, 'StrongNewPass1!')

    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('Password updated successfully.')
      expect(currentInput).toHaveValue('')
      expect(newPasswordInput).toHaveValue('')
      expect(confirmInput).toHaveValue('')
    })
  })

  // ── Error en update ──────────────────────────────────────────────────────

  it('shows error toast when changePassword returns an error', async () => {
    const user = userEvent.setup()
    changePasswordMock.mockResolvedValueOnce({
      error: { message: 'Incorrect current password. Please try again.' },
    })

    render(<UpdatePasswordSettings />)

    await user.type(screen.getByLabelText(/current password/i), 'wrongOldPass!')
    await user.type(screen.getByLabelText(/^new password/i), 'StrongNewPass1!')
    await user.type(screen.getByLabelText(/confirm new password/i), 'StrongNewPass1!')

    await user.click(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Incorrect current password. Please try again.')
    })
  })

  // ── Estado loading ───────────────────────────────────────────────────────

  it('disables inputs and button while the request is in flight', async () => {
    const user = userEvent.setup()
    // Promise que nunca resuelve → mantiene isPending=true
    changePasswordMock.mockImplementation(() => new Promise(() => {}))

    render(<UpdatePasswordSettings />)

    const currentInput = screen.getByLabelText(/current password/i)
    const newPasswordInput = screen.getByLabelText(/^new password/i)
    const confirmInput = screen.getByLabelText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /update password/i })

    await user.type(currentInput, 'oldPassword123!')
    await user.type(newPasswordInput, 'StrongNewPass1!')
    await user.type(confirmInput, 'StrongNewPass1!')

    await user.click(submitButton)

    await waitFor(() => {
      expect(currentInput).toBeDisabled()
      expect(newPasswordInput).toBeDisabled()
      expect(confirmInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })
})
