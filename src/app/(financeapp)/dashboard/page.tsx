import { RecentTransactions } from '@/components/RecentTransactions'
import { SummaryStats } from '@/components/SummaryStats'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    // redirect('/auth/login')
    return <>no session</>
  }

  return (
    <section className='flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
      <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
        <SummaryStats />

        <RecentTransactions />
      </div>
    </section>
  )
}
