import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
// import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'

export const SocialButtons = ({
  callbackUrl,
  isPending,
}: {
  callbackUrl?: string
  isPending: boolean
}) => {
  const onClick = async (provider: 'google' | 'github') => {
    await authClient.signIn.social({
      provider,
      callbackURL: callbackUrl || '/',
    })
  }

  return (
    <>
      {/* divisor line */}
      <div className='flex items-center my-5'>
        <div className='flex-1 border-t border-gray-500'></div>
        <div className='px-2 text-sm text-gray-800'>O</div>
        <div className='flex-1 border-t border-gray-500'></div>
      </div>

      <div className='flex w-full justify-between'>
        <Button
          disabled={isPending}
          onClick={() => onClick('google')}
          variant={'outline'}
          className='px-6 py-2 w-full flex items-center justify-center text-white border-2 border-primary rounded-lg transition-all duration-300 hover:bg-secondary hover:border-secondary'
        >
          <FcGoogle className='bg-white rounded-full' />
        </Button>
      </div>
    </>
  )
}
