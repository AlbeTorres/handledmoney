import PreferencesSettings from '@/components/PreferencesSettings'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

    expect(screen.getByRole('heading', { name: 'heading' })).toBeTruthy()

    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(3)
  })

  // ── Selector de idioma ───────────────────────────────────────────────────

  // Verifica que el select de idioma contiene las opciones English (US) y
  // Español (ES), porque el usuario debe poder elegir entre los dos idiomas
  // soportados por la aplicación.
  it('language select has en/es options', () => {
    render(<PreferencesSettings />)

    // El select de idioma es el primero de los 3 combobox, y las opciones
    // English (US) y Español (ES) son únicas en todo el DOM
    const languageSelect = screen.getAllByRole('combobox')[0]
    expect(languageSelect).toHaveValue('en')
    expect(screen.getByRole('option', { name: 'English (US)' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Español (ES)' })).toBeTruthy()
  })

  // Verifica que al cambiar el valor del select de idioma se invoca changeLocale
  // con el nuevo locale y随后 router.refresh(), porque el componente debe
  // persistir la preferencia en el servidor y recargar la UI con la nueva locale.
  it('changing language calls changeLocale + router.refresh', async () => {
    const user = userEvent.setup()
    changeLocaleMock.mockResolvedValueOnce(undefined)

    render(<PreferencesSettings />)

    const languageSelect = screen.getAllByRole('combobox')[0]
    await user.selectOptions(languageSelect, 'es')

    await waitFor(() => {
      expect(changeLocaleMock).toHaveBeenCalledWith('es')
      expect(refreshMock).toHaveBeenCalled()
    })
  })

  // ── Selector de zona horaria ─────────────────────────────────────────────

  // Verifica que el select de zona horaria renderiza las 4 opciones disponibles
  // (Pacific, Eastern, UTC, CET), porque el usuario necesita ver todas las
  // zonas horarias soportadas para configurar su preferencia regional.
  it('timezone select renders all timezone options', () => {
    render(<PreferencesSettings />)

    expect(screen.getByRole('option', { name: '(GMT-08:00) Pacific Time' })).toBeTruthy()
    expect(screen.getByRole('option', { name: '(GMT-05:00) Eastern Time' })).toBeTruthy()
    expect(screen.getByRole('option', { name: '(GMT+00:00) UTC' })).toBeTruthy()
    expect(screen.getByRole('option', { name: '(GMT+01:00) Central European Time' })).toBeTruthy()
  })

  // ── Selector de moneda ──────────────────────────────────────────────────

  // Verifica que el select de moneda renderiza las 4 opciones disponibles
  // (USD, EUR, GBP, JPY), porque el usuario necesita ver todas las monedas
  // soportadas para que los montos se muestren con el formato correcto.
  it('currency select renders all currency options', () => {
    render(<PreferencesSettings />)

    expect(screen.getByRole('option', { name: '$1,234.56 (USD)' })).toBeTruthy()
    expect(screen.getByRole('option', { name: '1.234,56 € (EUR)' })).toBeTruthy()
    expect(screen.getByRole('option', { name: '£1,234.56 (GBP)' })).toBeTruthy()
    expect(screen.getByRole('option', { name: '¥123,456 (JPY)' })).toBeTruthy()
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
