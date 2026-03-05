import { getBankAccountByUserAction } from '@/actions/account/get-account'
import Link from 'next/link'
import { CardContainer } from './CardContainer'

export default async function BulkTransactionPage() {
  const accounts = await getBankAccountByUserAction()

  if (!accounts.success) {
    return (
      <>
        <div>{accounts.message}</div>
        <Link href='/'>Back</Link>
      </>
    )
  }

  return (
    <>
      <CardContainer accounts={accounts.data} />
    </>
  )
}
