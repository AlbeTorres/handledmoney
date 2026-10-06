import { projectDashboardKpis } from '@/lib/dashboard/kpis'
import type { DashboardActual } from '@/lib/dashboard/actuals'
import type { DashboardPeriod } from '@/lib/dashboard/period'
import type { DashboardPlan } from '@/lib/dashboard/plan'
import type { SourceResult } from '@/lib/dashboard/source-result'
import { KpiCards } from './kpi-cards'
import { SectionUnavailable } from './section-unavailable'

interface Props {
  actuals: Promise<SourceResult<DashboardActual[]>>
  plan: Promise<SourceResult<DashboardPlan | null>>
  period: DashboardPeriod
}

/**
 * Server section that consumes the page-created actuals/plan promises and
 * projects them into the KPI widget. `Promise.all` only consumes the shared
 * inputs; this section never issues a read of its own.
 */
export async function KpisSection({ actuals, plan, period }: Props) {
  const [actualsResult, planResult] = await Promise.all([actuals, plan])
  if (!actualsResult.ok || !planResult.ok) {
    return <SectionUnavailable />
  }
  return <KpiCards kpis={projectDashboardKpis(period, planResult.data, actualsResult.data)} />
}