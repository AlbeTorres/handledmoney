import { CardWrapper } from '@/app/auth/components/CardWrapper'
import { LoginForm } from '@/app/auth/(auth)/login/components/LoginForm'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('handledmoney.auth')
  return (
    <CardWrapper
      headerLabel={t('signin_title')}
      backButtonHref='/auth/new-account'
      backButtonLabel={t('signup_link')}
      recoverButtonHref='/auth/reset'
      recoverButtonLabel={t('password_recovery')}
    >
      <LoginForm />
    </CardWrapper>
  )
}

