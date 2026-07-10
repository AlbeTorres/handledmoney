import { CardWrapper, RegisterForm } from '@/components'
import { useTranslations } from 'next-intl'

export default function RegisterPage() {
  const t = useTranslations('handledmoney.auth')
  return (
    <CardWrapper
      headerLabel={t('signup_title')}
      backButtonHref='/auth/login'
      backButtonLabel={t('signin_link')}
      recoverButtonHref='/auth/reset'
      recoverButtonLabel={t('password_recovery')}
    >
      <RegisterForm />
    </CardWrapper>
  )
}
