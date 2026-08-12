'use server'

import { auth } from '@/lib/auth'
import { selectCurrentBudget } from '@/repository/budget'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export const selectCurrentBudgetAction = async (budgetId: string) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { success: false, status: 401, message: 'Unauthorized' }
  try {
    const currentBudget = await selectCurrentBudget(budgetId, session.user.id)
    if (!currentBudget) return { success: false, status: 404, message: 'Budget not found' }
    revalidatePath('/budget')
    revalidatePath('/')
    return { success: true, status: 200, data: currentBudget, message: 'Current budget updated successfully' }
  } catch (error) {
    console.error('Error selecting current budget:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
