'use server'
import { auth } from '@/lib/auth'
import { getBankAccountById, getBankAccountsByUser } from '@/repository/account'
import { headers } from 'next/headers'

export const getBankAccountByIdAction = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user.id

  if (!userId) {
    return {
      success: false,
      status: 401,
      message: 'Unauthorized User',
    }
  }

  try {
    const account = await getBankAccountById(id, userId)

    if (!account) {
      return {
        success: false,
        status: 404,
        message: 'Account not found',
        data: null,
      }
    }

    return {
      success: true,
      status: 200,
      message: 'Account fetched successfully',
      data: account,
    }
  } catch (error) {
    console.error('Error getting account:', error)
    return {
      success: false,
      status: 500,
      message: 'Error getting account',
      data: null,
    }
  }
}

export const getBankAccountByUserAction = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user.id

  if (!userId) {
    return {
      success: false,
      status: 401,
      message: 'Unauthorized User',
      data: [],
    }
  }

  try {
    const accounts = await getBankAccountsByUser(userId)

    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        status: 404,
        message: 'Account not found',
        data: [],
      }
    }

    return {
      success: true,
      status: 200,
      message: 'Account fetched successfully',
      data: accounts,
    }
  } catch (error) {
    console.error('Error getting account:', error)
    return {
      success: false,
      status: 500,
      message: 'Error getting account',
      data: [],
    }
  }
}
