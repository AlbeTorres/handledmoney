// 'use client'

// import { Button } from '@/components/ui/button'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { CardWrapper } from './CardWrapper'

// import { changePassword } from '@/actions/auth/change-password'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { ChangePasswordSchema } from '@/schema'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useState, useTransition } from 'react'
// import { useForm } from 'react-hook-form'
// import toast from 'react-hot-toast'
// import * as z from 'zod'
// import { AuthMessage } from './AuthMessage'

// export const ChangePassword = () => {
//   const [isPending, startTransition] = useTransition()
//   const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' | null }>({
//     message: '',
//     type: null,
//   })

//   const form = useForm<z.infer<typeof ChangePasswordSchema>>({
//     resolver: zodResolver(ChangePasswordSchema),
//     defaultValues: {
//       password: '',
//     },
//   })

//   const router = useRouter()
//   const token = useSearchParams().get('token')

//   const handleSubmit = async (values: z.infer<typeof ChangePasswordSchema>) =>
//     startTransition(async () => {
//       if (token !== null) {
//         const result = await changePassword(values, token)

//         if (!result.state) {
//           // Manejar error

//           if (result.error === 'invalid_credentials') {
//             setMessage({
//               message: "we couldn't found a registered user with that email",
//               type: 'error',
//             })
//             return
//           }
//           if (result.error === 'expired_token') {
//             setMessage({
//               message: 'Expired token!',
//               type: 'error',
//             })
//             return
//           }

//           setMessage({
//             message: 'Something went wrong!',
//             type: 'error',
//           })
//         } else {
//           // Redirigir al usuario
//           router.push('/')
//           toast.success('Password succefully reseted')
//         }
//       } else {
//         setMessage({
//           message: 'Missing token!',
//           type: 'error',
//         })
//       }
//     })

//   return (
//     <CardWrapper
//       headerLabel='Forgot your password'
//       backButtonHref='/auth/login'
//       backButtonLabel='Back to login'
//     >
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(handleSubmit)}>
//           <div className='mt-4 space-y-4'>
//             <FormField
//               control={form.control}
//               name='password'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       className='w-full px-4 py-2 border rounded-md  focus:outline-none focus:!ring-1 focus:!ring-blue-600'
//                       {...field}
//                       placeholder='password'
//                       type='password'
//                       disabled={isPending}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>
//           <AuthMessage className='my-4' type={message.type} message={message.message} />
//           <Button
//             disabled={isPending}
//             type='submit'
//             className='block! px-6 py-2 mt-8 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
//           >
//             Reset password
//           </Button>
//         </form>
//       </Form>
//     </CardWrapper>
//   )
// }
