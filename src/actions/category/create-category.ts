'use server'

import { auth } from '@/lib/auth'
import { categorySchema } from '@/lib/schema'
import { createCategory, getCategoriesByUserId } from '@/repository/categories'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

export const createCategoryAction = async (values: z.infer<typeof categorySchema>) => {
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

  const validatedFields = categorySchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      status: 400,
      message: 'Invalid fields!',
    }
  }

  const { name, icon, color, type, parentId } = validatedFields.data

  try {
    // Unique name per type check
    const existingCategories = await getCategoriesByUserId(userId, type)
    const normalizedName = name.toLowerCase().trim()
    const isDuplicate = existingCategories.some(c => c.name.toLowerCase().trim() === normalizedName)

    if (isDuplicate) {
      return {
        success: false,
        status: 400,
        message: 'A category with this name already exists for this type',
      }
    }

    // Hierarchy check (max 2 levels)
    if (parentId) {
      const parent = existingCategories.find(c => c.id === parentId)
      if (parent?.parentId) {
        return {
          success: false,
          status: 400,
          message: 'Maximum hierarchy depth reached (2 levels)',
        }
      }
    }

    const result = await createCategory({
      userId,
      name,
      icon,
      color,
      type,
      parentId,
    })

    revalidatePath('/category')

    return {
      success: true,
      status: 200,
      data: result,
      message: 'Category created successfully',
    }
  } catch (error) {
    console.error('Error creating category:', error)
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
    }
  }
}
