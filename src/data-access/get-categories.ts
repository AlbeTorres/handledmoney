import { auth } from '@/lib/auth'
import { getCategoriesByUserId } from '@/repository/categories'
import { headers } from 'next/headers'
import 'server-only'

export const getCategoriesByUserData= async (type?: 'income' | 'expense') => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user.id

  if (!userId) {
    return {
      success: false,
      message: 'Unauthorized User',
      data: [],
    }
  }

  try {
    const categories = await getCategoriesByUserId(userId, type)

    return {
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
    }
  } catch (error) {
    console.error('Error in getCategories:', error)
    return {
      success: false,
      message: 'Something went wrong',
      data: [],
    }
  }
}
