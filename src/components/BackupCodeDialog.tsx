import { CheckCheck, Copy, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

import toast from 'react-hot-toast'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recoveryCodes: string[]
  copied: boolean
  setCopied: (copied: boolean) => void
}

export default function BackupCodeDialog({
  open,
  onOpenChange,
  recoveryCodes,
  copied,
  setCopied,
}: Props) {
  const t = useTranslations('handledmoney.settings.two_fa')
  const copyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setCopied(true)
    toast.success(t('backup_copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCodes = () => {
    const text = `${t('backup_title')}\n\n${t('backup_description')}\n\n${recoveryCodes.join('\n')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = t('backup_filename')
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{t('backup_title')}</DialogTitle>
          <DialogDescription className='text-destructive font-semibold'>
            {t('backup_description')}
          </DialogDescription>
        </DialogHeader>

        <div className='bg-muted p-4 rounded-lg space-y-2 max-h-60 overflow-y-auto'>
          {recoveryCodes.map((c, i) => (
            <div key={i} className='font-mono text-sm flex items-center'>
              <span className='text-muted-foreground w-6'>{i + 1}.</span> {c}
            </div>
          ))}
        </div>

        <div className='flex gap-2'>
          <Button variant='outline' className='flex-1' onClick={copyCodes}>
            {copied ? <CheckCheck className='mr-2 h-4 w-4' /> : <Copy className='mr-2 h-4 w-4' />}
            {copied ? t('backup_copied_short') : t('backup_copy')}
          </Button>
          <Button variant='outline' className='flex-1' onClick={downloadCodes}>
            <Download className='mr-2 h-4 w-4' /> {t('backup_download')}
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t('backup_close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
