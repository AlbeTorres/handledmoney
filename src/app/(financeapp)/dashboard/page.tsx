import { headers } from 'next/headers'

import { getDashboardActualsData } from '@/data-access/get-dashboard-accounts'
import { getDashboardAccountsData } from '@/data-access/get-dashboard-actuals'
import { getDashboardBudgetData } from '@/data-access/get-dashboard-budget'
import { auth } from '@/lib/auth'
import {
  dashboardRange,
  defaultDashboardPeriod,
  parseDashboardPeriod,
  type DashboardPeriod,
} from '@/lib/dashboard/period'
import { AccountsSection } from './_components/accounts-section'
import { ActionDashboard } from './_components/action-dashboard'
import { BudgetSection } from './_components/budget-section'
import { ChartsSection } from './_components/charts-section'
import { InsightSection } from './_components/insight-section'
import { KpisSection } from './_components/kpis-section'

type SearchParams = Record<string, string | string[] | undefined>

const PERIOD_KEYS = ['mode', 'year', 'month'] as const

/**
 * Canonical unavailable page response, preserved verbatim during cutover:
 * unauthenticated callers and invalid periods both see the same non-sensitive,
 * retryable alert before any dashboard data query.
 */
const unavailableResponse = (
  <section className='flex flex-1 flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
    <main className='mt-6 flex flex-col gap-4 lg:mt-8'>
      <div
        role='alert'
        className='rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground'
      >
        No se pudieron cargar los datos del panel. Intenta actualizar la página.
      </div>
    </main>
  </section>
)

export default async function Dashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = await searchParams

  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id
  if (!userId) return unavailableResponse

  let period: DashboardPeriod
  const hasPeriodParams = PERIOD_KEYS.some(key => raw[key] !== undefined)
  if (!hasPeriodParams) {
    period = defaultDashboardPeriod()
  } else {
    try {
      period = parseDashboardPeriod(raw)
    } catch {
      return unavailableResponse
    }
  }
  const range = dashboardRange(period)

  // Exactly three page-owned source promises, started unawaited and wrapped
  // once each. The same instances feed every section; sections never re-read.
  const actuals = getDashboardActualsData(range)
  const plan = getDashboardBudgetData()
  const accounts = getDashboardAccountsData()

  return (
    <section className='px-8 py-10 my-5 flex flex-col gap-y-10 container'>
      <ActionDashboard dashboardmode={period.mode} />
      <KpisSection actuals={actuals} plan={plan} period={period} />

      <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
        <div className='flex flex-col gap-4 xl:col-span-8'>
          <ChartsSection actuals={actuals} plan={plan} period={period} />
          <BudgetSection actuals={actuals} plan={plan} period={period} />
        </div>

        <div className='flex flex-col gap-4 xl:col-span-4'>
          <AccountsSection accounts={accounts} />
          <InsightSection actuals={actuals} plan={plan} period={period} />
        </div>
      </div>
    </section>
  )
}
