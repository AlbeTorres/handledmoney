import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import {
  dashboardPeriodLabel,
  dashboardRange,
  defaultDashboardPeriod,
  parseDashboardPeriod,
  type DashboardPeriod,
} from '@/lib/dashboard/period'
import { toSourceResult } from '@/lib/dashboard/source-result'
import { getDashboardAccounts } from '@/repository/dashboard/accounts'
import { getDashboardActuals } from '@/repository/dashboard/actuals'
import { getDashboardPlan } from '@/repository/dashboard/budget'
import { AccountsSection } from './components/accounts-section'
import { ActionDashboard } from './components/action-dashboard'
import { BudgetSection } from './components/budget-section'
import { ChartsSection } from './components/charts-section'
import { InsightSection } from './components/insight-section'
import { KpisSection } from './components/kpis-section'

type SearchParams = Record<string, string | string[] | undefined>

const PERIOD_KEYS = ['mode', 'year', 'month'] as const

/**
 * Canonical unavailable page response, preserved verbatim during cutover:
 * unauthenticated callers and invalid periods both see the same non-sensitive,
 * retryable alert before any dashboard data query.
 */
const unavailableResponse = (
  <section className='flex flex-1 flex-col overflow-y-auto bg-background'>
    <div className='mt-6 flex flex-col gap-4 lg:mt-8'>
      <div
        role='alert'
        className='rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground'
      >
        No se pudieron cargar los datos del panel. Intenta actualizar la página.
      </div>
    </div>
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
  const actuals = toSourceResult(getDashboardActuals(userId, range))
  const plan = toSourceResult(getDashboardPlan(userId))
  const accounts = toSourceResult(getDashboardAccounts(userId))

  return (
    <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold tracking-tight'>Panel de control</h1>
        <p className='text-sm text-muted-foreground'>{dashboardPeriodLabel(period)}</p>
      </div>

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
    </div>
  )
}
