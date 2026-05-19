'use client'

import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const COOLDOWN_SECONDS = 300

// ─── Types ────────────────────────────────────────────────────────────────────

type VerificationMode = 'neutral' | 'pending' | 'verifying' | 'success' | 'invalid-token'

type AuthErrorLike = {
  code?: string
  status?: number
  message?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorFromResult(result: unknown): AuthErrorLike | null {
  if (typeof result !== 'object' || result === null || !('error' in result)) {
    return null
  }

  const error = (result as { error?: AuthErrorLike | null }).error
  return error ?? null
}

function isInvalidTokenError(error: AuthErrorLike): boolean {
  if (error.code === 'INVALID_TOKEN' || error.code === 'TOKEN_EXPIRED') {
    return true
  }

  const normalizedMessage = error.message?.toLowerCase() ?? ''
  return normalizedMessage.includes('invalid token') || normalizedMessage.includes('token')
}

function isTooManyRequestsError(error: AuthErrorLike): boolean {
  return error.code === 'TOO_MANY_REQUESTS' || error.status === 429
}

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VerificationClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')

  console.log(searchParams)
  console.log('emailParam', emailParam)

  const [mode, setMode] = useState<VerificationMode>(() => {
    if (token) return 'verifying'
    if (emailParam) return 'pending'
    return 'neutral'
  })
  const [email, setEmail] = useState(emailParam ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  const isCooldownActive = cooldownSeconds > 0
  const isSubmitDisabled = isLoading || isCooldownActive

  const resendButtonLabel = useMemo(() => {
    if (isLoading) return 'Enviando...'
    if (isCooldownActive) return `Reenviar en ${formatCooldown(cooldownSeconds)}`
    return 'Reenviar correo'
  }, [cooldownSeconds, isCooldownActive, isLoading])

  const requestLinkButtonLabel = useMemo(() => {
    if (isLoading) return 'Enviando...'
    return 'Pedir nuevo enlace'
  }, [isLoading])

  // Auto-verify when a token is present in the URL
  useEffect(() => {
    if (!token) {
      return
    }

    let mounted = true

    const runVerification = async () => {
      setMode('verifying')
      setIsLoading(true)
      setStatusMessage('Verificando...')
      setErrorMessage('')

      try {
        const result = await authClient.verifyEmail({ query: { token } })

        if (!mounted) return

        const error = getErrorFromResult(result)
        if (!error) {
          setMode('success')
          setStatusMessage('Email verificado correctamente')
          setErrorMessage('')
        } else if (isInvalidTokenError(error)) {
          setMode('invalid-token')
          setStatusMessage('')
          setErrorMessage('El enlace expiró o no es válido. Solicitá uno nuevo.')
        } else {
          setMode('invalid-token')
          setStatusMessage('')
          setErrorMessage('Algo salió mal, intentá de nuevo')
        }
      } catch {
        if (!mounted) return
        setMode('invalid-token')
        setStatusMessage('')
        setErrorMessage('Algo salió mal, intentá de nuevo')
      }

      setIsLoading(false)
    }

    void runVerification()

    return () => {
      mounted = false
    }
  }, [token])

  // Countdown timer for the resend cooldown
  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setCooldownSeconds(current => {
        if (current <= 1) {
          window.clearInterval(intervalId)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [cooldownSeconds])

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitDisabled) {
      return
    }

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Ingresá un email válido')
      setStatusMessage('')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const result = await authClient.sendVerificationEmail({
        email: trimmedEmail,
        callbackURL: '/auth/new-verification?redirect=false',
      })

      const error = getErrorFromResult(result)
      if (!error) {
        setStatusMessage('Correo reenviado')
        setErrorMessage('')
        setCooldownSeconds(COOLDOWN_SECONDS)
      } else if (isTooManyRequestsError(error)) {
        setStatusMessage('')
        setErrorMessage('Por favor, esperá 5 minutos')
        setCooldownSeconds(COOLDOWN_SECONDS)
      } else {
        setStatusMessage('')
        setErrorMessage('Algo salió mal, intentá de nuevo')
      }
    } catch {
      setStatusMessage('')
      setErrorMessage('Algo salió mal, intentá de nuevo')
    }

    setIsLoading(false)
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <div className='text-center space-y-4 max-w-md w-full'>
        <h1 className='text-2xl font-bold'>Verificación de email</h1>

        {statusMessage ? <p>{statusMessage}</p> : null}
        {errorMessage ? <p>{errorMessage}</p> : null}

        {mode === 'neutral' ? (
          <p>Esta página es solo accesible desde un enlace de verificación.</p>
        ) : null}

        {mode === 'success' ? (
          <Link
            href='/auth/login'
            className='inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300'
          >
            Ir al inicio de sesión
          </Link>
        ) : null}

        {mode === 'pending' || mode === 'invalid-token' ? (
          <>
            <p>La verificación está pendiente. Podés solicitar un nuevo enlace.</p>
            {mode === 'pending' ? <p>Verificá tu correo para confirmar tu cuenta.</p> : null}
            <form onSubmit={handleResend} className='space-y-3'>
              <input
                aria-label='Email'
                type='text'
                value={email}
                onChange={event => setEmail(event.target.value)}
                className='w-full border rounded px-3 py-2'
                placeholder='tu@email.com'
                disabled={isSubmitDisabled}
              />
              <button
                type='submit'
                disabled={isSubmitDisabled}
                className='inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 transition-all duration-300 disabled:opacity-70'
              >
                {mode === 'invalid-token' ? requestLinkButtonLabel : resendButtonLabel}
              </button>
            </form>
          </>
        ) : null}
      </div>
    </main>
  )
}
