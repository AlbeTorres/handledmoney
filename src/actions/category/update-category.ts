'use server'

import { auth } from '@/lib/auth'
import { UpdateCategorySchema } from '@/lib/schema'
import { getCategoriesByUserId, getCategoryById, updateCategory } from '@/repository/categories'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

export const updateCategoryAction = async (values: z.infer<typeof UpdateCategorySchema>) => {
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

  const validatedFields = UpdateCategorySchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      status: 400,
      message: 'Invalid fields!',
    }
  }

  const { id, name, icon, color, type, parentId } = validatedFields.data

  try {
    const existing = await getCategoryById(id, userId)
    if (!existing) {
      return {
        success: false,
        status: 404,
        message: 'Category not found',
      }
    }

    // Name uniqueness check if name is changing
    if (name || type) {
      const targetType = type || existing.type
      const targetName = (name || existing.name).toLowerCase().trim()

      const categoriesOfType = await getCategoriesByUserId(userId, targetType)
      const isDuplicate = categoriesOfType.some(
        c => c.id !== id && c.name.toLowerCase().trim() === targetName,
      )

      if (isDuplicate) {
        return {
          success: false,
          status: 400,
          message: 'A category with this name already exists for this type',
        }
      }
    }

    // Hierarchy check if parentId is changing
    if (parentId && parentId !== existing.parentId) {
      const parent = await getCategoryById(parentId, userId)
      if (parent?.parentId) {
        return {
          success: false,
          status: 400,
          message: 'Maximum hierarchy depth reached (2 levels)',
        }
      }
    }

    const result = await updateCategory(id, userId, {
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
      message: 'Category updated successfully',
    }
  } catch (error) {
    console.error('Error updating category:', error)
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
    }
  }
}
