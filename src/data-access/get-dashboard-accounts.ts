import { auth } from '@/lib/auth'
import { DashboardRange } from '@/lib/dashboard/period'
import { getDashboardActuals } from '@/repository/actuals-dashboard'
import { headers } from 'next/headers'

export const getDashboardActualsData = async (range: DashboardRange) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user.id

  if (!userId) {
    return {
      success: false,
      message: 'Unauthorized User',
      data: null,
    }
  }

  try {
    const actuals = await getDashboardActuals(userId, range)

    if (!actuals) {
      return {
        success: false,
        message: 'Actuals not found',
        data: [],
      }
    }

    return {
      success: true,
      message: 'Actuals fetched successfully',
      data: actuals,
    }
  } catch (error) {
    console.error('Error getting actuals:', error)
    return {
      success: false,
      message: 'Error getting actuals',
      data: null,
    }
  }
}
