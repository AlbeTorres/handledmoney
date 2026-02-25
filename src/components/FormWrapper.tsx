import { AccountBreadcrumb } from './AccountBreadcrumb'
import { FormAccountHeader } from './CreateAccountHeader'

export function FormWrapper({
  children,
  title,
  description,
  oldPath,
  oldPathTitle,
  pathTitle,
}: {
  children: React.ReactNode
  title: string
  description: string
  oldPath: string
  oldPathTitle: string
  pathTitle: string
}) {
  return (
    <div className='p-8 space-y-8 max-w-4xl mx-auto w-full'>
      <AccountBreadcrumb pathTitle={pathTitle} oldPath={oldPath} oldPathTitle={oldPathTitle} />
      <FormAccountHeader title={title} description={description} />
      {children}
    </div>
  )
}
