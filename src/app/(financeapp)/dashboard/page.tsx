import { getDashboardData } from '@/actions/dashboard/get-dashboard-data'
import type { DashboardPeriod } from '@/lib/finance-data'
import { AccountsWidget } from './_components/accounts-widget'
import { BudgetTable } from './_components/budget-table'
import { DashboardPeriodHeader } from './_components/dashboard-period-header'
import { FinanceChartsClient } from './_components/finance-charts-client'
import { InsightCard } from './_components/insight-card'
import { KpiCards } from './_components/kpi-cards'

type SearchParams = Record<string, string | string[] | undefined>

const PERIOD_KEYS = new Set(['mode', 'year', 'month'])

function currentMonthlyPeriod(now: Date): DashboardPeriod {
  return { mode: 'monthly', year: now.getUTCFullYear(), month: now.getUTCMonth() }
}

function isYear(value: string): boolean {
  return /^(?:20(?:0\d|[1-9]\d)|2100)$/.test(value)
}

function isMonth(value: string): boolean {
  return /^(?:[0-9]|1[01])$/.test(value)
}

export function parseDashboardPeriod(raw: SearchParams, now = new Date()): DashboardPeriod {
  if (Object.keys(raw).some(key => !PERIOD_KEYS.has(key))) return currentMonthlyPeriod(now)

  const { mode, year, month } = raw
  if (typeof mode !== 'string' || typeof year !== 'string' || Array.isArray(month)) return currentMonthlyPeriod(now)
  if (!isYear(year)) return currentMonthlyPeriod(now)

  if (mode === 'annual' && month === undefined) return { mode, year: Number(year) }
  if (mode === 'monthly' && typeof month === 'string' && isMonth(month)) {
    return { mode, year: Number(year), month: Number(month) }
  }

  return currentMonthlyPeriod(now)
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const result = await getDashboardData(parseDashboardPeriod(await searchParams))

  if (!result.ok) {
    return (
      <section className='flex flex-1 flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
        <main className='mt-6 flex flex-col gap-4 lg:mt-8'>
          <div role='alert' className='rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground'>
            No se pudieron cargar los datos del panel. Intenta actualizar la página.
          </div>
        </main>
      </section>
    )
  }

  const { data } = result

  return (
    <section className='flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-background-dark/50'>
      <main className='mt-6 flex flex-col gap-4 lg:mt-8'>
        <DashboardPeriodHeader period={data.period} netActual={data.kpis.netActual} />
        <KpiCards kpis={data.kpis} />

        <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
          <div className='flex flex-col gap-4 xl:col-span-8'>
            <FinanceChartsClient
              viewMode={data.period.mode}
              budgetVsActual={data.budgetVsActual}
              monthlyTrend={data.monthlyTrend}
              expenseByGroup={data.expenseByGroup}
              isEmpty={!data.empty.hasBudget && !data.empty.hasTransactions}
            />
            <BudgetTable groups={data.groups} viewMode={data.period.mode} />
          </div>

          <div className='flex flex-col gap-4 xl:col-span-4'>
            <AccountsWidget accounts={data.accounts} aggregateBalance={data.aggregateBalance} />
            <InsightCard groups={data.groups} />
          </div>
        </div>
      </main>
    </section>
  )
}
