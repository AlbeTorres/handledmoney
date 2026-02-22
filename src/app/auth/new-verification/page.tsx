import { AuthMessage } from '../components'

interface Props {
  searchParams: Promise<{ error?: string; token?: string }>
}

export default async function NewVerification({ searchParams }: Props) {
  const params = await searchParams

  // Si no viene ningún parámetro, el usuario llegó directo
  const isDirectAccess = Object.keys(params).length === 0

  if (isDirectAccess) {
    return (
      <main className='flex min-h-screen flex-col items-center justify-center p-24'>
        <div className='text-center space-y-4'>
          <h1 className='text-2xl font-bold'>Verificación de email</h1>
          <p className='text-gray-500'>
            Esta página es solo accesible desde el enlace de verificación enviado a tu correo.
          </p>
          <a
            href='/auth/login'
            className='inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
          >
            Ir al inicio de sesión
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <div className='text-center space-y-4'>
        <h1 className='text-2xl font-bold'>Verificación de email</h1>

        {params.error ? (
          <AuthMessage
            message='El enlace de verificación es inválido o ya expiró. Intenta iniciar sesión para recibir uno nuevo.'
            type='error'
          />
        ) : (
          <AuthMessage
            message='¡Email verificado correctamente! Ya puedes iniciar sesión.'
            type='success'
          />
        )}

        <a
          href='/auth/login'
          className='inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
        >
          Ir al inicio de sesión
        </a>
      </div>
    </main>
  )
}
