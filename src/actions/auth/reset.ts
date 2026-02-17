// 'use server'
// import { sendResetMail } from '@/email/sendResetPasswordMail'
// import prisma from '@/lib/prisma'
// import { generateResetToken } from '@/lib/tokens'
// import { ResetSchema } from '@/schema'
// import * as z from 'zod'
// import { parseResponse } from '../lib/parseResponse'

// export const reset = async ({ email }: z.infer<typeof ResetSchema>) => {
//   const validatedFields = ResetSchema.safeParse({ email })

//   if (!validatedFields.success) {
//     return parseResponse(false, 401, 'invalid_fields', 'Invalid fields!')
//   }

//   try {
//     const user = await prisma.user.findUnique({ where: { email } })

//     if (!user || !user.email) {
//       return parseResponse(false, 404, 'invalid_credentials', 'Email not found!')
//     }

//     const resetPasswordToken = await generateResetToken(user.email || '')
//     sendResetMail(user.email, resetPasswordToken!.token, user!.name || '')

//     return parseResponse(true, 200, 'reset_email', 'Reset email sent!')
//   } catch (error) {
//     console.log(error)
//     return parseResponse(false, 200, error, 'Something went wrong')
//   }
// }
