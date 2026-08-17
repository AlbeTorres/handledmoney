import { getDashboardData } from '@/actions/dashboard/get-dashboard-data'
import { AccountsWidget } from './_components/accounts-widget'
import { BudgetTable } from './_components/budget-table'
import { FinanceChartsClient } from './_components/finance-charts-client'
import { InsightCard } from './_components/insight-card'
import { KpiCards } from './_components/kpi-cards'

export default async function Dashboard() {
  const now = new Date()
  const result = await getDashboardData({
    mode: 'monthly',
    year: now.getUTCFullYear(),
    month: now.getUTCMonth(),
  })

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
