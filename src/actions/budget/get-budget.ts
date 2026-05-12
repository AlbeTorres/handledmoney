'use server'

import { auth } from '@/lib/auth'
import { getBudgetsByUser, getBudgetById, getBudgetWithActuals } from '@/repository/budget'
import { headers } from 'next/headers'

export const getBudgetListAction = async () => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized', data: null }
  }

  try {
    const budgets = await getBudgetsByUser(session.user.id)
    return { success: true, status: 200, data: budgets }
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return { success: false, status: 500, message: 'Something went wrong', data: null }
  }
}

export const getBudgetAction = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized', data: null }
  }

  try {
    const budget = await getBudgetById(id, session.user.id)
    if (!budget) return { success: false, status: 404, message: 'Budget not found', data: null }
    return { success: true, status: 200, data: budget }
  } catch (error) {
    console.error('Error fetching budget:', error)
    return { success: false, status: 500, message: 'Something went wrong', data: null }
  }
}

export const getBudgetWithActualsAction = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized', data: null }
  }

  try {
    const budget = await getBudgetWithActuals(id, session.user.id)
    if (!budget) return { success: false, status: 404, message: 'Budget not found', data: null }
    return { success: true, status: 200, data: budget }
  } catch (error) {
    console.error('Error fetching budget with actuals:', error)
    return { success: false, status: 500, message: 'Something went wrong', data: null }
  }
}
