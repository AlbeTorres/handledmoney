import type { DashboardActual } from '@/interfaces/actuals'
import { projectDashboardCharts } from '@/lib/dashboard/charts'
import type { DashboardPeriod } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'
import { FinanceChartsClient } from './finance-charts-client'
import { SectionUnavailable } from './section-unavailable'

interface Props {
  actuals: Promise<{ data: DashboardActual[]; success: boolean }>
  plan: Promise<{ data: DashboardPlan | null; success: boolean }>
  period: DashboardPeriod
}

/**
 * Server section that projects the shared plan/actuals into the narrow
 * `DashboardCharts` payload and serializes only that payload to the dynamic
 * client component. No raw rows, promises, or Date objects cross the boundary.
 */
export async function ChartsSection({ actuals, plan, period }: Props) {
  const [actualsResult, planResult] = await Promise.all([actuals, plan])
  if (!actualsResult.success || !planResult.success) {
    return <SectionUnavailable />
  }
  const charts = projectDashboardCharts(period, planResult.data, actualsResult.data)
  return (
    <FinanceChartsClient
      viewMode={period.mode}
      budgetVsActual={charts.budgetVsActual}
      monthlyTrend={charts.monthlyTrend}
      expenseByGroup={charts.expenseByGroup}
      isEmpty={planResult.data == null && actualsResult.data.length === 0}
    />
  )
}
