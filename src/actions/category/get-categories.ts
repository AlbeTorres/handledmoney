'use server'

import { getCategoriesByUserAction as loadCategories } from '@/data-access/get-categories'

export const getCategoriesByUserAction = async (type?: 'income' | 'expense') => loadCategories(type)
