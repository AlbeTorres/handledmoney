import { auth } from '@/lib/auth'
import { getCurrentBudget } from '@/repository/budget'
import { headers } from 'next/headers'
import 'server-only'

export const getCurrentBudgetAction = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id)
    return { success: false, status: 401, data: null, message: 'Unauthorized' }
  try {
    const currentBudget = await getCurrentBudget(session.user.id)
    return { success: true, status: 200, data: currentBudget }
  } catch (error) {
    console.error('Error fetching current budget:', error)
    return { success: false, status: 500, data: null, message: 'Something went wrong' }
  }
}
