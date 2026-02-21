import Link from 'next/link'
import { SocialButtons } from './SocialButtons'

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel: string
  backButtonLabel: string
  backButtonHref: string
  recoverButtonHref: string
  recoverButtonLabel: string
  showSocial?: boolean
  callbackUrl?: string
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
  recoverButtonHref,
  recoverButtonLabel,
  callbackUrl,
}: CardWrapperProps) => {
  return (
    <div className='px-8 py-6 w-11/12 md:w-84 text-left bg-white rounded-b-md md:shadow-lg'>
      <h3 className='text-2xl font-bold mb-5'>{headerLabel}</h3>
      {children}
      {/* divisor line */}
      <div className='flex items-center my-5'>
        <div className='flex-1 border-t border-gray-500'></div>
        <div className='px-2 text-sm text-gray-800'>O</div>
        <div className='flex-1 border-t border-gray-500'></div>
      </div>

      {showSocial && <SocialButtons callbackUrl={callbackUrl} />}
      <div className='mt-5 flex flex-col gap-3'>
        <Link href={backButtonHref}>
          <p className='text-xs text-center hover:text-blue-700 hover:underline'>
            {backButtonLabel}
          </p>
        </Link>
        <Link href={recoverButtonHref}>
          <p className='text-xs text-center hover:text-blue-700 hover:underline mt-2'>
            {recoverButtonLabel}
          </p>
        </Link>
      </div>
    </div>
  )
}
