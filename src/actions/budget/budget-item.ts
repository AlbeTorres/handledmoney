'use server'

import { auth } from '@/lib/auth'
import { CreateBudgetItemSchema, UpdateBudgetItemSchema } from '@/lib/schema'
import {
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  createBudgetGroup,
  deleteBudgetGroup,
} from '@/repository/budget'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import type z from 'zod'

type CreateBudgetItemValues = z.infer<typeof CreateBudgetItemSchema>
type UpdateBudgetItemValues = z.infer<typeof UpdateBudgetItemSchema>

// ── Item actions ───────────────────────────────────────────────────────────────

export const createBudgetItemAction = async (values: CreateBudgetItemValues, budgetId: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const validated = CreateBudgetItemSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, status: 400, message: 'Invalid fields', errors: validated.error.flatten() }
  }

  try {
    const item = await createBudgetItem(validated.data)
    revalidatePath(`/budget/${budgetId}`)
    return { success: true, status: 201, data: item, message: 'Item added successfully' }
  } catch (error) {
    console.error('Error creating budget item:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}

export const updateBudgetItemAction = async (values: UpdateBudgetItemValues, budgetId: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  const validated = UpdateBudgetItemSchema.safeParse(values)
  if (!validated.success) {
    return { success: false, status: 400, message: 'Invalid fields', errors: validated.error.flatten() }
  }

  try {
    const item = await updateBudgetItem(validated.data)
    if (!item) return { success: false, status: 404, message: 'Item not found' }

    revalidatePath(`/budget/${budgetId}`)
    return { success: true, status: 200, data: item, message: 'Item updated successfully' }
  } catch (error) {
    console.error('Error updating budget item:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}

export const deleteBudgetItemAction = async (id: string, budgetId: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  try {
    const deleted = await deleteBudgetItem(id)
    if (!deleted) return { success: false, status: 404, message: 'Item not found' }

    revalidatePath(`/budget/${budgetId}`)
    return { success: true, status: 200, data: deleted, message: 'Item deleted successfully' }
  } catch (error) {
    console.error('Error deleting budget item:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}

// ── Group actions ──────────────────────────────────────────────────────────────

export const createBudgetGroupAction = async (
  values: { budgetId: string; name: string; type: 'income' | 'bills' | 'variable_expenses' | 'debt' | 'savings' | 'investments'; sortOrder?: number },
  budgetId: string,
) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  try {
    const group = await createBudgetGroup({
      budgetId,
      name: values.name,
      type: values.type,
      sortOrder: values.sortOrder ?? 0,
    })
    revalidatePath(`/budget/${budgetId}`)
    return { success: true, status: 201, data: group, message: 'Group added successfully' }
  } catch (error) {
    console.error('Error creating budget group:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}

export const deleteBudgetGroupAction = async (groupId: string, budgetId: string) => {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return { success: false, status: 401, message: 'Unauthorized' }
  }

  try {
    const deleted = await deleteBudgetGroup(groupId)
    if (!deleted) return { success: false, status: 404, message: 'Group not found' }

    revalidatePath(`/budget/${budgetId}`)
    return { success: true, status: 200, data: deleted, message: 'Group deleted successfully' }
  } catch (error) {
    console.error('Error deleting budget group:', error)
    return { success: false, status: 500, message: 'Something went wrong' }
  }
}
