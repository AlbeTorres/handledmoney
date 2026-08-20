import { projectDashboardBudgetRows } from '@/lib/dashboard/budget'
import type { DashboardActual } from '@/lib/dashboard/actuals'
import type { DashboardPeriod } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'
import type { SourceResult } from '@/lib/dashboard/source-result'
import { BudgetTable } from './budget-table'
import { SectionUnavailable } from './section-unavailable'

interface Props {
  actuals: Promise<SourceResult<DashboardActual[]>>
  plan: Promise<SourceResult<DashboardPlan | null>>
  period: DashboardPeriod
}

/**
 * Server section that projects the shared plan/actuals into ordered budget
 * rows for the budget table. Consumes only page-created promises.
 */
export async function BudgetSection({ actuals, plan, period }: Props) {
  const [actualsResult, planResult] = await Promise.all([actuals, plan])
  if (!actualsResult.ok || !planResult.ok) {
    return <SectionUnavailable />
  }
  const { groups } = projectDashboardBudgetRows(period, planResult.data, actualsResult.data)
  return <BudgetTable groups={groups} viewMode={period.mode} />
}