import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EmailActionForm } from '@/components/EmailActionForm'

const { toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    if (key === 'resend_email_cooldown' && values?.time) {
      return `reenviar en ${values.time}`
    }
    return key
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('EmailActionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renders correctly with default values and props', () => {
    render(
      <EmailActionForm
        initialEmail="initial@test.com"
        headerLabelKey="test_header"
        backButtonLabelKey="back_to_login"
        submitButtonLabelKey="submit_label"
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByText('test_header')).toBeInTheDocument()
    expect(screen.getByText('back_to_login')).toBeInTheDocument()
    const emailInput = screen.getByPlaceholderText('email_placeholder') as HTMLInputElement
    expect(emailInput.value).toBe('initial@test.com')
    expect(screen.getByRole('button', { name: 'submit_label' })).toBeInTheDocument()
  })

  it('validates invalid email format and empty input on submission', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()

    render(
      <EmailActionForm
        headerLabelKey="test_header"
        backButtonLabelKey="back_to_login"
        submitButtonLabelKey="submit_label"
        onSubmit={mockOnSubmit}
      />
    )

    const emailInput = screen.getByPlaceholderText('email_placeholder')
    const submitButton = screen.getByRole('button', { name: 'submit_label' })

    // Submit empty email
    await user.click(submitButton)
    expect(mockOnSubmit).not.toHaveBeenCalled()

    // Submit invalid email format
    await user.type(emailInput, 'not-an-email')
    await user.click(submitButton)
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('disables the button and shows the sending label during execution', async () => {
    const user = userEvent.setup()
    let resolveSubmitPromise!: (value: any) => void
    const submitPromise = new Promise((resolve) => {
      resolveSubmitPromise = resolve
    })
    const mockOnSubmit = vi.fn().mockReturnValue(submitPromise)

    render(
      <EmailActionForm
        initialEmail="user@test.com"
        headerLabelKey="test"
        backButtonLabelKey="back"
        submitButtonLabelKey="submit_label"
        onSubmit={mockOnSubmit}
      />
    )

    const button = screen.getByRole('button')
    await user.click(button)

    // Button should show loading text and be disabled
    expect(button).toBeDisabled()
    expect(screen.getByRole('button', { name: 'sending' })).toBeInTheDocument()

    // Resolve promise
    await act(async () => {
      resolveSubmitPromise({ successMessage: 'Success!' })
    })

    // Button should be re-enabled or modified by subsequent state
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
  })

  it('shows success toast when onSubmit resolves with successMessage', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockResolvedValue({ successMessage: 'verification_sent' })

    render(
      <EmailActionForm
        initialEmail="user@test.com"
        headerLabelKey="test"
        backButtonLabelKey="back"
        submitButtonLabelKey="submit_label"
        onSubmit={mockOnSubmit}
      />
    )

    await user.click(screen.getByRole('button', { name: 'submit_label' }))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('verification_sent')
    })
  })

  it('shows error toast when onSubmit resolves with error', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockResolvedValue({ error: 'something_went_wrong' })

    render(
      <EmailActionForm
        initialEmail="user@test.com"
        headerLabelKey="test"
        backButtonLabelKey="back"
        submitButtonLabelKey="submit_label"
        onSubmit={mockOnSubmit}
      />
    )

    await user.click(screen.getByRole('button', { name: 'submit_label' }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('something_went_wrong')
    })
  })

  describe('cooldown handling', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('triggers cooldown timer correctly and disables button with ticking countdown', async () => {
      const user = userEvent.setup({ delay: null })
      const mockOnSubmit = vi.fn().mockResolvedValue({
        successMessage: 'success',
        triggerCooldown: true,
      })

      render(
        <EmailActionForm
          initialEmail="user@test.com"
          headerLabelKey="test"
          backButtonLabelKey="back"
          submitButtonLabelKey="submit_label"
          cooldownKey="test_cooldown"
          onSubmit={mockOnSubmit}
        />
      )

      const button = screen.getByRole('button', { name: 'submit_label' })
      await user.click(button)

      // Cooldown should trigger immediately
      await waitFor(() => {
        expect(button).toBeDisabled()
      })
      expect(screen.getByText('reenviar en 1:00')).toBeInTheDocument()

      // Advance time by 30 seconds
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })
      expect(screen.getByText('reenviar en 0:30')).toBeInTheDocument()

      // Advance remaining 30 seconds
      act(() => {
        vi.advanceTimersByTime(30 * 1000)
      })

      // Button should be active again
      await waitFor(() => {
        expect(button).not.toBeDisabled()
        expect(screen.getByRole('button', { name: 'submit_label' })).toBeInTheDocument()
      })
    })

    it('ignores submit clicks when cooldown is active', async () => {
      const user = userEvent.setup({ delay: null })
      const mockOnSubmit = vi.fn().mockResolvedValue({
        successMessage: 'success',
        triggerCooldown: true,
      })

      render(
        <EmailActionForm
          initialEmail="user@test.com"
          headerLabelKey="test"
          backButtonLabelKey="back"
          submitButtonLabelKey="submit_label"
          cooldownKey="test_cooldown"
          onSubmit={mockOnSubmit}
        />
      )

      const button = screen.getByRole('button', { name: 'submit_label' })
      await user.click(button)

      await waitFor(() => expect(button).toBeDisabled())
      vi.clearAllMocks()

      // Click button again (disabled element click)
      await user.click(button)
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })
})
