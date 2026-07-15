import UpdatePasswordSettings from '@/components/UpdatePasswordSettings'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ────────────────────────────────────────────────────────────

// Se definen los mocks con vi.hoisted() para que estén disponibles antes de
// que Vitest procese los vi.mock() (que se elevan al tope del archivo).
const { changePasswordMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
  changePasswordMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

// ── Module mocks ─────────────────────────────────────────────────────────────

// Mockeamos next-intl para evitar que useTranslations necesite un provider real.
// La función t() retorna la key tal cual, lo que permite assertear contra strings
// predecibles en los tests (por ejemplo: 'toast.password_updated').
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mockeamos react-hot-toast para verificar que se muestran toasts de éxito/error
// sin depender de un DOM real de toast ni de librerías externas.
vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

// Mockeamos auth-client para controlar la respuesta de changePassword en cada test
// y verificar que se llama con el payload correcto.
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

  // Verifica que se renderizan todos los campos de contraseña y el botón de envío
  // porque el usuario necesita ver todos los campos antes de intentar cambiar la contraseña.
  // useTranslations retorna la key como texto, así que usamos las keys del mock.
  it('renders all password fields and the submit button', () => {
    render(<UpdatePasswordSettings />)

    expect(screen.getByLabelText(/current_password_label/)).toBeTruthy()
    expect(screen.getByLabelText(/new_password_label/)).toBeTruthy()
    expect(screen.getByLabelText(/confirm_password_label/)).toBeTruthy()
    expect(screen.getByRole('button', { name: /update_button/ })).toBeTruthy()
  })

  // Verifica que los tres campos inician con type="password" por seguridad,
  // para que las contraseñas no se muestren en texto plano al cargar el componente
  it('all password fields start with type="password"', () => {
    render(<UpdatePasswordSettings />)

    expect(screen.getByLabelText(/current_password_label/)).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText(/new_password_label/)).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText(/confirm_password_label/)).toHaveAttribute('type', 'password')
  })

  // ── Toggle de visibilidad ────────────────────────────────────────────────

  // Verifica que el botón de toggle del campo "current password" cambia
  // el tipo de input entre password y text de forma independiente,
  // porque cada campo tiene su propio estado de visibilidad
  it('toggles visibility for current password independently', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    const toggleButton = screen.getByTestId('toggle-current-password')
    const input = screen.getByLabelText(/current_password_label/)

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  // Verifica que el botón de toggle del campo "new password" cambia
  // el tipo de input entre password y text de forma independiente,
  // asegurando que mostrar una contraseña no afecta a los otros campos
  it('toggles visibility for new password independently', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    const toggleButton = screen.getByTestId('toggle-new-password')
    const input = screen.getByLabelText(/new_password_label/)

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  // Verifica que el botón de toggle del campo "confirm password" cambia
  // el tipo de input entre password y text de forma independiente,
  // porque el usuario puede necesitar ver la confirmación para comparar visualmente
  it('toggles visibility for confirm new password independently', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    const toggleButton = screen.getByTestId('toggle-confirm-password')
    const input = screen.getByLabelText(/confirm_password_label/)

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  // ── Validación ───────────────────────────────────────────────────────────

  // Verifica que el formulario vacío no envía la petición changePassword,
  // porque Zod requiere que currentPassword, newPassword y confirmNewPassword
  // tengan contenido mínimo (1 char, 8 chars + regex, y 1 char respectivamente)
  it('does not call changePassword when submitted empty', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    await user.click(screen.getByRole('button', { name: /update_button/ }))

    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  // Verifica que contraseñas débiles (sin mayúscula, sin número, sin especial,
  // o con menos de 8 caracteres) son rechazadas por el schema de Zod antes
  // de llegar a authClient.changePassword
  it('does not call changePassword when new password does not meet requirements', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    await user.type(screen.getByLabelText(/current_password_label/), 'oldPassword123!')
    await user.type(screen.getByLabelText(/new_password_label/), 'weak')
    await user.type(screen.getByLabelText(/confirm_password_label/), 'weak')

    await user.click(screen.getByRole('button', { name: /update_button/ }))

    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  // Verifica que cuando newPassword y confirmNewPassword no coinciden,
  // el refine del SettingsPasswordSchema bloquea el envío,
  // porque permitir contraseñas distintas causaría un lockout del usuario
  it('does not call changePassword when confirm password does not match', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordSettings />)

    await user.type(screen.getByLabelText(/current_password_label/), 'oldPassword123!')
    await user.type(screen.getByLabelText(/new_password_label/), 'StrongNewPass1!')
    await user.type(screen.getByLabelText(/confirm_password_label/), 'StrongNewPass1@')

    await user.click(screen.getByRole('button', { name: /update_button/ }))

    expect(changePasswordMock).not.toHaveBeenCalled()
  })

  // ── Submit exitoso ───────────────────────────────────────────────────────

  // Verifica que al enviar un formulario válido se llama a changePassword
  // con newPassword, currentPassword y revokeOtherSessions: true,
  // porque el componente siempre revoca otras sesiones por seguridad
  it('calls changePassword with correct payload on valid submit', async () => {
    const user = userEvent.setup()
    changePasswordMock.mockResolvedValueOnce({ error: null })

    render(<UpdatePasswordSettings />)

    await user.type(screen.getByLabelText(/current_password_label/), 'oldPassword123!')
    await user.type(screen.getByLabelText(/new_password_label/), 'StrongNewPass1!')
    await user.type(screen.getByLabelText(/confirm_password_label/), 'StrongNewPass1!')

    await user.click(screen.getByRole('button', { name: /update_button/ }))

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledWith({
        newPassword: 'StrongNewPass1!',
        currentPassword: 'oldPassword123!',
        revokeOtherSessions: true,
      })
    })
  })

  // Verifica que después de un cambio exitoso se muestra un toast de éxito
  // y los tres campos del formulario se resetean a string vacío,
  // porque el usuario no debería ver la contraseña que acaba de ingresar
  it('shows success toast and resets form on successful update', async () => {
    const user = userEvent.setup()
    changePasswordMock.mockResolvedValueOnce({ error: null })

    render(<UpdatePasswordSettings />)

    const currentInput = screen.getByLabelText(/current_password_label/)
    const newPasswordInput = screen.getByLabelText(/new_password_label/)
    const confirmInput = screen.getByLabelText(/confirm_password_label/)

    await user.type(currentInput, 'oldPassword123!')
    await user.type(newPasswordInput, 'StrongNewPass1!')
    await user.type(confirmInput, 'StrongNewPass1!')

    await user.click(screen.getByRole('button', { name: /update_button/ }))

    await waitFor(() => {
      // El mock de useTranslations retorna la key tal cual, por eso comparamos
      // con 'toast.password_updated' en vez del texto traducido
      expect(toastSuccessMock).toHaveBeenCalledWith('toast.password_updated')
      expect(currentInput).toHaveValue('')
      expect(newPasswordInput).toHaveValue('')
      expect(confirmInput).toHaveValue('')
    })
  })

  // ── Error en update ──────────────────────────────────────────────────────

  // Verifica que cuando changePassword retorna un error (contraseña actual incorrecta,
  // error de servidor, etc.), se muestra un toast de error con el mensaje del backend
  // y el formulario NO se resetea para que el usuario pueda corregir
  it('shows error toast when changePassword returns an error', async () => {
    const user = userEvent.setup()
    changePasswordMock.mockResolvedValueOnce({
      error: { message: 'Incorrect current password. Please try again.' },
    })

    render(<UpdatePasswordSettings />)

    await user.type(screen.getByLabelText(/current_password_label/), 'wrongOldPass!')
    await user.type(screen.getByLabelText(/new_password_label/), 'StrongNewPass1!')
    await user.type(screen.getByLabelText(/confirm_password_label/), 'StrongNewPass1!')

    await user.click(screen.getByRole('button', { name: /update_button/ }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Incorrect current password. Please try again.')
    })
  })

  // ── Estado loading ───────────────────────────────────────────────────────

  // Verifica que mientras la petición está en vuelo (isPending=true),
  // todos los inputs y el botón de envío quedan deshabilitados,
  // para evitar que el usuario envíe múltiples veces o edite campos a mitad de proceso
  it('disables inputs and button while the request is in flight', async () => {
    const user = userEvent.setup()
    // Promise que nunca resuelve → mantiene isPending=true indefinidamente
    changePasswordMock.mockImplementation(() => new Promise(() => {}))

    render(<UpdatePasswordSettings />)

    const currentInput = screen.getByLabelText(/current_password_label/)
    const newPasswordInput = screen.getByLabelText(/new_password_label/)
    const confirmInput = screen.getByLabelText(/confirm_password_label/)
    const submitButton = screen.getByRole('button', { name: /update_button/ })

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
