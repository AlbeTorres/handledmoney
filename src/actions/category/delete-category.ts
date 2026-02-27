'use server'

import { auth } from '@/lib/auth'
import { deleteCategory, getCategoryById } from '@/repository/categories'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export const deleteCategoryAction = async (id: string) => {
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
    const existing = await getCategoryById(id, userId)
    if (!existing) {
      return {
        success: false,
        status: 404,
        message: 'Category not found',
      }
    }

    if (existing.children && existing.children.length > 0) {
      return {
        success: false,
        status: 400,
        message: 'Please delete subcategories first',
      }
    }

    await deleteCategory(id, userId)

    revalidatePath('/category')

    return {
      success: true,
      status: 200,
      message: 'Category deleted successfully',
    }
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return {
      success: false,
      status: 400,
      message: error.message || 'Something went wrong',
    }
  }
}
