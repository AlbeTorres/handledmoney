'use server'
import { auth } from '@/lib/auth'
import { UpdateAccountSchema } from '@/lib/schema'
import { updateBankAccount } from '@/repository/account'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

export const editBankAccount = async (values: z.infer<typeof UpdateAccountSchema>) => {
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

  const validatedFields = UpdateAccountSchema.safeParse(values)

  if (!validatedFields.success) {
    return {
      success: false,
      status: 400,
      message: 'Invalid fields!',
    }
  }

  try {
    await updateBankAccount({
      ...validatedFields.data,
      userId,
    })
    revalidatePath('/account')

    return {
      success: true,
      status: 200,
      message: 'Account updated successfully!',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
    }
  }
}
