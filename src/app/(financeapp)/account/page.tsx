import AccountAction from '@/components/AccountAction'
import { AccountGrid } from '@/components/AccountGrid'
import { auth } from '@/lib/auth'
import { getBankAccountsByUser } from '@/repository/account'
import { Plus } from 'lucide-react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface AccountPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}
export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/auth/login')
  }
  const accounts = (await getBankAccountsByUser(session.user.id)) || []

  const resolvedSearchParams = await searchParams
  const tab = (resolvedSearchParams.tab as string) || 'default'
  const sort = (resolvedSearchParams.sort as string) || 'default'
  const search = (resolvedSearchParams.search as string) || ''

  if (!accounts || accounts.length === 0) {
    return (
      <div className='m-auto flex  flex-col justify-center items-center gap-4'>
        <p>No accounts found</p>
        <Link
          href={'/account/create'}
          className='flex items-center gap-2 bg-primary text-white hover:bg-secondary transition-all duration-300 px-4 py-2.5 rounded-md text-sm  shadow-lg shadow-primary/20 hover:scale-105'
        >
          <Plus className='size-4' />
          New Account
        </Link>
      </div>
    )
  }

  return (
    <div className='px-8 py-10 my-5 flex flex-col gap-y-10 container'>
      <AccountAction />
      <AccountGrid accounts={accounts} tab={tab} sort={sort} search={search} />
    </div>
  )
}
