'use client'
import { authClient } from '@/lib/auth-client'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { EmailActionForm } from './EmailActionForm'

export const ResetForm = () => {
  const t = useTranslations('handledmoney.auth')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSubmit = async (emailValue: string) => {
    const { error } = await authClient.requestPasswordReset({
      email: emailValue,
      redirectTo: 'http://localhost:3000/auth/reset-password',
    })

    if (error) {
      return { error: error.message || t('error.unknown_error') }
    }

    return { 
      successMessage: t('password_reset_email_sent'), 
      triggerCooldown: true 
    }
  }

  return (
    <EmailActionForm
      headerLabelKey="forgot_password_title"
      backButtonLabelKey="back_to_login"
      submitButtonLabelKey="send_reset_email"
      cooldownKey="password_reset_cooldown"
      callbackUrl={callbackUrl}
      showFieldLabel
      onSubmit={handleSubmit}
    />
  )
}
