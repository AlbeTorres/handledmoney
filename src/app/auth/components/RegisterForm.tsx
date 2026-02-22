'use client'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { RegisterSchema } from '@/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOffIcon, MailIcon, UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { AuthMessage } from './AuthMessage'
import { CardWrapper } from './CardWrapper'

export default function RegisterPage() {
  const router = useRouter()
  const t = useTranslations('handledmoney.auth')
  const [showPassword, setShowPassword] = useState(false)

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' | null }>({
    message: '',
    type: null,
  })

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  })

  const handleSubmit = async (data: z.infer<typeof RegisterSchema>) => {
    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
      callbackURL: '/dashboard',
    })

    if (error) {
      alert(error.message)
    } else {
      setMessage({ message: 'Revisa tu email para verificar tu cuenta', type: 'success' })
    }
  }

  return (
    <CardWrapper
      headerLabel={t('signup_title')}
      backButtonHref='/auth/login'
      backButtonLabel={t('signin_link')}
      recoverButtonHref='/auth/reset'
      recoverButtonLabel={t('password_recovery')}
      callbackUrl={'/'}
      showSocial
      isPending={isPending}
    >
      <form id='form-signup' onSubmit={form.handleSubmit(handleSubmit)}>
        <FieldGroup>
          <Controller
            name='name'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signup-name'>{t('name')}</FieldLabel>
                <InputGroup className='focus:outline-none focus:ring-1 focus:ring-blue-600'>
                  <InputGroupInput
                    {...field}
                    id='form-signup-name'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('name_placeholder')}
                    autoComplete='off'
                    type='text'
                    disabled={isPending}
                  />
                  <InputGroupAddon>
                    <UserIcon />
                  </InputGroupAddon>
                </InputGroup>

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name='email'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signup-email'>{t('email')}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='form-signup-email'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('email_placeholder')}
                    autoComplete='off'
                    type='email'
                    disabled={isPending}
                  />

                  <InputGroupAddon>
                    <MailIcon />
                  </InputGroupAddon>
                </InputGroup>

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name='password'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='form-signup-password'>{t('password')}</FieldLabel>
                <InputGroup className='focus:outline-none focus:ring-1 focus:ring-blue-600'>
                  <InputGroupInput
                    {...field}
                    id='form-signup-password'
                    aria-invalid={fieldState.invalid}
                    placeholder={t('password_placeholder')}
                    autoComplete='off'
                    type={showPassword ? 'text' : 'password'}
                    disabled={isPending}
                  />
                  <InputGroupAddon>
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isPending}
                      className='text-gray-500 pl-1.5 hover:text-foreground/80'
                    >
                      {showPassword ? (
                        <EyeIcon className='w-4 h-4' />
                      ) : (
                        <EyeOffIcon className='w-4 h-4' />
                      )}
                    </button>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>
        <AuthMessage className='my-4' type={message.type} message={message.message} />
        <Button
          disabled={isPending}
          type='submit'
          className='block! px-6 py-2 mt-8 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
        >
          {t('signup')}
        </Button>
      </form>
    </CardWrapper>
  )
}

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
