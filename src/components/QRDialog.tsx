import { QRCodeSVG } from 'qrcode.react'
import { useTranslations } from 'next-intl'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'

type Props = {
  totpURI: string
  code: string
  onCodeChange: (code: string) => void
  onSubmit: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  loading: boolean
}

export default function QRDialog({
  open,
  onOpenChange,
  totpURI,
  code,
  onCodeChange,
  onSubmit,
  loading,
}: Props) {
  const t = useTranslations('handledmoney.settings.two_fa')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('qr_title')}</DialogTitle>
          <DialogDescription>{t('qr_description')}</DialogDescription>
        </DialogHeader>
        <div className='flex justify-center py-4'>
          {totpURI && <QRCodeSVG value={totpURI} size={200} />}
        </div>
        <div className='flex flex-col gap-2'>
          <Input
            type='text'
            aria-label={t('totp_label')}
            autoComplete='one-time-code'
            inputMode='numeric'
            maxLength={6}
            pattern='[0-9]{6}'
            placeholder={t('totp_placeholder')}
            value={code}
            onChange={e => onCodeChange(e.target.value)}
            className='text-center text-xl tracking-widest'
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? t('verifying') : t('verify_enable')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
