import { QRCodeSVG } from 'qrcode.react'

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code with your authenticator app (like Google Authenticator or Authy), then
            enter the 6-digit code below.
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-center py-4'>
          {totpURI && <QRCodeSVG value={totpURI} size={200} />}
        </div>
        <div className='flex flex-col gap-2'>
          <Input
            type='text'
            placeholder='000000'
            maxLength={6}
            value={code}
            onChange={e => onCodeChange(e.target.value)}
            className='text-center text-xl tracking-widest'
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            Verify & Enable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
