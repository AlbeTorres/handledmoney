'use server'

import {
  DashboardPeriodSchema,
  type DashboardViewModel,
  buildDashboardViewModel,
} from '@/lib/finance-data'
import { auth } from '@/lib/auth'
import { getDashboardSnapshot } from '@/repository/dashboard'
import { headers } from 'next/headers'

export type DashboardActionResult =
  | { ok: true; data: DashboardViewModel }
  | { ok: false; code: 'UNAUTHENTICATED' | 'INVALID_PERIOD' | 'UNAVAILABLE' }

export async function getDashboardData(input: unknown): Promise<DashboardActionResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id
  if (!userId) return { ok: false, code: 'UNAUTHENTICATED' }

  const period = DashboardPeriodSchema.safeParse(input)
  if (!period.success) return { ok: false, code: 'INVALID_PERIOD' }

  try {
    const snapshot = await getDashboardSnapshot(userId, period.data)
    return { ok: true, data: buildDashboardViewModel(snapshot, period.data) }
  } catch {
    return { ok: false, code: 'UNAVAILABLE' }
  }
}
