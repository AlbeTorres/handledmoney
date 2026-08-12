'use server'

import { auth } from '@/lib/auth'
import { getCategoryById } from '@/repository/categories'
import { updateTransactionsCategory } from '@/repository/transaction'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

const updateTransactionsCategorySchema = z.object({
  categoryId: z.string().uuid(),
  ids: z.array(z.string().uuid()).max(1000),
})

export const updateTransactionsCategoryAction = async (
  values: z.infer<typeof updateTransactionsCategorySchema>,
) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const validated = updateTransactionsCategorySchema.safeParse(values)
  if (!validated.success) {
    return { success: false, status: 400, message: 'Invalid fields' }
  }

  const { categoryId, ids } = validated.data

  try {
    // Ownership: the destination category must belong to the session user.
    const category = await getCategoryById(categoryId, session.user.id)
    if (!category) {
      return { success: false, status: 404, message: 'Category not found' }
    }

    const count = await updateTransactionsCategory(categoryId, ids, session.user.id)

    revalidatePath('/transaction')
    revalidatePath('/account')

    return { success: true, status: 200, message: 'Category updated successfully', count }
  } catch (error) {
    console.error('Error updating transactions category:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
