import { getBankAccountByUserAction } from '@/data-access/get-account'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CardContainer } from './CardContainer'

export default async function BulkTransactionPage() {
  const t = await getTranslations('handledmoney.transaction.import')
  const accounts = await getBankAccountByUserAction()

  if (!accounts.success) {
    return (
      <div className='flex flex-col items-start gap-4 p-6'>
        <p className='text-muted-foreground'>{t('accounts_load_error')}</p>
        <Link
          href='/transaction'
          className='rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
        >
          {t('go_back')}
        </Link>
      </div>
    )
  }

  return (
    <>
      <CardContainer accounts={accounts.data} />
    </>
  )
}
