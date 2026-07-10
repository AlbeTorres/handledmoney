'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { authClient } from '@/lib/auth-client'
import { LockIcon } from 'lucide-react'
import { JSX, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

/**
 * useConfirmPassword
 *
 * Hook que muestra un Dialog pidiendo la contraseña actual del usuario.
 * Llama a `authClient.signIn.email` para validarla contra el backend.
 * Solo resuelve con `true` si la contraseña es correcta.
 *
 * @param userEmail - Email del usuario logueado (necesario para re-autenticar)
 * @param title - Título del dialog
 * @param message - Descripción de la acción que se está protegiendo
 *
 *
 */

type FormValues = { password: string }

export const useConfirmPassword = (
  userEmail: string,
  title: string,
  message: string,
): [() => JSX.Element, () => Promise<boolean>] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void
  } | null>(null)

  const [isValidating, setIsValidating] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: {
      password: '',
    },
  })

  // Abre el dialog y devuelve una Promise que se resuelve cuando el usuario
  // confirma (con contraseña válida) o cancela.
  const confirm = (): Promise<boolean> =>
    new Promise(resolve => {
      setPromise({ resolve })
    })

  const handleClose = () => {
    setPromise(null)
    form.reset()
  }

  const handleCancel = () => {
    promise?.resolve(false)
    handleClose()
  }

  // Valida la contraseña contra el backend antes de confirmar.
  // Usa signIn.email como mecanismo de re-autenticación — si responde OK,
  // la contraseña es correcta. No crea sesión nueva: la sesión actual permanece.
  const handleConfirm = async (values: FormValues) => {
    setIsValidating(true)

    const { error: signInError } = await authClient.signIn.email(
      {
        email: userEmail,
        password: values.password,
        callbackURL: undefined as unknown as string,
        rememberMe: false,
      },
      {
        // Evitamos que better-auth redirija; solo nos interesa el resultado
        onRequest: () => {},
      },
    )

    setIsValidating(false)

    if (signInError) {
      toast.error('Incorrect password. Please try again.')
      return
    }

    promise?.resolve(true)
    handleClose()
  }

  const ConfirmPasswordDialog = () => (
    <Dialog open={promise !== null}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <LockIcon size={18} className='text-muted-foreground' />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <form id='confirm-password-form' onSubmit={form.handleSubmit(handleConfirm)}>
          <Field>
            <FieldLabel htmlFor='confirm-password-input'>Current Password</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id='confirm-password-input'
                type={'password'}
                {...form.register('password')}
                onChange={e => {
                  form.setValue('password', e.target.value)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleConfirm(form.getValues())
                }}
                placeholder='Enter your current password'
                disabled={isValidating}
                autoFocus
                autoComplete='current-password'
              />
            </InputGroup>
          </Field>
        </form>

        <DialogFooter className='pt-2'>
          <Button onClick={handleCancel} variant='outline' disabled={isValidating}>
            Cancel
          </Button>
          <Button type='submit' form='confirm-password-form'>
            {isValidating ? 'Verifying...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return [ConfirmPasswordDialog, confirm]
}
