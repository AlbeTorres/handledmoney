'use server'

import { auth } from '@/lib/auth'
import { DuplicateBudgetSchema } from '@/lib/schema'
import { duplicateBudget } from '@/repository/budget'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export const duplicateBudgetAction = async (values: { id: string; name?: string; startDate: Date }) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { success: false, status: 401, message: 'Unauthorized' }
  const validated = DuplicateBudgetSchema.safeParse(values)
  if (!validated.success) return { success: false, status: 400, message: 'Invalid fields', errors: validated.error.flatten() }
  try {
    const budget = await duplicateBudget(validated.data, session.user.id)
    if (!budget) return { success: false, status: 404, message: 'Budget not found' }
    revalidatePath('/budget')
    return { success: true, status: 201, data: budget, message: 'Budget duplicated successfully' }
  } catch (error) {
    console.error('Error duplicating budget:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
