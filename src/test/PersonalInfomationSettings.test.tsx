import PersonalInfomationSettings from '@/components/PersonalInfomationSettings'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ────────────────────────────────────────────────────────────

const {
  refreshMock,
  updateUserMock,
  changeEmailMock,
  confirmActionMock,
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  updateUserMock: vi.fn(),
  changeEmailMock: vi.fn(),
  confirmActionMock: vi.fn(),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}))

// ── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          phoneNumber: null,
        },
      },
    }),
    updateUser: updateUserMock,
    changeEmail: changeEmailMock,
  },
}))

vi.mock('@/hooks/use-confirm-password', () => ({
  useConfirmAction: () => ({
    confirm: confirmActionMock,
    dialogProps: {
      open: false,
      title: '',
      description: '',
      isPending: false,
      onCancel: vi.fn(),
      onSubmit: vi.fn(),
    },
  }),
  PasswordConfirmDialog: () => null,
}))

// ── Test suite ───────────────────────────────────────────────────────────────

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
}

describe('PersonalInfomationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Renderizado inicial ──────────────────────────────────────────────────

  // Verifica que el componente renderiza correctamente la sección con su título
  // y el botón de editar usando las claves de traducción
  it('renderiza el título de sección y el botón de editar usando claves de traducción', () => {
    render(<PersonalInfomationSettings user={mockUser} />)

    // El mock de useTranslations retorna la key directamente, así que esperamos 'heading'
    expect(screen.getByText('heading')).toBeTruthy()
    expect(screen.getByRole('button', { name: /edit_button/i })).toBeTruthy()
  })

  // Verifica que los campos de nombre y email muestran los valores iniciales del usuario
  it('pre-llena los campos de nombre y email con los datos del usuario', () => {
    render(<PersonalInfomationSettings user={mockUser} />)

    expect(screen.getByDisplayValue('John Doe')).toBeTruthy()
    expect(screen.getByDisplayValue('john@example.com')).toBeTruthy()
  })

  // Verifica que el campo de teléfono está presente y siempre es readOnly y disabled
  // ya que es una funcionalidad futura que no está habilitada
  it('renderiza el campo de teléfono como solo lectura y deshabilitado', () => {
    render(<PersonalInfomationSettings user={mockUser} />)

    const phoneInput = screen.getByLabelText(/phone_label/i)
    expect(phoneInput).toHaveAttribute('readonly')
    expect(phoneInput).toBeDisabled()
  })

  // ── Modo lectura ─────────────────────────────────────────────────────────

  // Los campos de nombre y email deben estar en modo solo lectura antes de editar,
  // para que el usuario no pueda modificar accidentalmente los valores
  it('campos de nombre y email son solo lectura antes de hacer clic en editar', () => {
    render(<PersonalInfomationSettings user={mockUser} />)

    const nameInput = screen.getByLabelText(/full_name_label/i)
    const emailInput = screen.getByLabelText(/email_label/i)

    expect(nameInput).toHaveAttribute('readonly')
    expect(emailInput).toHaveAttribute('readonly')
  })

  // Los botones de guardar y cancelar NO deben estar visibles en modo lectura,
  // solo se muestra el botón de editar
  it('los botones guardar y cancelar no están visibles en modo lectura', () => {
    render(<PersonalInfomationSettings user={mockUser} />)

    expect(screen.queryByRole('button', { name: /save_button/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /cancel_button/i })).toBeNull()
  })

  // ── Modo edición ─────────────────────────────────────────────────────────

  // Al hacer clic en editar, los campos deben habilitarse para que el usuario
  // pueda modificar los valores libremente
  it('habilita los campos de nombre y email después de hacer clic en editar', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const nameInput = screen.getByLabelText(/full_name_label/i)
    const emailInput = screen.getByLabelText(/email_label/i)

    expect(nameInput).not.toHaveAttribute('readonly')
    expect(emailInput).not.toHaveAttribute('readonly')
  })

  // En modo edición se muestran los botones de guardar y cancelar para confirmar o descartar
  it('muestra los botones guardar y cancelar después de hacer clic en editar', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    expect(screen.getByRole('button', { name: /save_button/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /cancel_button/i })).toBeTruthy()
  })

  // El botón de editar se oculta en modo edición para evitar clicks duplicados
  it('oculta el botón de editar mientras está en modo edición', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    expect(screen.queryByRole('button', { name: /^edit_button$/i })).toBeNull()
  })

  // ── Cancel ───────────────────────────────────────────────────────────────

  // Al cancelar, el formulario debe resetearse a los valores originales del usuario
  // para descartar cualquier cambio parcial hecho por el usuario
  it('resetea el formulario a los valores del usuario al hacer clic en cancelar', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const nameInput = screen.getByLabelText(/full_name_label/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Modified Name')

    await user.click(screen.getByRole('button', { name: /cancel_button/i }))

    expect(screen.getByDisplayValue('John Doe')).toBeTruthy()
  })

  // Después de cancelar, el componente vuelve al modo solo lectura automáticamente
  it('vuelve al modo solo lectura después de cancelar', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))
    await user.click(screen.getByRole('button', { name: /cancel_button/i }))

    expect(screen.getByLabelText(/full_name_label/i)).toHaveAttribute('readonly')
    expect(screen.queryByRole('button', { name: /save_button/i })).toBeNull()
  })

  // ── Validación ───────────────────────────────────────────────────────────

  // Si el nombre se deja vacío, el formulario no debe enviar
  // (validación de Zod: min 1 char) y updateUser no debe ser llamado
  it('no llama a updateUser cuando el nombre está vacío', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))
    await user.clear(screen.getByLabelText(/full_name_label/i))
    await user.click(screen.getByRole('button', { name: /save_button/i }))

    expect(updateUserMock).not.toHaveBeenCalled()
  })

  // Si el email tiene formato inválido, el formulario no debe enviar
  // (validación de Zod: email() schema) y updateUser no debe ser llamado
  it('no llama a updateUser cuando el email tiene formato inválido', async () => {
    const user = userEvent.setup()
    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const emailInput = screen.getByLabelText(/email_label/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'not-an-email')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    expect(updateUserMock).not.toHaveBeenCalled()
  })

  // ── Submit — solo nombre cambia ──────────────────────────────────────────

  // Cuando solo cambia el nombre (email igual), se llama a updateUser con el nuevo nombre
  // y NO se activa el flujo de confirmación de password ni changeEmail
  it('llama a updateUser con el nombre actualizado cuando solo cambia el nombre', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const nameInput = screen.getByLabelText(/full_name_label/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({ name: 'Jane Doe' })
    })
  })

  // Al actualizar solo el nombre con éxito, se muestra un toast de éxito
  // con la clave de traducción correspondiente
  it('muestra toast de éxito cuando la actualización del nombre es exitosa', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const nameInput = screen.getByLabelText(/full_name_label/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('toast.profile_updated')
    })
  })

  // Después de una actualización exitosa del nombre, se llama a router.refresh()
  // para recargar los datos del servidor y reflejar los cambios
  it('llama a router.refresh() después de una actualización exitosa', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const nameInput = screen.getByLabelText(/full_name_label/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  // Después de una actualización exitosa del nombre, el componente vuelve
  // al modo solo lectura automáticamente
  it('vuelve al modo solo lectura después de guardar exitosamente', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const nameInput = screen.getByLabelText(/full_name_label/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/full_name_label/i)).toHaveAttribute('readonly')
    })
  })

  // Cuando solo cambia el nombre, el flujo de confirmación NO debe activarse
  // porque no hay cambio de email que requiera verificación de password
  it('no llama a confirm() cuando solo cambia el nombre', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const nameInput = screen.getByLabelText(/full_name_label/i)
    await user.clear(nameInput)
    await user.type(nameInput, 'Jane Doe')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(confirmActionMock).not.toHaveBeenCalled()
    })
  })

  // ── Submit — email cambia ────────────────────────────────────────────────

  // Cuando el email cambia, primero se actualiza el nombre con updateUser,
  // luego se llama a confirm() para verificar la password antes de proceder
  it('llama a confirm() cuando el email cambia', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })
    confirmActionMock.mockResolvedValueOnce(true)
    changeEmailMock.mockResolvedValueOnce({ error: null })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const emailInput = screen.getByLabelText(/email_label/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(confirmActionMock).toHaveBeenCalled()
    })
  })

  // Si la confirmación de password es exitosa, se llama a changeEmail con el
  // nuevo email y la URL de callback para verificación
  it('llama a changeEmail con el nuevo email después de confirmar', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })
    confirmActionMock.mockResolvedValueOnce(true)
    changeEmailMock.mockResolvedValueOnce({ error: null })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const emailInput = screen.getByLabelText(/email_label/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(changeEmailMock).toHaveBeenCalledWith({
        newEmail: 'new@example.com',
        callbackURL: '/settings',
      })
    })
  })

  // Cuando el email cambia y se confirma correctamente, se muestra un toast
  // indicando que se envió un email de verificación (no un toast genérico de éxito)
  it('muestra toast de verificación de email enviada cuando el cambio es exitoso', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })
    confirmActionMock.mockResolvedValueOnce(true)
    changeEmailMock.mockResolvedValueOnce({ error: null })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const emailInput = screen.getByLabelText(/email_label/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('toast.email_verification_sent')
    })
  })

  // Si el usuario cancela la confirmación de password (confirm() retorna null),
  // no se debe llamar a changeEmail y el componente se queda en modo edición
  it('no llama a changeEmail cuando el usuario cancela la confirmación', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })
    confirmActionMock.mockResolvedValueOnce(null)

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const emailInput = screen.getByLabelText(/email_label/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(changeEmailMock).not.toHaveBeenCalled()
    })
  })

  // ── Error en update ──────────────────────────────────────────────────────

  // Cuando updateUser falla, se muestra un toast de error con la clave de traducción
  // para que el usuario sepa que la actualización del perfil falló
  it('muestra toast de error cuando updateUser falla', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'Something went wrong' },
    })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))
    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('toast.profile_update_failed')
    })
  })

  // Cuando updateUser falla, el componente permanece en modo edición
  // para que el usuario pueda corregir los datos e intentar nuevamente
  it('permanece en modo edición cuando updateUser falla', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'Something went wrong' },
    })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))
    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save_button/i })).toBeTruthy()
    })
  })

  // Cuando changeEmail falla después de una confirmación exitosa, se muestra
  // un toast de error específico para el cambio de email
  it('muestra toast de error cuando changeEmail falla', async () => {
    const user = userEvent.setup()
    updateUserMock.mockResolvedValueOnce({ data: { user: {} }, error: null })
    confirmActionMock.mockResolvedValueOnce(true)
    changeEmailMock.mockResolvedValueOnce({
      error: { message: 'Email change failed' },
    })

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))

    const emailInput = screen.getByLabelText(/email_label/i)
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('toast.email_update_failed')
    })
  })

  // ── Estado loading ───────────────────────────────────────────────────────

  // Durante el envío (isPending=true), los botones de guardar y cancelar deben
  // deshabilitarse para evitar envíos duplicados y cancelaciones accidentales
  it('deshabilita los botones guardar y cancelar durante el envío', async () => {
    const user = userEvent.setup()
    // Promise que nunca resuelve → mantiene isPending=true
    updateUserMock.mockImplementation(() => new Promise(() => {}))

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))
    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      // El texto del botón cambia de 'save_button' a 'saving' cuando isPending=true
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancel_button/i })).toBeDisabled()
    })
  })

  // Los campos de nombre y email también se deshabilitan durante el envío
  // para evitar modificaciones mientras se procesa la solicitud
  it('deshabilita los campos de entrada durante el envío', async () => {
    const user = userEvent.setup()
    updateUserMock.mockImplementation(() => new Promise(() => {}))

    render(<PersonalInfomationSettings user={mockUser} />)

    await user.click(screen.getByRole('button', { name: /edit_button/i }))
    await user.click(screen.getByRole('button', { name: /save_button/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/full_name_label/i)).toBeDisabled()
      expect(screen.getByLabelText(/email_label/i)).toBeDisabled()
    })
  })
})
