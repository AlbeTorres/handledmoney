import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useConfirmAction } from '@/hooks/use-confirm-password'

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const { toastErrorMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    error: toastErrorMock,
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    twoFactor: { enable: vi.fn() },
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_OPTS = {
  title: 'Confirm Action',
  description: 'Please enter your password to continue',
  onSubmit: vi.fn(),
}

const setup = (overrides = {}) =>
  renderHook(() => useConfirmAction({ ...DEFAULT_OPTS, ...overrides }))

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useConfirmAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Estado inicial ──────────────────────────────────────────────────────────

  // Verificamos que el hook inicia con el diálogo cerrado y que confirm es una función.
  // Esto asegura que el componente consumidor no recibe un estado inesperado al montar.
  it('inicia con el diálogo cerrado y confirm es una función', () => {
    const { result } = setup()

    expect(result.current.dialogProps.open).toBe(false)
    expect(typeof result.current.confirm).toBe('function')
  })

  // Verificamos que los valores pasados como opciones se reflejan correctamente
  // en dialogProps. Esto valida que el contrato de opciones se cumple.
  it('dialogProps refleja el title y description pasados como opciones', () => {
    const { result } = setup({
      title: 'Eliminar cuenta',
      description: 'Esta acción es irreversible',
    })

    expect(result.current.dialogProps.title).toBe('Eliminar cuenta')
    expect(result.current.dialogProps.description).toBe('Esta acción es irreversible')
  })

  // Verificamos que isPending inicia en false antes de cualquier interacción.
  // Esto es crítico porque el componente consumidor depende de este valor
  // para deshabilitar/habilitar botones de UI.
  it('isPending inicia en false', () => {
    const { result } = setup()

    expect(result.current.dialogProps.isPending).toBe(false)
  })

  // ── Abrir diálogo ──────────────────────────────────────────────────────────

  // Después de llamar a confirm(), el diálogo DEBE abrirse porque la promesa
  // interna se crea y setPromise(null) pasa a setPromise({ resolve }).
  // Esto es lo que permite al componente padre mostrar el PasswordConfirmDialog.
  it('abre el diálogo después de llamar a confirm()', () => {
    const { result } = setup()

    act(() => {
      result.current.confirm()
    })

    expect(result.current.dialogProps.open).toBe(true)
  })

  // ── Confirmar con password ─────────────────────────────────────────────────

  // Cuando el usuario ingresa el password y confirma, handleSubmit llama a
  // opts.onSubmit(password), resuelve la promesa con el resultado y cierra
  // el diálogo. Este es el flujo happy path completo.
  it('resolve con el resultado de onSubmit y cierra el diálogo al confirmar', async () => {
    const onSubmitMock = vi.fn().mockResolvedValue({ success: true })
    const { result } = setup({ onSubmit: onSubmitMock })

    // Abrimos el diálogo
    let promiseResult: unknown
    act(() => {
      promiseResult = result.current.confirm()
    })

    // Simulamos la confirmación con password
    await act(async () => {
      await result.current.dialogProps.onSubmit('SecurePass1!')
    })

    // opts.onSubmit debe ser llamado con el password correcto
    expect(onSubmitMock).toHaveBeenCalledTimes(1)
    expect(onSubmitMock).toHaveBeenCalledWith('SecurePass1!')

    // La promesa retornada por confirm() debe resolverse con el resultado
    const resolved = await promiseResult
    expect(resolved).toEqual({ success: true })

    // El diálogo debe cerrarse después de la confirmación exitosa
    expect(result.current.dialogProps.open).toBe(false)
  })

  // Verificamos que el resultado de onSubmit se propaga correctamente a quien
  // llamó a confirm(). Esto es esencial para que el componente padre pueda
  // actuar en base al resultado (por ejemplo, redirigir o mostrar un toast).
  it('propaga el resultado de onSubmit al caller de confirm()', async () => {
    const onSubmitMock = vi.fn().mockResolvedValue('user-123')
    const { result } = setup({ onSubmit: onSubmitMock })

    let promiseResult: unknown
    act(() => {
      promiseResult = result.current.confirm()
    })

    await act(async () => {
      await result.current.dialogProps.onSubmit('mypassword')
    })

    expect(await promiseResult).toBe('user-123')
  })

  // ── Cancelar ───────────────────────────────────────────────────────────────

  // Cuando el usuario cancela, handleCancel resuelve la promesa con null
  // y cierra el diálogo. El componente padre recibe null y sabe que la
  // acción fue cancelada, pudiendo tomar una decisión diferente.
  it('resolve null y cierra el diálogo al cancelar', async () => {
    const { result } = setup()

    let promiseResult: unknown
    act(() => {
      promiseResult = result.current.confirm()
    })

    // Verificamos que el diálogo está abierto antes de cancelar
    expect(result.current.dialogProps.open).toBe(true)

    act(() => {
      result.current.dialogProps.onCancel()
    })

    // La promesa debe resolverse con null (cancelación)
    expect(await promiseResult).toBe(null)

    // El diálogo debe cerrarse
    expect(result.current.dialogProps.open).toBe(false)
  })

  // Verificamos que cancelar no llama a onSubmit. Si el usuario cancela,
  // la operación NO debe ejecutarse — esto protege contra ejecuciones
  // accidentales de acciones destructivas (como eliminar una cuenta).
  it('no llama a onSubmit cuando se cancela', async () => {
    const onSubmitMock = vi.fn()
    const { result } = setup({ onSubmit: onSubmitMock })

    act(() => {
      result.current.confirm()
    })

    act(() => {
      result.current.dialogProps.onCancel()
    })

    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  // ── Estado loading ─────────────────────────────────────────────────────────

  // Durante una operación asíncrona en onSubmit, isPending debe ser true.
  // Esto permite que el componente deshabilite botones y muestre un spinner,
  // evitando envíos duplicados mientras la petición está en vuelo.
  it('isPending es true durante la ejecución de onSubmit asíncrono', async () => {
    let resolveSubmit!: (value: string) => void
    const onSubmitMock = vi.fn().mockImplementation(
      () => new Promise<string>((resolve) => { resolveSubmit = resolve })
    )
    const { result } = setup({ onSubmit: onSubmitMock })

    act(() => {
      result.current.confirm()
    })

    // Iniciamos el submit — ahora isPending debería ser true
    act(() => {
      result.current.dialogProps.onSubmit('mypassword')
    })

    expect(result.current.dialogProps.isPending).toBe(true)

    // Resolvemos el submit
    await act(async () => {
      resolveSubmit('done')
    })

    // Después de resolver, isPending vuelve a false
    expect(result.current.dialogProps.isPending).toBe(false)
  })

  // Verificamos que después de que la operación asíncrona termine (éxito o error),
  // isPending siempre vuelve a false. Esto es crítico para que la UI no quede
  // en un estado de carga perpetua si algo sale mal.
  it('isPending vuelve a false después de que onSubmit termina con error', async () => {
    const onSubmitMock = vi.fn().mockRejectedValue(new Error('Network error'))
    const { result } = setup({ onSubmit: onSubmitMock })

    act(() => {
      result.current.confirm()
    })

    act(() => {
      result.current.dialogProps.onSubmit('mypassword')
    })

    await act(async () => {
      // Esperamos a que el error se procese
    })

    expect(result.current.dialogProps.isPending).toBe(false)
  })

  // ── Manejo de errores ──────────────────────────────────────────────────────

  // Cuando onSubmit lanza un error, se debe mostrar un toast con el mensaje
  // del error para informar al usuario. Esto es la primera línea de defensa
  // para errores inesperados durante operaciones críticas.
  it('muestra toast.error con el mensaje del error cuando onSubmit falla', async () => {
    const onSubmitMock = vi.fn().mockRejectedValue(new Error('Password incorrecta'))
    const { result } = setup({ onSubmit: onSubmitMock })

    act(() => {
      result.current.confirm()
    })

    await act(async () => {
      await result.current.dialogProps.onSubmit('wrongpassword')
    })

    expect(toastErrorMock).toHaveBeenCalledTimes(1)
    expect(toastErrorMock).toHaveBeenCalledWith('Password incorrecta')
  })

  // Cuando onSubmit lanza un error que no es una instancia de Error,
  // se muestra un toast con un mensaje genérico 'Something went wrong'.
  // Esto protege contra errores inesperados que no son Error instances.
  it('muestra toast.error con mensaje genérico cuando el error no es una instancia de Error', async () => {
    const onSubmitMock = vi.fn().mockRejectedValue('unexpected string error')
    const { result } = setup({ onSubmit: onSubmitMock })

    act(() => {
      result.current.confirm()
    })

    await act(async () => {
      await result.current.dialogProps.onSubmit('password')
    })

    expect(toastErrorMock).toHaveBeenCalledWith('Something went wrong')
  })

  // Cuando onSubmit falla, el diálogo DEBE permanecer abierto para que el usuario
  // pueda intentar nuevamente con un password correcto. Cerrar el diálogo ante
  // un error frustraría la experiencia del usuario.
  it('mantiene el diálogo abierto cuando onSubmit falla', async () => {
    const onSubmitMock = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    const { result } = setup({ onSubmit: onSubmitMock })

    act(() => {
      result.current.confirm()
    })

    await act(async () => {
      await result.current.dialogProps.onSubmit('badpassword')
    })

    // El diálogo debe seguir abierto para reintentar
    expect(result.current.dialogProps.open).toBe(true)
  })

  // Verificamos que después de un error, el usuario puede reintentar llamando
  // a confirm() nuevamente. Esto es crucial para UX: si el password fue incorrecto,
  // el usuario debe poder cerrar el diálogo, reabrirlo e intentar con otro password.
  it('permite reintentar después de un error — reabriendo el diálogo con una nueva confirm()', async () => {
    const onSubmitMock = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok')
    const { result } = setup({ onSubmit: onSubmitMock })

    // Primer intento — falla
    act(() => {
      result.current.confirm()
    })

    await act(async () => {
      await result.current.dialogProps.onSubmit('badpassword')
    })

    expect(result.current.dialogProps.open).toBe(true)

    // Cancelamos para cerrar el diálogo
    act(() => {
      result.current.dialogProps.onCancel()
    })

    expect(result.current.dialogProps.open).toBe(false)

    // Segundo intento — tiene éxito
    let promiseResult: unknown
    act(() => {
      promiseResult = result.current.confirm()
    })

    expect(result.current.dialogProps.open).toBe(true)

    await act(async () => {
      await result.current.dialogProps.onSubmit('correctpassword')
    })

    expect(await promiseResult).toBe('ok')
    expect(result.current.dialogProps.open).toBe(false)
  })
})
