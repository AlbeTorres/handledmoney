// 'use client'

// import { Button } from '@/components/ui/button'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { CardWrapper } from './CardWrapper'

// import { reset } from '@/actions/auth/reset'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { ResetSchema } from '@/schema'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useState, useTransition } from 'react'
// import { useForm } from 'react-hook-form'
// import * as z from 'zod'
// import { AuthMessage } from './AuthMessage'

// export const ResetForm = () => {
//   const [isPending, startTransition] = useTransition()
//   const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' | null }>({
//     message: '',
//     type: null,
//   })

//   const form = useForm<z.infer<typeof ResetSchema>>({
//     resolver: zodResolver(ResetSchema),
//     defaultValues: {
//       email: '',
//     },
//   })

//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const callbackUrl = searchParams.get('callbackUrl') || '/'

//   const handleSubmit = async (values: z.infer<typeof ResetSchema>) =>
//     startTransition(async () => {
//       const result = await reset(values)

//       if (!result.state) {
//         // Manejar error

//         if (result.error === 'invalid_credentials') {
//           setMessage({
//             message: "we couldn't found a registered user with that email",
//             type: 'error',
//           })
//           return
//         }

//         setMessage({
//           message: 'Something went wrong!',
//           type: 'error',
//         })
//       } else {
//         // Redirigir al usuario
//         router.push(callbackUrl)
//       }
//     })

//   return (
//     <CardWrapper
//       headerLabel='Forgot your password'
//       backButtonHref='/auth/login'
//       backButtonLabel='Back to login'
//       callbackUrl={callbackUrl}
//     >
//       <Form {...form}>
//         <form onSubmit={form.handleSubmit(handleSubmit)}>
//           <div className='mt-4 space-y-4'>
//             <FormField
//               control={form.control}
//               name='email'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Email</FormLabel>
//                   <FormControl>
//                     <Input
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
//           </div>
//           <AuthMessage className='my-4' type={message.type} message={message.message} />
//           <Button
//             disabled={isPending}
//             type='submit'
//             className='block! px-6 py-2 mt-8 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
//           >
//             Send reset email
//           </Button>
//         </form>
//       </Form>
//     </CardWrapper>
//   )
// }
