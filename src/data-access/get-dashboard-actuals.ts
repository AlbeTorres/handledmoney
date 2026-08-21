import { auth } from '@/lib/auth'
import { getDashboardAccounts } from '@/repository/accounts-dashboard'
import { headers } from 'next/headers'

export const getDashboardAccountsData = async () => {
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
    const accounts = await getDashboardAccounts(userId)

    if (!accounts) {
      return {
        success: false,
        message: 'Accounts not found',
        data: [],
      }
    }

    return {
      success: true,
      message: 'Accounts fetched successfully',
      data: accounts,
    }
  } catch (error) {
    console.error('Error getting accounts:', error)
    return {
      success: false,
      message: 'Error getting accounts',
      data: null,
    }
  }
}
