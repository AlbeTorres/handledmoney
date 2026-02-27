import { Breadcrumb } from './Breadcrumb'
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
    <div className='p-8 space-y-8 container mx-auto'>
      <Breadcrumb pathTitle={pathTitle} oldPath={oldPath} oldPathTitle={oldPathTitle} />
      <FormAccountHeader title={title} description={description} />
      {children}
    </div>
  )
}
