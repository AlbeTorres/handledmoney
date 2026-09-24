import { ResendEmailForm } from '@/components/ResendEmailForm'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

interface Props {
  searchParams: Promise<{ error?: string; token?: string; email?: string; redirect?: string }>
}

export default async function NewVerification({ searchParams }: Props) {
  const params = await searchParams

  const isDirectAccess = Object.keys(params).length === 0

  const t = await getTranslations('handledmoney.auth')

  let messageKey = ''
  let showForm = false
  let showLoginButton = false

  if (isDirectAccess) {
    messageKey = 'verification_page_description_error'
    showLoginButton = true
  } else if (params.email) {
    messageKey = 'verification_page_not_verified'
    showForm = true
  } else if (params.error) {
    messageKey = 'verification_page_invalid_link'
    showForm = true
  } else {
    messageKey = 'verification_page_success'
    showLoginButton = true
  }

  return (
    <>
      <p className='body-sm text-muted-foreground'>{t(messageKey)}</p>

      {showForm && <ResendEmailForm email={params.email} />}

      {showLoginButton && (
        <Link
          href='/auth/login'
          className='inline-flex rounded-sm bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          {t('verification_page_go_to_login')}
        </Link>
      )}
    </>
  )
}
