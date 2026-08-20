import { projectDashboardBudgetRows } from '@/lib/dashboard/budget'
import type { DashboardActual } from '@/lib/dashboard/actuals'
import type { DashboardPeriod } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'
import type { SourceResult } from '@/lib/dashboard/source-result'
import { InsightCard } from './insight-card'
import { SectionUnavailable } from './section-unavailable'

interface Props {
  actuals: Promise<SourceResult<DashboardActual[]>>
  plan: Promise<SourceResult<DashboardPlan | null>>
  period: DashboardPeriod
}

/**
 * Server section that projects the shared plan/actuals into the insight
 * card's category rows. Consumes only page-created promises.
 */
export async function InsightSection({ actuals, plan, period }: Props) {
  const [actualsResult, planResult] = await Promise.all([actuals, plan])
  if (!actualsResult.ok || !planResult.ok) {
    return <SectionUnavailable />
  }
  const { groups } = projectDashboardBudgetRows(period, planResult.data, actualsResult.data)
  return <InsightCard groups={groups} />
}