'use server'

import { auth } from '@/lib/auth'
import { deleteBudget } from '@/repository/budget'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export const deleteBudgetAction = async (id: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  try {
    const deleted = await deleteBudget(id, session.user.id)
    if (!deleted) return { success: false, status: 404, message: 'Budget not found' }

    revalidatePath('/budget')

    return { success: true, status: 200, data: deleted, message: 'Budget deleted successfully' }
  } catch (error) {
    console.error('Error deleting budget:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
