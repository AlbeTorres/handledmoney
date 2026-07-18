import AccountAction from '@/components/AccountAction'
import { AccountGrid } from '@/components/AccountGrid'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
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

  const resolvedSearchParams = await searchParams
  const tab = (resolvedSearchParams.tab as string) || 'default'
  const sort = (resolvedSearchParams.sort as string) || 'default'
  const search = (resolvedSearchParams.search as string) || ''

  return (
    <div className='px-8 py-10 my-5 flex flex-col gap-y-10 container'>
      <AccountAction />
      <AccountGrid userId={session.user.id} tab={tab} sort={sort} search={search} />
    </div>
  )
}
