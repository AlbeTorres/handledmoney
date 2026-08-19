'use server'

import { auth } from '@/lib/auth'
import { type DashboardViewModel, buildDashboardViewModel } from '@/lib/finance-data'
import { DashboardPeriod, DashboardPeriodSchema } from '@/lib/schema'
import { utcRange } from '@/lib/utils'
import { getDashboardRepository } from '@/repository/dashboard'
import { headers } from 'next/headers'

export type DashboardActionResult =
  | { ok: true; data: DashboardViewModel }
  | { ok: false; code: 'UNAUTHENTICATED' | 'INVALID_PERIOD' | 'UNAVAILABLE' }

export async function getDashboardData(input: DashboardPeriod): Promise<DashboardActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id
  if (!userId) return { ok: false, code: 'UNAUTHENTICATED' }

  if (!DashboardPeriodSchema.safeParse(input).success) return { ok: false, code: 'INVALID_PERIOD' }

  const { start, nextStart } = utcRange(input)

  try {
    const snapshot = await getDashboardRepository(userId, input, start, nextStart)

    console.log(snapshot)
    return { ok: true, data: buildDashboardViewModel(snapshot, input, start, nextStart) }
  } catch {
    return { ok: false, code: 'UNAVAILABLE' }
  }
}
