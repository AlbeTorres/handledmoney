import { CurrentBudgetComparison } from '@/components/CurrentBudgetComparison'
import { RecentTransactions } from '@/components/RecentTransactions'
import { SummaryStats } from '@/components/SummaryStats'
import { auth } from '@/lib/auth'
import { getCurrentBudgetComparison } from '@/repository/budget'
import { headers } from 'next/headers'

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    // redirect('/auth/login')
    return <>no session</>
  }

  const comparison = await getCurrentBudgetComparison(session.user.id)

  return (
    <section className='flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
      <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
        <SummaryStats />

        <CurrentBudgetComparison comparison={comparison} />

        <RecentTransactions />
      </div>
    </section>
  )
}
