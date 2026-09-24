'use client'
import { PasswordConfirmDialog, useConfirmAction } from '@/hooks/use-confirm-password'
import { authClient } from '@/lib/auth-client'
import { LucideShieldCheck, UserCog } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import BackupCodeDialog from './BackupCodeDialog'
import QRDialog from './QRDialog'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function TwoFASettings() {
  const t = useTranslations('handledmoney.settings.two_fa')
  const router = useRouter()
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
    title: t('confirm_enable_title'),
    description: t('confirm_enable_description'),
    submitLabel: t('confirm_submit'),
    onSubmit: password =>
      authClient.twoFactor.enable({ password }).then(r => {
        if (r.error) throw new Error(r.error.message ?? t('toast.verify_failed'))
        return r.data
      }),
  })

  const { confirm: confirmDisable, dialogProps: disableDialogProps } = useConfirmAction({
    title: t('confirm_disable_title'),
    description: t('confirm_disable_description'),
    submitLabel: t('confirm_submit'),
    onSubmit: password =>
      authClient.twoFactor.disable({ password }).then(r => {
        if (r.error) throw new Error(r.error.message ?? t('toast.disable_failed'))
        return r.data
      }),
  })

  const enable2FA = async () => {
    setLoading(true)
    try {
      const result = await confirmEnable()
      if (!result) return
      setTotpURI(result.totpURI)
      setRecoveryCodes(result.backupCodes)
      setIsVerifyDialogOpen(true)
    } catch {
      toast.error(t('toast.verify_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleDisableClick = async () => {
    setLoading(true)
    try {
      const result = await confirmDisable()
      if (!result) return
      toast.success(t('toast.disabled_success'))
      router.refresh()
    } catch {
      toast.error(t('toast.disable_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySubmit = async () => {
    if (!code || code.length !== 6) {
      toast.error(t('toast.invalid_code'))
      return
    }
    setLoading(true)
    try {
      const { error } = await authClient.twoFactor.verifyTotp({ code })
      if (error) {
        toast.error(error.message || t('toast.invalid_code_fallback'))
        return
      }
      toast.success(t('toast.enabled_success'))
      setCode('')
      setTotpURI('')
      setIsVerifyDialogOpen(false)
      setIsBackupDialogOpen(true)
      router.refresh()
    } catch {
      toast.error(t('toast.invalid_code_fallback'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='lg:col-span-2'>
      <CardHeader className='gap-2'>
        <div className='flex items-center gap-2'>
          <LucideShieldCheck size={20} />
          <CardTitle>{t('heading')}</CardTitle>
        </div>
        <p className='text-sm text-muted-foreground'>{t('description')}</p>
      </CardHeader>
      <CardContent className='flex flex-col gap-5'>
        <div className='flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <span
              className={`size-2.5 rounded-full ${is2FAEnabled ? 'bg-primary' : 'bg-muted-foreground'}`}
            ></span>
            <span className='font-medium'>
              {is2FAEnabled ? t('status_enabled') : t('status_disabled')}
            </span>
          </div>
          {is2FAEnabled && (
            <span className='text-xs font-medium text-primary'>{t('secure_badge')}</span>
          )}
        </div>

        <div className='pt-2'>
          {is2FAEnabled ? (
            <Button
              disabled={loading}
              onClick={handleDisableClick}
              className='w-full'
              variant='destructive'
            >
              {t('disable_button')}
            </Button>
          ) : (
            <Button disabled={loading} onClick={enable2FA} className='w-full'>
              <UserCog size={20} />
              {t('enable_button')}
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
      </CardContent>
    </Card>
  )
}
