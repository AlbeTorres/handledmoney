// 'use server'

// import prisma from '@/lib/prisma'
// import { getVerificationTokenByToken } from '@/lib/verification-token'
// import { parseResponse } from '../lib/parseResponse'

// export const newVerification = async (token: string) => {
//   const isValid = await getVerificationTokenByToken(token)

//   if (!isValid) return parseResponse(false, 400, 'invalid_token', 'Invalid token')

//   const hasExpired = new Date(isValid.expires) < new Date()

//   if (hasExpired) return parseResponse(false, 400, 'expired_token', 'Expired token')

//   try {
//     const verifiedUser = await prisma.user.update({
//       where: {
//         email: isValid.email,
//       },
//       data: {
//         emailVerified: new Date(),
//       },
//     })

//     await prisma.verificationToken.delete({
//       where: {
//         id: isValid.id,
//       },
//     })
//     const { password: _, ...rest } = verifiedUser
//     return parseResponse(true, 200, null, 'Email verified', rest)
//   } catch (error) {
//     console.log(error)
//     return parseResponse(false, 200, error, 'Something went wrong')
//   }
// }
