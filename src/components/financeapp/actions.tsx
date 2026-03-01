'use client'

import { Button } from '@/components/ui/button'

import { Edit, MoreHorizontal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

type Props = {
  id: string
}

export const Actions = ({ id }: Props) => {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'ghost'} className='size-8 p-0'>
          <MoreHorizontal className='size-4 mr-2' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={false}
          onClick={() => router.push(`/transaction/${id}/edit`)}
          className='p-2 cursor-pointer'
        >
          <Edit className='size-4 mr-2' />
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
