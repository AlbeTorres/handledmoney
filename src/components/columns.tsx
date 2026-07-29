'use client'

import { fmtDate } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Transaction } from '../interfaces'
import { CategoryColumn } from './CategoryColumn'
import { Actions } from './actions'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'

type TFunction = (key: string, params?: Record<string, string | number | Date>) => string

export function getColumns(t: TFunction): ColumnDef<Transaction>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.header_date')}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        )
      },
      cell: ({ row }) => {
        return fmtDate(row.original.date)
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.header_amount')}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        )
      },
    },
    {
      accessorKey: 'accountName',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.header_account')}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <p>{row.original.accountName}</p>
      },
    },
    {
      accessorKey: 'categoryName',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.header_category')}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <CategoryColumn categoryName={row.original.categoryName} />
      },
    },
    {
      accessorKey: 'notes',
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.header_notes')}
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <Actions id={row.original.id} />,
    },
  ]
}
