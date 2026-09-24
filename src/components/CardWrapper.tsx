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
    <section
      className={cx(
        'w-full max-w-md border bg-card p-6 text-left text-card-foreground sm:p-8',
        classname,
      )}
      aria-labelledby='auth-heading'
    >
      <h1 id='auth-heading' className='headline-lg mb-5'>
        {headerLabel}
      </h1>
      {children}

      <div className='mt-5 flex flex-col gap-3'>
        {backButtonLabel && backButtonHref && (
          <Link
            className='rounded-sm text-center text-sm text-muted-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href={backButtonHref}
          >
            {backButtonLabel}
          </Link>
        )}
        {recoverButtonLabel && recoverButtonHref && (
          <Link
            className='rounded-sm text-center text-sm text-muted-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            href={recoverButtonHref}
          >
            {recoverButtonLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
