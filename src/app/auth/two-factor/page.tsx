import { CardWrapper } from '@/app/auth/components/CardWrapper'
import { TwoFactorForm } from '@/app/auth/two-factor/components/TwoFactorForm'
import { useTranslations } from 'next-intl'

export default function TwoFactorAuthPage() {
  const t = useTranslations('handledmoney.auth')
  return (
    <CardWrapper
      headerLabel={t('2fa_title')}
      backButtonHref='/auth/login'
      backButtonLabel={t('back_to_login')}
    >
      <TwoFactorForm />
    </CardWrapper>
  )
}

