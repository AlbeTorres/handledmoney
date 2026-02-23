interface CreateAccountHeaderProps {
  title: string
  description: string
}

export function CreateAccountHeader({ title, description }: CreateAccountHeaderProps) {
  return (
    <div className='mb-10'>
      <h2 className='text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2'>
        {title}
      </h2>
      <p className='text-slate-600 dark:text-slate-400'>{description}</p>
    </div>
  )
}
