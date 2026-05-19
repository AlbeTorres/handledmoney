'use client'
import { authClient } from '@/lib/auth-client'
import { useTranslations } from 'next-intl'
import { EmailActionForm } from './EmailActionForm'

type Props = {
  email: string | undefined
}

export function ResendEmailForm({ email }: Props) {
  const t = useTranslations('handledmoney.auth')

  const handleSubmit = async (emailValue: string) => {
    const { error } = await authClient.sendVerificationEmail({
      email: emailValue,
      callbackURL: '/auth/new-verification?redirect=false',
    })

    if (error) {
      if (error.status === 429) {
        return { error: t('error.too_many_requests'), triggerCooldown: true }
      }
      return { error: t('error.unknown_error') }
    }

    return { successMessage: t('success.email_sent'), triggerCooldown: true }
  }

  return (
    <EmailActionForm
      initialEmail={email}
      headerLabelKey=""
      backButtonLabelKey="back_to_login"
      submitButtonLabelKey="send_verification_email"
      cooldownKey="email_verification_cooldown"
      onSubmit={handleSubmit}
    />
  )
}
