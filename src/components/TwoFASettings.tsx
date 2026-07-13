'use client'
import { PasswordConfirmDialog, useConfirmAction } from '@/hooks/use-confirm-password'
import { authClient } from '@/lib/auth-client'
import { LucideShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import BackupCodeDialog from './BackupCodeDialog'
import QRDialog from './QRDialog'
import { Button } from './ui/button'

export default function TwoFASettings() {
  const { data: session } = authClient.useSession()
  const is2FAEnabled = session?.user?.twoFactorEnabled ?? false

  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false)
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)
  const [totpURI, setTotpURI] = useState('')
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { confirm: confirmEnable, dialogProps: enableDialogProps } = useConfirmAction({
    title: 'Enter Password',
    description: 'Please enter your current password to setup 2FA.',
    onSubmit: password =>
      authClient.twoFactor.enable({ password }).then(r => {
        if (r.error) throw new Error(r.error.message ?? 'Failed to verify password')
        return r.data
      }),
  })

  const { confirm: confirmDisable, dialogProps: disableDialogProps } = useConfirmAction({
    title: 'Enter Password',
    description: 'Please enter your current password to disable 2FA.',
    onSubmit: password =>
      authClient.twoFactor.disable({ password }).then(r => {
        if (r.error) throw new Error(r.error.message ?? 'Failed to disable 2FA')
        return r.data
      }),
  })

  const enable2FA = async () => {
    const result = await confirmEnable() // <--- así se usa
    if (!result) {
      toast.error('Failed to verify password')
      return
    }

    setTotpURI(result.totpURI)
    setRecoveryCodes(result.backupCodes)
    setIsVerifyDialogOpen(true)
  }

  const handleDisableClick = async () => {
    const result = await confirmDisable() // <--- así se usa
    if (!result) {
      toast.error('Failed to verify password')
      return
    }

    toast.success('Two-Factor Authentication disabled successfully')
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
    setCode('')
    setTotpURI('')
    setIsVerifyDialogOpen(false)
    setIsBackupDialogOpen(true)
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

      <div className='flex items-center justify-between px-4 py-2 bg-secondary/5 border border-secondary/20 rounded-lg'>
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
          <Button
            disabled={loading}
            onClick={handleDisableClick}
            className='w-full py-3 bg-destructive text-white rounded-lg font-label-caps hover:bg-destructive/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50'
          >
            Disable 2FA
          </Button>
        ) : (
          <Button
            disabled={loading}
            onClick={enable2FA}
            className='w-full py-3 bg-primary text-white rounded-lg font-label-caps hover:bg-primary-container transition-all flex items-center justify-center gap-2 disabled:opacity-50'
          >
            <span className='material-symbols-outlined text-[18px]'>settings_authenticator</span>
            Enable 2FA
          </Button>
        )}
      </div>

      <PasswordConfirmDialog {...enableDialogProps} />
      <PasswordConfirmDialog {...disableDialogProps} />

      <QRDialog
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        totpURI={totpURI}
        code={code}
        onCodeChange={setCode}
        onSubmit={handleVerifySubmit}
        loading={loading}
      />
      <BackupCodeDialog
        open={isBackupDialogOpen}
        onOpenChange={setIsBackupDialogOpen}
        recoveryCodes={recoveryCodes}
        copied={copied}
        setCopied={setCopied}
      />
    </div>
  )
}
