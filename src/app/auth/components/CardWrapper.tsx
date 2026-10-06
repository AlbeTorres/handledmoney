import { cx } from 'class-variance-authority'
import Link from 'next/link'

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel: string
  backButtonLabel?: string
  backButtonHref?: string
  recoverButtonHref?: string
  recoverButtonLabel?: string
  classname?: string
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,

  recoverButtonHref,
  recoverButtonLabel,

  classname,
}: CardWrapperProps) => {
  return (
    <div className={cx('px-8 py-6 w-11/12 md:w-96 text-left', classname)}>
      <h3 className='text-2xl font-bold mb-5'>{headerLabel}</h3>
      {children}

      <div className='mt-5 flex flex-col gap-3'>
        <Link href={backButtonHref || '/'}>
          <p className='text-xs text-center hover:text-primary hover:underline'>
            {backButtonLabel}
          </p>
        </Link>
        <Link href={recoverButtonHref || '/'}>
          <p className='text-xs text-center hover:text-primary hover:underline mt-2'>
            {recoverButtonLabel}
          </p>
        </Link>
      </div>
    </div>
  )
}
