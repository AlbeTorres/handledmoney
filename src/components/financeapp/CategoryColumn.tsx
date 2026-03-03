import { TriangleAlertIcon } from 'lucide-react'

type Props = {
  categoryName?: string
}

export const CategoryColumn = ({ categoryName }: Props) => {
  return (
    <div className='flex items-center cursor-pointer hover:underline'>
      {categoryName ? (
        categoryName
      ) : (
        <span className='flex gap-1 text-red-500'>
          <TriangleAlertIcon className='size-4' /> Uncategorized
        </span>
      )}
    </div>
  )
}
