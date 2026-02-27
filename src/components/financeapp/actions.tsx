'use client'

import { Button } from '@/components/ui/button'

import { useTransactionState } from '@/store'
import { Edit, MoreHorizontal } from 'lucide-react'
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
  const { onOpen } = useTransactionState()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={'ghost'} className='size-8 p-0'>
          <MoreHorizontal className='size-4 mr-2' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled={false} onClick={() => onOpen(id)}>
          <Edit className='size-4 mr-2' />
          Edit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
