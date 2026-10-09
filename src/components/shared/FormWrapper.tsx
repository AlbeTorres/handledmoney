import { Breadcrumb } from './Breadcrumb'
import { FormHeader } from './FormHeader'

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
    <div className='container flex w-full flex-col gap-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10'>
      <Breadcrumb pathTitle={pathTitle} oldPath={oldPath} oldPathTitle={oldPathTitle} />
      <FormHeader title={title} description={description} />
      {children}
    </div>
  )
}
