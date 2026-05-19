import { ResendEmailForm } from '@/components/ResendEmailForm'
import { getTranslations } from 'next-intl/server'

interface Props {
  searchParams: Promise<{ error?: string; token?: string; email?: string }>
}

export default async function NewVerification({ searchParams }: Props) {
  const params = await searchParams

  const isDirectAccess = Object.keys(params).length === 0

  const t = await getTranslations('handledmoney.auth')

  if (isDirectAccess) {
    return (
      <>
        <p className='text-gray-500'>{t('verification_page_description_error')}</p>
        <a
          href='/auth/login'
          className='inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
        >
          {t('verification_page_go_to_login')}
        </a>
      </>
    )
  }

  if (params.email) {
    return (
      <>
        <p>
          Aun no has verificado tu email, revisa tu bandeja de entrada. Si no lo has recibido el
          email, solicítalo nuevamente.
        </p>
        <ResendEmailForm email={params.email} />
      </>
    )
  }
  if (params.error) {
    return (
      <>
        <p>El enlace de verificación es inválido o ya expiró. Intenta solicitar uno nuevo.</p>
        <ResendEmailForm email={params.email} />
      </>
    )
  }

  return (
    <>
      <p className='text-gray-500'>
        {'¡Email verificado correctamente! Ya puedes iniciar sesión.'}
      </p>
      <a
        href='/auth/login'
        className='inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
      >
        {t('verification_page_go_to_login')}
      </a>
    </>
  )
}
