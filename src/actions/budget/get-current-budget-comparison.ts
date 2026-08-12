'use server'

import { auth } from '@/lib/auth'
import { getCurrentBudgetComparison } from '@/repository/budget'
import { headers } from 'next/headers'

export const getCurrentBudgetComparisonAction = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { success: false, status: 401, data: null, message: 'Unauthorized' }

  try {
    return { success: true, status: 200, data: await getCurrentBudgetComparison(session.user.id) }
  } catch (error) {
    console.error('Error fetching current budget comparison:', error)
    return { success: false, status: 500, data: null, message: 'Something went wrong' }
  }
}
