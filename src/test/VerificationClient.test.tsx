import { VerificationClient } from '@/components/VerificationClient'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => ({
  mockGet: vi.fn<(key: string) => string | null>(),
  mockPush: vi.fn<(path: string) => void>(),
  mockVerifyEmail: vi.fn(),
  mockSendVerificationEmail: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: hoisted.mockGet }),
  useRouter: () => ({ push: hoisted.mockPush }),
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    verifyEmail: hoisted.mockVerifyEmail,
    sendVerificationEmail: hoisted.mockSendVerificationEmail,
  },
}))

const { mockGet, mockVerifyEmail, mockSendVerificationEmail } = hoisted

afterEach(() => vi.clearAllMocks())

// ─── URL param helpers ─────────────────────────────────────────────────────────

const withNoParams = () => mockGet.mockReturnValue(null)

const withEmail = (email = 'user@test.com') =>
  mockGet.mockImplementation(key => (key === 'email' ? email : null))

const withToken = (token = 'abcd1234') =>
  mockGet.mockImplementation(key => (key === 'token' ? token : null))

// ─── Scenario 1: no URL params ────────────────────────────────────────────────

describe('no URL params', () => {
  it('shows neutral message when neither token nor email is present', () => {
    withNoParams()
    render(<VerificationClient />)

    expect(
      screen.getByText(/esta página es solo accesible desde un enlace de verificación/i),
    ).toBeInTheDocument()
  })

  it('does not call verifyEmail on mount', () => {
    withNoParams()
    render(<VerificationClient />)

    expect(mockVerifyEmail).not.toHaveBeenCalled()
  })

  it('does not call sendVerificationEmail on mount', () => {
    withNoParams()
    render(<VerificationClient />)

    expect(mockSendVerificationEmail).not.toHaveBeenCalled()
  })

  it('does not render the resend button', () => {
    withNoParams()
    render(<VerificationClient />)

    expect(screen.queryByRole('button', { name: /reenviar correo/i })).not.toBeInTheDocument()
  })
})

// ─── Scenario 2: email param only (redirect from login) ──────────────────────

describe('email param in URL (redirect from login)', () => {
  it('shows the pending verification message', () => {
    withEmail()
    render(<VerificationClient />)

    expect(screen.getByText(/verificá tu correo/i)).toBeInTheDocument()
  })

  it('renders the "Reenviar correo" button', () => {
    withEmail()
    render(<VerificationClient />)

    expect(screen.getByRole('button', { name: /reenviar correo/i })).toBeInTheDocument()
  })

  it('does not call verifyEmail automatically (no token)', () => {
    withEmail()
    render(<VerificationClient />)

    expect(mockVerifyEmail).not.toHaveBeenCalled()
  })

  describe('when clicking "Reenviar correo"', () => {
    it('disables the button and shows loading state during the call', async () => {
      const user = userEvent.setup()
      withEmail()
      mockSendVerificationEmail.mockImplementation(() => new Promise(() => {}))

      render(<VerificationClient />)
      const button = screen.getByRole('button', { name: /reenviar correo/i })

      await user.click(button)

      expect(button).toBeDisabled()
      expect(screen.getByText(/enviando/i)).toBeInTheDocument()
    })

    it('calls sendVerificationEmail with the email from the URL', async () => {
      const user = userEvent.setup()
      withEmail('user@test.com')
      mockSendVerificationEmail.mockResolvedValue({ data: { status: true } })

      render(<VerificationClient />)
      await user.click(screen.getByRole('button', { name: /reenviar correo/i }))

      expect(mockSendVerificationEmail).toHaveBeenCalledOnce()
      expect(mockSendVerificationEmail).toHaveBeenCalledWith({
        email: 'user@test.com',
        callbackURL: '/auth/new-verification?redirect=false',
      })
    })

    it('shows success message after a successful resend', async () => {
      const user = userEvent.setup()
      withEmail()
      mockSendVerificationEmail.mockResolvedValue({ data: { status: true } })

      render(<VerificationClient />)
      await user.click(screen.getByRole('button', { name: /reenviar correo/i }))

      await waitFor(() => {
        expect(screen.getByText(/correo reenviado/i)).toBeInTheDocument()
      })
    })

    it('starts cooldown after a successful resend (button stays disabled)', async () => {
      const user = userEvent.setup()
      withEmail()
      mockSendVerificationEmail.mockResolvedValue({ data: { status: true } })

      render(<VerificationClient />)
      const button = screen.getByRole('button', { name: /reenviar correo/i })
      await user.click(button)

      // Cooldown activates — button is disabled and shows countdown
      await waitFor(() => expect(button).toBeDisabled())
      await waitFor(() => expect(screen.getByText(/reenviar en/i)).toBeInTheDocument())
    })
  })
})

// ─── Scenario 3: valid token (happy path) ─────────────────────────────────────

describe('valid token in URL', () => {
  it('shows loading state while verifying', () => {
    withToken()
    mockVerifyEmail.mockImplementation(() => new Promise(() => {}))

    render(<VerificationClient />)

    expect(screen.getByText(/verificando/i)).toBeInTheDocument()
  })

  it('calls verifyEmail automatically on mount with the token from the URL', async () => {
    withToken('abcd1234')
    mockVerifyEmail.mockResolvedValue({ data: { status: true } })

    render(<VerificationClient />)

    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledOnce()
      // The component calls: authClient.verifyEmail({ query: { token } })
      expect(mockVerifyEmail).toHaveBeenCalledWith({ query: { token: 'abcd1234' } })
    })
  })

  it('shows success message after successful verification', async () => {
    withToken()
    mockVerifyEmail.mockResolvedValue({ data: { status: true } })

    render(<VerificationClient />)

    await waitFor(() => {
      expect(screen.getByText(/email verificado correctamente/i)).toBeInTheDocument()
    })
  })

  it('renders an "Ir al inicio de sesión" link pointing to /auth/login', async () => {
    withToken()
    mockVerifyEmail.mockResolvedValue({ data: { status: true } })

    render(<VerificationClient />)

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /ir al inicio de sesión/i })).toHaveAttribute(
        'href',
        '/auth/login',
      )
    })
  })
})

// ─── Scenario 4: invalid or expired token ─────────────────────────────────────

describe('invalid or expired token in URL', () => {
  it('shows error message when the token is invalid', async () => {
    withToken('expired_token')
    mockVerifyEmail.mockResolvedValue({
      error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
    })

    render(<VerificationClient />)

    await waitFor(() => {
      expect(screen.getByText(/el enlace expiró o no es válido/i)).toBeInTheDocument()
    })
  })

  it('renders an email input and "Pedir nuevo enlace" button after the error', async () => {
    withToken('expired_token')
    mockVerifyEmail.mockResolvedValue({
      error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
    })

    render(<VerificationClient />)

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /pedir nuevo enlace/i })).toBeInTheDocument()
    })
  })

  describe('email input validation', () => {
    it('shows validation error for an invalid email format', async () => {
      const user = userEvent.setup()
      withToken('expired_token')
      mockVerifyEmail.mockResolvedValue({
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      })

      render(<VerificationClient />)

      await waitFor(() => screen.getByRole('textbox', { name: /email/i }))

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email')
      await user.click(screen.getByRole('button', { name: /pedir nuevo enlace/i }))

      expect(screen.getByText(/ingresá un email válido/i)).toBeInTheDocument()
    })

    it('does not call sendVerificationEmail when email format is invalid', async () => {
      const user = userEvent.setup()
      withToken('expired_token')
      mockVerifyEmail.mockResolvedValue({
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      })

      render(<VerificationClient />)

      await waitFor(() => screen.getByRole('textbox', { name: /email/i }))

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'not-an-email')
      await user.click(screen.getByRole('button', { name: /pedir nuevo enlace/i }))

      expect(mockSendVerificationEmail).not.toHaveBeenCalled()
    })

    it('does not call sendVerificationEmail when the email input is empty', async () => {
      const user = userEvent.setup()
      withToken('expired_token')
      mockVerifyEmail.mockResolvedValue({
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      })

      render(<VerificationClient />)

      await waitFor(() => screen.getByRole('button', { name: /pedir nuevo enlace/i }))
      await user.click(screen.getByRole('button', { name: /pedir nuevo enlace/i }))

      expect(mockSendVerificationEmail).not.toHaveBeenCalled()
    })
  })

  describe('requesting a new link with a valid email', () => {
    it('disables the button and shows loading state during the call', async () => {
      const user = userEvent.setup()
      withToken('expired_token')
      mockVerifyEmail.mockResolvedValue({
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      })
      mockSendVerificationEmail.mockImplementation(() => new Promise(() => {}))

      render(<VerificationClient />)

      await waitFor(() => screen.getByRole('textbox', { name: /email/i }))

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'new@test.com')
      const button = screen.getByRole('button', { name: /pedir nuevo enlace/i })
      await user.click(button)

      expect(button).toBeDisabled()
      expect(screen.getByText(/enviando/i)).toBeInTheDocument()
    })

    it('calls sendVerificationEmail with the manually entered email', async () => {
      const user = userEvent.setup()
      withToken('expired_token')
      mockVerifyEmail.mockResolvedValue({
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      })
      mockSendVerificationEmail.mockResolvedValue({ data: { status: true } })

      render(<VerificationClient />)

      await waitFor(() => screen.getByRole('textbox', { name: /email/i }))

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'new@test.com')
      await user.click(screen.getByRole('button', { name: /pedir nuevo enlace/i }))

      expect(mockSendVerificationEmail).toHaveBeenCalledOnce()
      expect(mockSendVerificationEmail).toHaveBeenCalledWith({
        email: 'new@test.com',
        callbackURL: '/auth/new-verification?redirect=false',
      })
    })

    it('shows a confirmation message after successfully sending a new link', async () => {
      const user = userEvent.setup()
      withToken('expired_token')
      mockVerifyEmail.mockResolvedValue({
        error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' },
      })
      mockSendVerificationEmail.mockResolvedValue({ data: { status: true } })

      render(<VerificationClient />)

      await waitFor(() => screen.getByRole('textbox', { name: /email/i }))

      await user.type(screen.getByRole('textbox', { name: /email/i }), 'new@test.com')
      await user.click(screen.getByRole('button', { name: /pedir nuevo enlace/i }))

      await waitFor(() => {
        expect(screen.getByText(/correo reenviado/i)).toBeInTheDocument()
      })
    })
  })
})

// ─── Scenario 5: network error / generic server failure ───────────────────────

describe('network error or generic server failure', () => {
  it('shows a generic error message when sendVerificationEmail fails due to network', async () => {
    const user = userEvent.setup()
    withEmail()
    mockSendVerificationEmail.mockRejectedValue(new Error('Network Error'))

    render(<VerificationClient />)
    await user.click(screen.getByRole('button', { name: /reenviar correo/i }))

    await waitFor(() => {
      expect(screen.getByText(/algo salió mal, intentá de nuevo/i)).toBeInTheDocument()
    })
  })

  it('re-enables the button after a network error to allow retry', async () => {
    const user = userEvent.setup()
    withEmail()
    mockSendVerificationEmail.mockRejectedValue(new Error('Network Error'))

    render(<VerificationClient />)
    const button = screen.getByRole('button', { name: /reenviar correo/i })
    await user.click(button)

    await waitFor(() => expect(button).not.toBeDisabled())
  })

  it('shows a generic error message when verifyEmail fails with a 500 error', async () => {
    withToken('some_token')
    mockVerifyEmail.mockRejectedValue(new Error('Internal Server Error'))

    render(<VerificationClient />)

    await waitFor(() => {
      expect(screen.getByText(/algo salió mal, intentá de nuevo/i)).toBeInTheDocument()
    })
  })
})

// ─── Scenario 6: server-side rate limiting (TOO_MANY_REQUESTS) ────────────────

describe('server-side rate limiting (TOO_MANY_REQUESTS)', () => {
  it('shows a wait message when the server rejects due to rate limit', async () => {
    const user = userEvent.setup()
    withEmail()
    mockSendVerificationEmail.mockResolvedValue({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests' },
    })

    render(<VerificationClient />)
    await user.click(screen.getByRole('button', { name: /reenviar correo/i }))

    await waitFor(() => {
      expect(screen.getByText(/por favor, esperá 5 minutos/i)).toBeInTheDocument()
    })
  })

  it('keeps the button disabled after receiving TOO_MANY_REQUESTS', async () => {
    const user = userEvent.setup()
    withEmail()
    mockSendVerificationEmail.mockResolvedValue({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests' },
    })

    render(<VerificationClient />)
    const button = screen.getByRole('button', { name: /reenviar correo/i })
    await user.click(button)

    await waitFor(() => expect(button).toBeDisabled())
  })
})

// ─── Scenario 7: client-side cooldown after successful send ───────────────────

describe('client-side cooldown after successful send', () => {
  beforeEach(() => {
    withEmail()
    mockSendVerificationEmail.mockResolvedValue({ data: { status: true } })
    // shouldAdvanceTime: true lets waitFor's internal polling keep ticking
    // while still intercepting setInterval for the countdown timer
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('disables the button immediately after a successful send', async () => {
    const user = userEvent.setup()

    render(<VerificationClient />)
    const button = screen.getByRole('button', { name: /reenviar correo/i })

    await user.click(button)

    await waitFor(() => expect(button).toBeDisabled())
  })

  it('shows the remaining cooldown time in the button label', async () => {
    const user = userEvent.setup()

    render(<VerificationClient />)
    await user.click(screen.getByRole('button', { name: /reenviar correo/i }))

    await waitFor(() => expect(screen.getByText(/reenviar en 5:00/i)).toBeInTheDocument())
  })

  it('re-enables the button once the cooldown expires', async () => {
    const user = userEvent.setup()

    render(<VerificationClient />)
    const button = screen.getByRole('button', { name: /reenviar correo/i })

    await user.click(button)
    await waitFor(() => expect(button).toBeDisabled())

    // Skip 5 minutes — fires all pending setInterval ticks at once
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000)
    })

    await waitFor(() => expect(button).not.toBeDisabled())
  })

  it('does not call sendVerificationEmail when the user clicks during cooldown', async () => {
    const user = userEvent.setup()

    render(<VerificationClient />)
    const button = screen.getByRole('button', { name: /reenviar correo/i })

    await user.click(button) // first click — succeeds
    await waitFor(() => expect(button).toBeDisabled()) // confirm cooldown is active
    vi.clearAllMocks() // reset call counter

    await user.click(button) // second click — button is disabled, handler guards it

    expect(mockSendVerificationEmail).not.toHaveBeenCalled()
  })
})

