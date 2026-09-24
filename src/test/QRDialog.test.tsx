import QRDialog from '@/components/QRDialog'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('qrcode.react', () => ({ QRCodeSVG: () => <svg aria-label='QR code' /> }))

describe('QRDialog', () => {
  it('labels the TOTP input for numeric one-time-code entry', () => {
    render(
      <QRDialog
        code=''
        loading={false}
        onCodeChange={vi.fn()}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        open
        totpURI='otpauth://totp/example'
      />,
    )

    const input = screen.getByRole('textbox', { name: 'totp_label' })
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toHaveAttribute('pattern', '[0-9]{6}')
    expect(input).toHaveAttribute('autocomplete', 'one-time-code')
  })
})
