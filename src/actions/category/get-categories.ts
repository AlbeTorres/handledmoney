'use server'

import { auth } from '@/lib/auth'
import { getCategoriesByUserId } from '@/repository/categories'
import { headers } from 'next/headers'

export const getCategoriesByUserAction = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user.id

  if (!userId) {
    return {
      success: false,
      status: 401,
      message: 'Unauthorized User',
      data: [],
    }
  }

  try {
    const categories = await getCategoriesByUserId(userId)

    return {
      success: true,
      status: 200,
      data: categories,
      message: 'Categories retrieved successfully',
    }
  } catch (error) {
    console.error('Error in getCategories:', error)
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
      data: [],
    }
  }
}
