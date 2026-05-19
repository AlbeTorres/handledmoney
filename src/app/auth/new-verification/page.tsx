import { ResendEmailForm } from '@/components/ResendEmailForm'
import { getTranslations } from 'next-intl/server'

interface Props {
  searchParams: Promise<{ error?: string; token?: string; email?: string }>
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
      <p className={showLoginButton ? 'text-gray-500' : undefined}>
        {t(messageKey)}
      </p>

      {showForm && <ResendEmailForm email={params.email} />}

      {showLoginButton && (
        <a
          href='/auth/login'
          className='inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
        >
          {t('verification_page_go_to_login')}
        </a>
      )}
    </>
  )
}
