'use server'

import { auth } from '@/lib/auth'
import { CreateBudgetSchema } from '@/lib/schema'
import { createBudget } from '@/repository/budget'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export const createBudgetAction = async (values: unknown) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const validated = CreateBudgetSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, status: 400, message: 'Invalid fields', errors: validated.error.flatten() }
  }

  try {
    const budget = await createBudget({ ...validated.data, userId: session.user.id })
    revalidatePath('/budget')
    return { success: true, status: 201, data: { id: budget.id }, message: 'Budget created successfully' }
  } catch (error) {
    console.error('Error creating budget:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
