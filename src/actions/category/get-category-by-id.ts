'use server'

import { auth } from '@/lib/auth'
import { getCategoryById } from '@/repository/categories'
import { headers } from 'next/headers'

export const getCategoryByIdAction = async (id: string) => {
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
    const category = await getCategoryById(id, userId)

    if (!category) {
      return {
        success: false,
        status: 404,
        message: 'Category not found',
      }
    }

    return {
      success: true,
      status: 200,
      data: category,
      message: 'Category retrieved successfully',
    }
  } catch (error) {
    console.error('Error in getCategoryByIdAction:', error)
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
    }
  }
}
