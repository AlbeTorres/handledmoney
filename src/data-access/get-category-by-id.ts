import { auth } from '@/lib/auth'
import { getCategoryById } from '@/repository/categories'
import { headers } from 'next/headers'
import 'server-only'

export const getCategoryByIdData = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user.id

  if (!userId) {
    return {
      success: false,
      message: 'Unauthorized User',
    }
  }

  try {
    const category = await getCategoryById(id, userId)

    if (!category) {
      return {
        success: false,
        message: 'Category not found',
      }
    }

    return {
      success: true,
      data: category,
      message: 'Category retrieved successfully',
    }
  } catch (error) {
    console.error('Error in getCategoryByIdAction:', error)
    return {
      success: false,
      message: 'Something went wrong',
    }
  }
}
