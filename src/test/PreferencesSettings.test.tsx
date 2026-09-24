import PreferencesSettings from '@/components/PreferencesSettings'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ── Hoisted mocks ────────────────────────────────────────────────────────────

// Se definen los mocks con vi.hoisted() para que estén disponibles antes de
// que Vitest procese los vi.mock() (que se elevan al tope del archivo).
const { refreshMock, changeLocaleMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  changeLocaleMock: vi.fn(),
}))

// ── Module mocks ─────────────────────────────────────────────────────────────

// Mockeamos next-intl para evitar que useTranslations necesite un provider real.
// La función t() retorna la key tal cual, lo que permite assertear contra strings
// predecibles en los tests (por ejemplo: 'heading', 'language_label').
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'es',
}))

// Mockeamos next/navigation para controlar router.refresh y verificar que se llama
// después de cambiar el idioma, porque el componente necesita recargar los datos
// del servidor para aplicar la nueva localización.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}))

// Mockeamos la server action changeLocale para verificar que se invoca con el
// valor correcto del select y no depender de la capa de persistencia real.
vi.mock('@/actions/locale/change-locale', () => ({
  changeLocale: (...args: unknown[]) => changeLocaleMock(...args),
}))

// ── Test suite ───────────────────────────────────────────────────────────────

describe('PreferencesSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Renderizado inicial ──────────────────────────────────────────────────

  // Verifica que se renderiza el heading y los 3 campos select (language, timezone,
  // currency) porque el usuario necesita ver todos los controles de preferencias
  // antes de interactuar. useTranslations retorna la key como texto, así que
  // usamos las keys del mock para las assertaciones.
  it('renders heading and 3 select fields (language, timezone, currency)', () => {
    render(<PreferencesSettings />)

    expect(screen.getByText('heading')).toBeTruthy()

    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(3)
  })

  // ── Selector de idioma ───────────────────────────────────────────────────

  // Verifica que el selector se inicializa desde el locale activo, no desde un
  // valor codificado, y conserva las opciones soportadas.
  // Español (ES), porque el usuario debe poder elegir entre los dos idiomas
  // soportados por la aplicación.
  it('initializes language from the active locale', () => {
    const { container } = render(<PreferencesSettings />)

    const languageSelect = screen.getAllByRole('combobox')[0]
    expect(languageSelect).toHaveTextContent('Español (ES)')
    expect(container.querySelector('select')).toHaveValue('es')
  })

  // Verifica que al cambiar el valor del select de idioma se invoca changeLocale
  // con el nuevo locale y随后 router.refresh(), porque el componente debe
  // persistir la preferencia en el servidor y recargar la UI con la nueva locale.
  it('changing language calls changeLocale + router.refresh', async () => {
    changeLocaleMock.mockResolvedValueOnce(undefined)

    const { container } = render(<PreferencesSettings />)

    fireEvent.change(container.querySelector('select')!, { target: { value: 'en' } })

    await waitFor(() => {
      expect(changeLocaleMock).toHaveBeenCalledWith('en')
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  // ── Selector de zona horaria ─────────────────────────────────────────────

  it('marks timezone and currency controls unavailable until persistence exists', () => {
    render(<PreferencesSettings />)

    const [, timezone, currency] = screen.getAllByRole('combobox')
    expect(timezone).toBeDisabled()
    expect(currency).toBeDisabled()
    expect(screen.getAllByText('unavailable_help')).toHaveLength(2)
  })

  // ── Texto informativo ───────────────────────────────────────────────────

  // Verifica que el texto informativo (info_text) es visible en el DOM,
  // porque el usuario necesita entender que los cambios de idioma se aplican
  // de inmediato y otros ajustes requieren recarga para tener efecto.
  it('info text is visible', () => {
    render(<PreferencesSettings />)

    expect(screen.getByText('info_text')).toBeTruthy()
  })
})
