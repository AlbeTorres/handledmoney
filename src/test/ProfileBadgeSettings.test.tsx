import ProfileBadgeSettings from '@/components/ProfileBadgeSettings'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// ── Module mocks ─────────────────────────────────────────────────────────────

// Mockeamos next-intl para que useTranslations retorne la key directamente.
// Esto permite verificar que se usan las claves correctas sin depender de archivos JSON.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Test data ────────────────────────────────────────────────────────────────

const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  twoFactorEnabled: true,
}

const mockUserNo2FA = {
  id: '2',
  name: 'Jane Smith',
  email: 'jane@example.com',
  twoFactorEnabled: false,
}

describe('ProfileBadgeSettings', () => {
  // ── Renderizado inicial ──────────────────────────────────────────────────

  // Verifica que el componente renderiza correctamente el nombre y email del usuario.
  // Estos son los campos principales que el usuario debe ver al abrir su perfil.
  it('renderiza el nombre y email del usuario', () => {
    render(<ProfileBadgeSettings user={mockUser} />)

    expect(screen.getByText('John Doe')).toBeTruthy()
    expect(screen.getByText('john@example.com')).toBeTruthy()
  })

  // ── Badge 2FA habilitado ─────────────────────────────────────────────────

  // Cuando twoFactorEnabled es true, se debe mostrar el badge con la clave '2fa_enabled'
  // y usar la clase de color primario (verde/éxito) para indicar que la protección está activa.
  it('muestra badge de 2FA habilitado cuando twoFactorEnabled es true', () => {
    render(<ProfileBadgeSettings user={mockUser} />)

    const badge = screen.getByText('2fa_enabled')
    expect(badge).toBeTruthy()
    // Verificamos que el badge usa estilos de color primario (clases bg-primary)
    expect(badge.className).toContain('bg-primary')
  })

  // ── Badge 2FA deshabilitado ──────────────────────────────────────────────

  // Cuando twoFactorEnabled es false, se debe mostrar el badge con la clave '2fa_disabled'
  // y usar la clase de color destructivo (rojo/alerta) para indicar que la protección está apagada.
  it('muestra badge de 2FA deshabilitado cuando twoFactorEnabled es false', () => {
    render(<ProfileBadgeSettings user={mockUserNo2FA} />)

    const badge = screen.getByText('2fa_disabled')
    expect(badge).toBeTruthy()
    // Verificamos que el badge usa estilos de color destructivo (clases bg-destructive)
    expect(badge.className).toContain('bg-destructive')
  })

  // Cuando twoFactorEnabled es null o undefined, también debe mostrar el badge de deshabilitado.
  // Cubre el caso de usuarios que aún no tienen configurado 2FA en absoluto.
  it('muestra badge de 2FA deshabilitado cuando twoFactorEnabled es null', () => {
    const userWithout2FA = { ...mockUserNo2FA, twoFactorEnabled: null }
    render(<ProfileBadgeSettings user={userWithout2FA} />)

    expect(screen.getByText('2fa_disabled')).toBeTruthy()
  })

  it('muestra badge de 2FA deshabilitado cuando twoFactorEnabled es undefined', () => {
    const userUndefined = {
      id: '3',
      name: 'Bob',
      email: 'bob@example.com',
    }
    render(<ProfileBadgeSettings user={userUndefined} />)

    expect(screen.getByText('2fa_disabled')).toBeTruthy()
  })

  // ── Botón de editar ──────────────────────────────────────────────────────

  // Verifica que el botón de editar (ícono LucideEdit2) está presente en el DOM.
  // Aunque no tiene handler onClick aún, debe renderizarse para que el usuario
  // pueda identificar que la funcionalidad de edición existirá.
  it('renderiza el botón de editar', () => {
    render(<ProfileBadgeSettings user={mockUser} />)

    const button = screen.getByRole('button')
    expect(button).toBeTruthy()
  })

  // ── Imagen de avatar ─────────────────────────────────────────────────────

  // Verifica que la imagen de avatar se renderiza con el atributo src correcto
  // apuntando a la URL del servicio de imágenes de Google.
  it('renderiza la imagen de avatar con el src correcto', () => {
    render(<ProfileBadgeSettings user={mockUser} />)

    const img = screen.getByRole('img')
    expect(img).toBeTruthy()
    expect(img).toHaveAttribute(
      'src',
      expect.stringContaining('googleusercontent.com'),
    )
  })

  // Verifica que el atributo data-alt contiene la descripción de la imagen,
  // lo cual es importante para la accesibilidad y SEO del componente.
  it('renderiza la imagen de avatar con la descripción en data-alt', () => {
    render(<ProfileBadgeSettings user={mockUser} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('data-alt')
    expect(img.getAttribute('data-alt')!.length).toBeGreaterThan(0)
  })
})
