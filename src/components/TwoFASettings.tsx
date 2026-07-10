'use client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useConfirmAction } from '@/hooks/use-confirm-password2'
import { authClient } from '@/lib/auth-client'
import { LucideShieldCheck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TwoFASettings() {
  const { data: session } = authClient.useSession()
  const is2FAEnabled = session?.user?.twoFactorEnabled ?? false

  const [enableDialog, confirmEnable] = useConfirmAction({
    title: 'Enter Password',
    description: 'Please enter your current password to setup 2FA.',
    onSubmit: password =>
      authClient.twoFactor.enable({ password }).then(r => {
        if (r.error) throw new Error(r.error.message ?? 'Failed to verify password')
        return r.data
      }),
  })

  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [totpURI, setTotpURI] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const enable2FA = async () => {
    const result = await confirmEnable() // <--- así se usa
    if (!result) {
      toast.error('Failed to verify password')
      return
    }

    setTotpURI(result.totpURI)
    setIsVerifyDialogOpen(true)
  }

  const handleVerifySubmit = async () => {
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyTotp({
      code,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Invalid code')
      return
    }

    toast.success('Two-Factor Authentication enabled successfully')
    setIsVerifyDialogOpen(false)
  }

  const handleDisableClick = async () => {
    const passwordForDisable = window.prompt('Please enter your password to disable 2FA:')
    if (!passwordForDisable) return

    setLoading(true)
    const { error } = await authClient.twoFactor.disable({
      password: passwordForDisable,
    })
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to disable 2FA')
      return
    }
    toast.success('Two-Factor Authentication disabled successfully')
    window.location.reload()
  }

  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-5 md:col-span-2'>
      <div className='flex items-center gap-2 mb-base'>
        <LucideShieldCheck size={20} />
        <h3 className='font-bold text-foreground'>Two-Factor Authentication (2FA)</h3>
      </div>
      <p className=''>
        Add an extra layer of security to your account by requiring more than just a password to log
        in.
      </p>

      <div className='flex items-center justify-between px-4 py-3 bg-secondary/5 border border-secondary/20 rounded-lg'>
        <div className='flex items-center gap-2'>
          <span
            className={`w-2.5 h-2.5 rounded-full ${is2FAEnabled ? 'bg-secondary' : 'bg-gray-400'}`}
          ></span>
          <span className='font-body-lg font-bold text-on-surface'>
            {is2FAEnabled ? 'Currently Enabled' : 'Currently Disabled'}
          </span>
        </div>
        {is2FAEnabled && <span className='text-label-caps text-secondary font-bold'>SECURE</span>}
      </div>

      <div className='pt-2'>
        {is2FAEnabled ? (
          <button
            disabled={loading}
            onClick={handleDisableClick}
            className='w-full py-3 bg-destructive text-white rounded-lg font-label-caps hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50'
          >
            Disable 2FA
          </button>
        ) : (
          <button
            disabled={loading}
            onClick={enable2FA}
            className='w-full py-3 bg-primary text-white rounded-lg font-label-caps hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50'
          >
            <span className='material-symbols-outlined text-[18px]'>settings_authenticator</span>
            Enable 2FA
          </button>
        )}
      </div>

      {enableDialog}

      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (like Google Authenticator or Authy),
              then enter the 6-digit code below.
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
              onChange={e => setCode(e.target.value)}
              className='text-center text-xl tracking-widest'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifySubmit} disabled={loading}>
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
