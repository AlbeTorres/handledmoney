import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResendEmailForm } from '@/components/ResendEmailForm'

const sendVerificationEmailMock = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    sendVerificationEmail: (...args: any[]) => sendVerificationEmailMock(...args),
  },
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('ResendEmailForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders and passes email and correct custom labels to EmailActionForm', () => {
    render(<ResendEmailForm email="test@example.com" />)

    const emailInput = screen.getByPlaceholderText('email_placeholder') as HTMLInputElement
    expect(emailInput.value).toBe('test@example.com')
    expect(screen.getByRole('button', { name: 'send_verification_email' })).toBeInTheDocument()
    expect(screen.getByText('back_to_login')).toBeInTheDocument()
  })

  it('calls authClient.sendVerificationEmail with correct arguments on submission', async () => {
    const user = userEvent.setup()
    sendVerificationEmailMock.mockResolvedValue({ error: null })

    render(<ResendEmailForm email="test@example.com" />)

    await user.click(screen.getByRole('button', { name: 'send_verification_email' }))

    await waitFor(() => {
      expect(sendVerificationEmailMock).toHaveBeenCalledOnce()
      expect(sendVerificationEmailMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        callbackURL: '/auth/new-verification?redirect=false',
      })
    })
  })

  it('returns successMessage and triggerCooldown: true when API call succeeds', async () => {
    const user = userEvent.setup()
    sendVerificationEmailMock.mockResolvedValue({ error: null })

    render(<ResendEmailForm email="test@example.com" />)

    await user.click(screen.getByRole('button', { name: 'send_verification_email' }))

    // We can verify that the button enters cooldown (i.e. is disabled) which shows that triggerCooldown was true
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  it('returns error.too_many_requests and triggerCooldown: true when API returns 429 status', async () => {
    const user = userEvent.setup()
    sendVerificationEmailMock.mockResolvedValue({
      error: {
        status: 429,
        message: 'Too many requests',
      },
    })

    render(<ResendEmailForm email="test@example.com" />)

    await user.click(screen.getByRole('button', { name: 'send_verification_email' }))

    // Since triggerCooldown is true, the cooldown starts and disables the button
    await waitFor(() => {
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  it('returns error.unknown_error and does NOT trigger cooldown for other errors', async () => {
    const user = userEvent.setup()
    sendVerificationEmailMock.mockResolvedValue({
      error: {
        status: 500,
        message: 'Internal server error',
      },
    })

    render(<ResendEmailForm email="test@example.com" />)

    const button = screen.getByRole('button', { name: 'send_verification_email' })
    await user.click(button)

    // For generic error, triggerCooldown is false. Wait until execution finishes:
    // The button will not be disabled once the loading state ends
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })
})
