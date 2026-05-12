'use server'

import { auth } from '@/lib/auth'
import { UpdateBudgetSchema } from '@/lib/schema'
import { updateBudget } from '@/repository/budget'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import type z from 'zod'

type UpdateBudgetValues = z.infer<typeof UpdateBudgetSchema>

export const updateBudgetAction = async (values: UpdateBudgetValues) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const validated = UpdateBudgetSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, status: 400, message: 'Invalid fields', errors: validated.error.flatten() }
  }

  try {
    const budget = await updateBudget(validated.data, session.user.id)
    if (!budget) return { success: false, status: 404, message: 'Budget not found' }

    revalidatePath('/budget')
    revalidatePath(`/budget/${validated.data.id}`)

    return { success: true, status: 200, data: budget, message: 'Budget updated successfully' }
  } catch (error) {
    console.error('Error updating budget:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
