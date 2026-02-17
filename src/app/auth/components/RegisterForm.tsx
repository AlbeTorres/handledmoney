// 'use client'
// import { useForm } from 'react-hook-form'

// import { login } from '@/actions/auth/login'
// import { registerUser } from '@/actions/auth/register'
// import { Button } from '@/components/ui/button'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { RegisterSchema } from '@/schema'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useRouter } from 'next/navigation'
// import { useState, useTransition } from 'react'
// import * as z from 'zod'
// import { AuthMessage } from './AuthMessage'
// import { CardWrapper } from './CardWrapper'

// export const RegisterForm = () => {
//   const [isPending, startTransition] = useTransition()
//   const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' | null }>({
//     message: '',
//     type: null,
//   })
//   const router = useRouter()
//   const form = useForm<z.infer<typeof RegisterSchema>>({
//     resolver: zodResolver(RegisterSchema),
//     defaultValues: {
//       email: '',
//       password: '',
//       name: '',
//     },
//   })

//   const handleSingup = async (data: z.infer<typeof RegisterSchema>) =>
//     startTransition(async () => {
//       const { setValue } = form
//       const { name, email, password } = data
//       const rest = await registerUser({ name, email, password })
//       if (!rest.state) {
//         setMessage({
//           message: 'Something went wrong!',
//           type: 'error',
//         })
//         setValue('email', '')
//         setValue('password', '')
//       } else {
//         const result = await login({ email: email.toLocaleLowerCase(), password })

//         if (result.error === 'unverificated_email') {
//           setMessage({
//             message: 'Email sent',
//             type: 'success',
//           })
//           return
//         }
//         router.replace('/')
//       }
//     })

//   return (
//     <CardWrapper
//       headerLabel='Create an account'
//       backButtonHref='/auth/login'
//       backButtonLabel='Already have an account?'
//       showSocial
//     >
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(handleSingup)}>
//           <div className='mt-4 space-y-4'>
//             <FormField
//               control={form.control}
//               name='name'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Name</FormLabel>
//                   <FormControl>
//                     <Input
//                       className='w-full px-4 py-2 border rounded-md  focus:outline-none focus:!ring-1 focus:!ring-blue-600'
//                       {...field}
//                       placeholder='Jhon Doe'
//                       disabled={isPending}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name='email'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input
//                       autoComplete='new-password'
//                       className='w-full px-4 py-2 border rounded-md  focus:outline-none focus:!ring-1 focus:!ring-blue-600'
//                       {...field}
//                       placeholder='jhon.doe@example.com'
//                       type='email'
//                       disabled={isPending}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name='password'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       autoComplete='new-password'
//                       className='w-full px-4 py-2 border rounded-md focus:outline-none focus:!ring-1 focus:!ring-blue-600'
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
//             className='!block px-6 py-2 mt-8 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
//           >
//             Create
//           </Button>
//         </form>
//       </Form>
//     </CardWrapper>
//   )
// }
