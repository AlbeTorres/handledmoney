// 'use server'
// import { signIn } from '@/auth'
// import { sendTwoFactorTokenMail } from '@/email/sendTwoFactorTokenMail'
// import { sendVerificationMail } from '@/email/sendVerificationMail'
// import prisma from '@/lib/prisma'
// import { generateTwoFactorToken, generateVerificationToken } from '@/lib/tokens'
// import { getTwofactorConfirmationByUserId } from '@/lib/two-factor-confirmation'
// import { getTwoFactorTokenByEmail } from '@/lib/two-factor-token'
// import { LoginSchema } from '@/schema'
// import bcryptjs from 'bcryptjs'
// import * as z from 'zod'
// import { parseResponse } from '../lib/parseResponse'

import { LoginSchema } from '@/schema'
import z from 'zod'

// export const login = async ({ email, password, code }: z.infer<typeof LoginSchema>) => {
//   const validatedFields = LoginSchema.safeParse({ email, password })

//   if (!validatedFields.success) {
//     return parseResponse(false, 401, 'invalid_fields', 'Invalid fields!')
//   }
//   try {
//     const user = await prisma.user.findUnique({ where: { email } })

//     if (!user || !user.email || !user.password) {
//       return parseResponse(false, 401, 'invalid_credentials', 'Invalid credentials!')
//     }

//     if (!user.emailVerified) {
//       const verificationToken = await generateVerificationToken(user.email)
//       sendVerificationMail(user.email, verificationToken!.token, user!.name || '')
//       return parseResponse(true, 200, 'unverificated_email', 'Confirmation email sent!')
//     }

//     if (user.isTwofactorEnabled && user.email) {
//       if (code) {
//         const twoFactorToken = await getTwoFactorTokenByEmail(user.email)

//         if (!twoFactorToken || twoFactorToken.token !== code)
//           return parseResponse(false, 401, 'invalid_token', 'Invalid token!')

//         const hasExpired = new Date(twoFactorToken.expires) < new Date()

//         if (hasExpired) return parseResponse(false, 400, 'expired_token', 'Expired token')

//         const existingConfirmation = await getTwofactorConfirmationByUserId(user.id)

//         if (existingConfirmation) {
//           await prisma.twoFactorConfirmation.delete({
//             where: {
//               id: existingConfirmation.id,
//             },
//           })
//         }

//         await prisma.twoFactorConfirmation.create({
//           data: {
//             userId: user.id,
//           },
//         })
//       } else {
//         const twoFactorToken = await generateTwoFactorToken(user.email)
//         sendTwoFactorTokenMail(user.email, twoFactorToken.token, user.name || '')
//         return parseResponse(true, 200, 'two_factor_token_send', '2FA token email sent!')
//       }
//     }

//     if (!bcryptjs.compareSync(password, user.password!))
//       return parseResponse(false, 401, 'credential_signin', 'Invalid credentials!')

//     await signIn('credentials', { email, password, redirect: false })

//     return parseResponse(true, 200, null, 'User autenticated')
//   } catch (error) {
//     return parseResponse(false, 500, '', 'Something went wrong')
//   }
// }

export const login = async ({ email, password, code }: z.infer<typeof LoginSchema>) => {
  return {
    state: true,
    error: null,
    message: 'User autenticated',
  }
}
