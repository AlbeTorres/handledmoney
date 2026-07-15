import TwoFASettings from '@/components/TwoFASettings'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ────────────────────────────────────────────────────────────

// Se definen los mocks con vi.hoisted() para que estén disponibles antes de
// que Vitest procese los vi.mock() (que se elevan al tope del archivo).
const {
  confirmEnableMock,
  confirmDisableMock,
  twoFactorEnableMock,
  twoFactorDisableMock,
  twoFactorVerifyMock,
  toastSuccessMock,
  toastErrorMock,
  useSessionMock,
} = vi.hoisted(() => ({
  confirmEnableMock: vi.fn(),
  confirmDisableMock: vi.fn(),
  twoFactorEnableMock: vi.fn(),
  twoFactorDisableMock: vi.fn(),
  twoFactorVerifyMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
  useSessionMock: vi.fn(),
}))

// ── Module mocks ─────────────────────────────────────────────────────────────

// Mockeamos next-intl para evitar que useTranslations necesite un provider real.
// La función t() retorna la key tal cual, lo que permite assertear contra strings
// predecibles en los tests (por ejemplo: 'toast.enabled_success').
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mockeamos react-hot-toast para verificar que se muestran toasts de éxito/error
// sin depender de un DOM real de toast ni de librerías externas.
// Exportamos tanto default como named para soportar ambos estilos de import.
vi.mock('react-hot-toast', () => ({
  default: { success: toastSuccessMock, error: toastErrorMock },
  toast: { success: toastSuccessMock, error: toastErrorMock },
}))

// Mockeamos auth-client para controlar la respuesta de twoFactor.enable/disable/verifyTotp
// y la sesión del usuario (twoFactorEnabled) en cada test.
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: (...args: unknown[]) => useSessionMock(...args),
    twoFactor: {
      enable: twoFactorEnableMock,
      disable: twoFactorDisableMock,
      verifyTotp: twoFactorVerifyMock,
    },
  },
}))

// Mockeamos useConfirmAction para aislar el componente de la lógica de confirmación
// por contraseña. El mock distingue entre enable y disable usando el título
// (que es la key de traducción, por eso incluimos 'enable' en el check).
// PasswordConfirmDialog se renderiza como null porque no necesitamos testearlo aquí.
vi.mock('@/hooks/use-confirm-password', () => ({
  useConfirmAction: (opts: { title: string; description: string; onSubmit: (pw: string) => Promise<unknown> }) => ({
    confirm: opts.title.includes('enable') ? confirmEnableMock : confirmDisableMock,
    dialogProps: {
      open: false,
      title: opts.title,
      description: opts.description,
      isPending: false,
      onCancel: vi.fn(),
      onSubmit: vi.fn(),
    },
  }),
  PasswordConfirmDialog: () => null,
}))

// Mockeamos QRDialog para controlar su comportamiento en tests.
// Incluimos un input real que llama a onCodeChange para poder simular
// la ingresión del código TOTP sin depender de la implementación real.
vi.mock('@/components/QRDialog', () => ({
  default: (props: {
    open: boolean
    onCodeChange: (code: string) => void
    onSubmit: () => void
  }) =>
    props.open ? (
      <div data-testid='qr-dialog'>
        <input
          data-testid='totp-input'
          onChange={(e) => props.onCodeChange(e.target.value)}
        />
        <button onClick={props.onSubmit}>Submit QR</button>
      </div>
    ) : null,
}))

// Mockeamos BackupCodeDialog para verificar que se abre después de un verify exitoso.
vi.mock('@/components/BackupCodeDialog', () => ({
  default: (props: { open: boolean }) =>
    props.open ? <div data-testid='backup-dialog'>Backup Codes</div> : null,
}))

// ── Test suite ───────────────────────────────────────────────────────────────

describe('TwoFASettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Por defecto, el usuario NO tiene 2FA habilitado.
    useSessionMock.mockReturnValue({
      data: { user: { twoFactorEnabled: false } },
    })
  })

  // ── Renderizado inicial ──────────────────────────────────────────────────

  // Verifica que se renderizan el título y la descripción de la sección 2FA,
  // porque el usuario necesita entender qué es esta configuración antes de activarla.
  // useTranslations retorna la key como texto, así que usamos las keys del mock.
  it('renders heading and description', () => {
    render(<TwoFASettings />)

    expect(screen.getByText('heading')).toBeTruthy()
    expect(screen.getByText('description')).toBeTruthy()
  })

  // Verifica que cuando el usuario NO tiene 2FA habilitado, se muestra el badge
  // "deshabilitado" sin el badge "seguro", y se renderiza el botón de habilitar.
  // El usuario necesita ver claramente el estado actual y poder activar 2FA.
  it('shows disabled status badge and enable button when 2FA is disabled', () => {
    render(<TwoFASettings />)

    expect(screen.getByText('status_disabled')).toBeTruthy()
    expect(screen.queryByText('secure_badge')).not.toBeTruthy()
    expect(screen.getByRole('button', { name: /enable_button/ })).toBeTruthy()
  })

  // ── Cuando 2FA está habilitado ──────────────────────────────────────────

  describe('when 2FA is enabled', () => {
    beforeEach(() => {
      // Sobreescribimos el mock de sesión para simular un usuario con 2FA activo.
      // Es necesario usar un describe separado porque el mock de sesión se configura
      // en beforeEach del padre y lo sobreescribimos aquí.
      useSessionMock.mockReturnValue({
        data: { user: { twoFactorEnabled: true } },
      })
    })

    // Verifica que cuando el usuario YA tiene 2FA habilitado, se muestra el badge
    // "habilitado" con el badge "seguro", y se renderiza el botón de deshabilitar.
    // El usuario necesita poder desactivar 2FA si lo desea.
    it('shows enabled status badge and disable button', () => {
      render(<TwoFASettings />)

      expect(screen.getByText('status_enabled')).toBeTruthy()
      expect(screen.getByText('secure_badge')).toBeTruthy()
      expect(screen.getByRole('button', { name: /disable_button/ })).toBeTruthy()
    })

    // Verifica el flujo de deshabilitación: al hacer click en el botón de deshabilitar
    // se llama a confirmDisable, y si el usuario confirma (el mock resuelve con datos),
    // se muestra un toast de éxito. El usuario necesita feedback de que la operación
    // se completó correctamente.
    it('disable flow: clicking disable calls confirmDisable and shows success toast', async () => {
      const user = userEvent.setup()
      confirmDisableMock.mockResolvedValueOnce({ success: true })

      render(<TwoFASettings />)
      await user.click(screen.getByRole('button', { name: /disable_button/ }))

      await waitFor(() => {
        expect(confirmDisableMock).toHaveBeenCalled()
        expect(toastSuccessMock).toHaveBeenCalledWith('toast.disabled_success')
      })
    })
  })

  // ── Flujo de habilitación ───────────────────────────────────────────────

  // Verifica el flujo completo de habilitación: al hacer click en el botón de habilitar
  // se llama a confirmEnable, y si el usuario confirma (el mock resuelve con totpURI
  // y backupCodes), se abre el QRDialog para que el usuario escanee el código QR.
  // Este es el primer paso del flujo de habilitación de 2FA.
  it('enable flow: clicking enable calls confirmEnable and opens QR dialog on success', async () => {
    const user = userEvent.setup()
    confirmEnableMock.mockResolvedValueOnce({
      totpURI: 'otpauth://totp/test',
      backupCodes: ['ABC123', 'DEF456'],
    })

    render(<TwoFASettings />)
    await user.click(screen.getByRole('button', { name: /enable_button/ }))

    await waitFor(() => {
      expect(confirmEnableMock).toHaveBeenCalled()
      expect(screen.getByTestId('qr-dialog')).toBeTruthy()
    })
  })

  // ── Flujo de verificación ───────────────────────────────────────────────

  // Verifica el flujo de verificación TOTP: después de abrir el QR dialog,
  // el usuario ingresa un código de 6 dígitos y lo envía. Si la verificación
  // es exitosa, se abre el BackupCodeDialog para que el usuario guarde sus
  // códigos de recuperación. Este es el paso crítico de la habilitación.
  it('verify flow: entering 6-digit code and submitting opens backup dialog', async () => {
    const user = userEvent.setup()
    confirmEnableMock.mockResolvedValueOnce({
      totpURI: 'otpauth://totp/test',
      backupCodes: ['ABC123', 'DEF456'],
    })
    twoFactorVerifyMock.mockResolvedValueOnce({ error: null })

    render(<TwoFASettings />)

    // Abrir QR dialog
    await user.click(screen.getByRole('button', { name: /enable_button/ }))
    await waitFor(() => {
      expect(screen.getByTestId('qr-dialog')).toBeTruthy()
    })

    // Ingresar código de 6 dígitos
    await user.type(screen.getByTestId('totp-input'), '123456')

    // Enviar código
    await user.click(screen.getByText('Submit QR'))

    await waitFor(() => {
      expect(twoFactorVerifyMock).toHaveBeenCalledWith({ code: '123456' })
      expect(screen.getByTestId('backup-dialog')).toBeTruthy()
    })
  })

  // Verifica que si el usuario ingresa un código con menos de 6 dígitos,
  // se muestra un toast de error y NO se llama a verifyTotp.
  // El componente valida la longitud del código antes de enviarlo al backend.
  it('verify with short code shows error toast', async () => {
    const user = userEvent.setup()
    confirmEnableMock.mockResolvedValueOnce({
      totpURI: 'otpauth://totp/test',
      backupCodes: ['ABC123', 'DEF456'],
    })

    render(<TwoFASettings />)

    // Abrir QR dialog
    await user.click(screen.getByRole('button', { name: /enable_button/ }))
    await waitFor(() => {
      expect(screen.getByTestId('qr-dialog')).toBeTruthy()
    })

    // Ingresar código corto (menos de 6 dígitos)
    await user.type(screen.getByTestId('totp-input'), '123')

    // Enviar código
    await user.click(screen.getByText('Submit QR'))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('toast.invalid_code')
      expect(twoFactorVerifyMock).not.toHaveBeenCalled()
    })
  })

  // ── Estado loading ───────────────────────────────────────────────────────

  // Verifica que mientras verifyTotp está en vuelo (Promise que nunca resuelve),
  // el botón de habilitar queda deshabilitado para evitar que el usuario envíe
  // múltiples veces o interactúe con la UI durante el proceso.
  it('loading state disables button while verifyTotp is in flight', async () => {
    const user = userEvent.setup()
    confirmEnableMock.mockResolvedValueOnce({
      totpURI: 'otpauth://totp/test',
      backupCodes: ['ABC123', 'DEF456'],
    })
    // Promise que nunca resuelve → mantiene loading=true indefinidamente
    twoFactorVerifyMock.mockImplementation(() => new Promise(() => {}))

    render(<TwoFASettings />)

    // Abrir QR dialog
    await user.click(screen.getByRole('button', { name: /enable_button/ }))
    await waitFor(() => {
      expect(screen.getByTestId('qr-dialog')).toBeTruthy()
    })

    // Ingresar código de 6 dígitos y enviar
    await user.type(screen.getByTestId('totp-input'), '123456')
    await user.click(screen.getByText('Submit QR'))

    // El botón de enable debe estar deshabilitado durante loading
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enable_button/ })).toBeDisabled()
    })
  })
})
