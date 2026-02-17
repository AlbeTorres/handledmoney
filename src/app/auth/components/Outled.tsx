// 'use client'
// import { newVerification } from '@/actions/auth/new-verification'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import toast from 'react-hot-toast'
// import { AuthMessage } from './AuthMessage'

// export const Outled = () => {
//   const query = useSearchParams().get('token')
//   const router = useRouter()
//   const [message, setMessage] = useState<{ message: string; type: 'error' | 'success' | null }>({
//     message: '',
//     type: null,
//   })

//   useEffect(() => {
//     onSubmit()
//   }, []) // eslint-disable-line react-hooks/exhaustive-deps

//   const onSubmit = async () => {
//     if (query !== null) {
//       const result = await newVerification(query)

//       if (!result.state) {
//         if (result.error === 'invalid_token') {
//           setMessage({
//             message: 'Invalid token!',
//             type: 'error',
//           })
//         } else if (result.error === 'expired_token') {
//           setMessage({
//             message: 'Expired token!',
//             type: 'error',
//           })
//         } else {
//           setMessage({
//             message: 'Something went wrong!',
//             type: 'error',
//           })
//         }
//         // Manejar error
//       } else {
//         // Redirigir al usuario
//         toast.success('Email verifed successfully')
//         router.push('/auth/login')
//       }
//     }
//   }

//   return (
//     <div>
//       <h1>Por favor revisa tu correo te enviamos un email de verificación</h1>

//       <AuthMessage message={message.message} type={message.type} />
//     </div>
//   )
// }
