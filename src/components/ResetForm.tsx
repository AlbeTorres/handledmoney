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
      redirectTo: new URL('/auth/reset-password', window.location.origin).toString(),
    })

    if (error) {
      return { error: error.message || t('error.unknown_error') }
    }

    return {
      successMessage: t('password_reset_requested'),
      triggerCooldown: true,
    }
  }

  return (
    <EmailActionForm
      headerLabelKey='forgot_password_title'
      backButtonLabelKey='back_to_login'
      submitButtonLabelKey='send_reset_email'
      cooldownKey='password_reset_cooldown'
      callbackUrl={callbackUrl}
      showFieldLabel
      onSubmit={handleSubmit}
    />
  )
}
