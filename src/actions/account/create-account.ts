'use server'
import { auth } from '@/lib/auth'
import { CreateAccountSchema } from '@/lib/schema'
import { createBankAccount } from '@/repository/account'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import * as z from 'zod'

export const newBankAccount = async ({
  name,
  bank,
  type,
  currency,
  balance,
  icon,
  color,
}: z.infer<typeof CreateAccountSchema>) => {
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

  const validatedFields = CreateAccountSchema.safeParse({
    name,
    bank,
    type,
    currency,
    balance,
    icon,
    color,
  })

  if (!validatedFields.success) {
    return {
      success: false,
      status: 400,
      message: 'Invalid fields!',
    }
  }

  try {
    await createBankAccount({
      name,
      bank,
      type,
      currency,
      balance,
      icon,
      color,
      userId,
    })
    revalidatePath('/account')

    return {
      success: true,
      status: 200,
      message: 'Account created successfully!',
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      status: 500,
      message: 'Something went wrong',
    }
  }
}
