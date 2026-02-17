// 'use server'

// import prisma from '@/lib/prisma'
// import { getResetTokenByToken } from '@/lib/reset-token'
// import { ChangePasswordSchema } from '@/schema'
// import bcryptjs from 'bcryptjs'
// import * as z from 'zod'
// import { parseResponse } from '../lib/parseResponse'

// interface Props {
//   password: { password: string }
//   token: string
// }

// export const changePassword = async (
//   password: z.infer<typeof ChangePasswordSchema>,
//   token: string
// ) => {
//   const isValid = await getResetTokenByToken(token)

//   if (!isValid) return parseResponse(false, 400, 'invalid_token', 'Invalid token')

//   const hasExpired = new Date(isValid.expires) < new Date()

//   if (hasExpired) return parseResponse(false, 400, 'expired_token', 'Expired token')

//   try {
//     const verifiedUser = await prisma.user.update({
//       where: {
//         email: isValid.email,
//       },
//       data: {
//         password: bcryptjs.hashSync(password.password),
//       },
//     })

//     await prisma.passwordResetToken.delete({
//       where: {
//         id: isValid.id,
//       },
//     })
//     const { password: _, ...rest } = verifiedUser
//     return parseResponse(true, 200, null, 'Password changed', rest)
//   } catch (error) {
//     console.log(error)
//     return parseResponse(false, 200, error, 'Something went wrong')
//   }
// }
