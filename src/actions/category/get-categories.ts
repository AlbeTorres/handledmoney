'use server'

import { auth } from '@/lib/auth'
import {
  countCategoriesByUserId,
  createManyCategories,
  getCategoriesByUserId,
} from '@/repository/categories'
import { headers } from 'next/headers'

const DEFAULT_CATEGORIES = [
  { name: 'Alimentación', icon: 'utensils', color: '#f97316', type: 'expense' as const },
  { name: 'Transporte', icon: 'car', color: '#3b82f6', type: 'expense' as const },
  { name: 'Hogar', icon: 'home', color: '#8b5cf6', type: 'expense' as const },
  { name: 'Compras', icon: 'shopping_bag', color: '#22c55e', type: 'expense' as const },
  { name: 'Salud', icon: 'heart_pulse', color: '#ef4444', type: 'expense' as const },
  { name: 'Entretenimiento', icon: 'clapperboard', color: '#ec4899', type: 'expense' as const },
  { name: 'Educación', icon: 'graduation_cap', color: '#f59e0b', type: 'expense' as const },
  { name: 'Viajes', icon: 'plane', color: '#06b6d4', type: 'expense' as const },
  { name: 'Mascotas', icon: 'paw_print', color: '#84cc16', type: 'expense' as const },
  { name: 'Otros Gastos', icon: 'more_horizontal', color: '#94a3b8', type: 'expense' as const },
  { name: 'Salario', icon: 'briefcase', color: '#10b981', type: 'income' as const },
  { name: 'Otros Ingresos', icon: 'trending_up', color: '#6366f1', type: 'income' as const },
]

export const getOrSeedCategories = async () => {
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
    const count = await countCategoriesByUserId(userId)

    if (count === 0) {
      const data = DEFAULT_CATEGORIES.map(category => ({
        ...category,
        userId,
        isDefault: true,
      }))
      await createManyCategories(data)
    }

    const categories = await getCategoriesByUserId(userId)

    return {
      success: true,
      status: 200,
      data: categories,
      message: 'Categories retrieved successfully',
    }
  } catch (error) {
    console.error('Error in getOrSeedCategories:', error)
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
    }
  }
}
