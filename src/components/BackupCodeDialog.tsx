import { CheckCheck, Copy, Download } from 'lucide-react'

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
  // Función para copiar códigos
  const copyCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setCopied(true)
    toast.success('Codes copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Función para descargar códigos como archivo de texto
  const downloadCodes = () => {
    const text = `Backup Codes for your account\n\nKeep these codes in a safe place. You can only use each code once.\n\n${recoveryCodes.join('\n')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '2fa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Save your Backup Codes</DialogTitle>
          <DialogDescription className='text-destructive font-semibold'>
            If you lose access to your authenticator app, you will need these codes to log in. Save
            them now, you won't see them again!
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
            {copied ? 'Copied!' : 'Copy All'}
          </Button>
          <Button variant='outline' className='flex-1' onClick={downloadCodes}>
            <Download className='mr-2 h-4 w-4' /> Download .txt
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>I have saved my codes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
