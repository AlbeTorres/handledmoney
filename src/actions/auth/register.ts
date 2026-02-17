// 'use server'

// import prisma from '@/lib/prisma'
// import { RegisterSchema } from '@/schema'
// import bcryptjs from 'bcryptjs'
// import * as z from 'zod'
// import { parseResponse } from '../lib/parseResponse'

// export const registerUser = async ({ name, email, password }: z.infer<typeof RegisterSchema>) => {
//   const validatedFields = RegisterSchema.safeParse({ email, password, name })

//   if (!validatedFields.success) {
//     return parseResponse(false, 401, 'invalid_fields', 'Invalid fields!')
//   }

//   try {
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email: email.toLocaleLowerCase(),
//         password: bcryptjs.hashSync(password),
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//       },
//     })

//     //crear configuracion con lenguaje en cuanto se crea un usuario
//     await prisma.settings.create({
//       data: {
//         userId: user.id,
//       },
//     })

//     return parseResponse(true, 200, null, 'Confirmation email sent!', user)
//   } catch (error) {
//     console.log(error)
//     return parseResponse(false, 500, '', 'Something went wrong')
//   }
// }
