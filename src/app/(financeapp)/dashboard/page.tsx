import { getDashboardData } from '@/actions/dashboard/get-dashboard'
import { AccountsWidget } from './_components/accounts-widget'
import { ActionDashboard } from './_components/action-dashboard'
import { BudgetTable } from './_components/budget-table'
import { FinanceChartsClient } from './_components/finance-charts-client'
import { InsightCard } from './_components/insight-card'
import { KpiCards } from './_components/kpi-cards'

type SearchParams = Record<string, string | string[] | undefined>

export default async function Dashboard({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { mode, year, month } = await searchParams

  const selectedmode = (mode as 'monthly' | 'annual') ?? 'monthly'
  const selectedyear = year !== undefined ? Number(year) : new Date().getFullYear()
  const selectedmonth = month !== undefined ? Number(month) : new Date().getMonth()

  const result = await getDashboardData({
    mode: selectedmode,
    year: selectedyear,
    month: selectedmonth,
  })

  if (!result.ok) {
    return (
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
  }

  const { data } = result

  return (
    <section className='px-8 py-10 my-5 flex flex-col gap-y-10 container'>
      <ActionDashboard dashboardmode={selectedmode} />
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
    </section>
  )
}
