import type { DashboardActual } from '@/interfaces/actuals'
import { projectDashboardBudgetRows } from '@/lib/dashboard/budget'
import type { DashboardPeriod } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'
import { InsightCard } from './insight-card'
import { SectionUnavailable } from './section-unavailable'

interface Props {
  actuals: Promise<{ data: DashboardActual[]; success: boolean }>
  plan: Promise<{ data: DashboardPlan | null; success: boolean }>
  period: DashboardPeriod
}

/**
 * Server section that projects the shared plan/actuals into the insight
 * card's category rows. Consumes only page-created promises.
 */
export async function InsightSection({ actuals, plan, period }: Props) {
  const [actualsResult, planResult] = await Promise.all([actuals, plan])
  if (!actualsResult.success || !planResult.success) {
    return <SectionUnavailable />
  }
  const { groups } = projectDashboardBudgetRows(period, planResult.data, actualsResult.data)
  return <InsightCard groups={groups} />
}
