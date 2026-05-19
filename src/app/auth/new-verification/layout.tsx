import { getTranslations } from 'next-intl/server'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('handledmoney.auth')

  return (
    <div className='text-center space-y-4  p-16'>
      <h1 className='text-2xl font-bold'>{t('verification_page_title')}</h1>
      {children}
    </div>
  )
}
