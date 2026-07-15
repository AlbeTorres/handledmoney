import { CardWrapper } from '@/components'
import { TwoFactorForm } from '@/components/TwoFactorForm'
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
