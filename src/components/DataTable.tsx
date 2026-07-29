'use client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useConfirm } from '@/hooks/use-confirm'
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

// TODO:

//Bug : Cuando se presiona f5 el indice de la tabla regresa a al primer o ultimo indice dependiendo de si se presiona startFromEnd y no se queda en el indice de la ui que estaba,

//este componente hace una llamada a db y trae 50 registros es decir esa es una pagina en db pero a su vez pica esos 50 registros en 10 y eso es lo que se muestra en la ui pero da todos estos problemas, creo que mejor seria que se llame directo a la db y se cuenten las paginas desde alla ignorando la ui mezclar paradigmas da muchos problemas y no veo las ventajas

//objetivo principal es minimizar llamadas a la DB por costo y hacer que no se sienta como que la interfaz esta cargando constantemente de 10 en 10 seria una locura y de 50 en 50 me rompe la interfaz y hace que el producto financiero sea dificil de usar para un usuario puesto que ve muchos datos en poco tiempo se frustra y abandona

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  filterKey: string
  onDelete: (rows: Row<TData>[]) => void
  disabled?: boolean
  totalPages: number
  currentPage: number
  pageSize?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  onDelete,
  disabled,
  totalPages,
  currentPage,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('handledmoney.transaction')
  const searchParams = useSearchParams()
  const startFromEnd = searchParams.get('startFromEnd') === '1'

  // ✅ Calculamos el índice inicial UNA sola vez en mount, sin efectos.
  // Como el padre le pasa `key={currentPage}`, el componente se remonta
  // cuando cambia la página servidor → initialState siempre es fresco.
  const initialPageIndex = useMemo(() => {
    if (!startFromEnd) return 0
    const clientPageCount = Math.ceil(data.length / pageSize)
    return Math.max(0, clientPageCount - 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // deps vacías: solo corre en mount, que es lo que queremos

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    // ✅ initialState solo aplica en mount → sin re-renders extra
    initialState: {
      pagination: {
        pageIndex: initialPageIndex,
        pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  const [ConfirmDialog, confirm] = useConfirm(
    t('table.confirm_title'),
    t('table.confirm_description'),
  )
  const router = useRouter()

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const urlParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) urlParams.delete(key)
        else urlParams.set(key, value)
      })
      return urlParams.toString()
    },
    [searchParams],
  )

  async function handleDelete() {
    const ok = await confirm()
    if (ok) {
      onDelete(table.getFilteredSelectedRowModel().rows)
      table.resetRowSelection()
    }
  }

  const handleNext = () => {
    if (table.getCanNextPage()) {
      table.nextPage()
    } else if (currentPage < totalPages) {
      router.push(
        `?${createQueryString({ page: (currentPage + 1).toString(), startFromEnd: null })}`,
      )
    }
  }

  const handlePrev = () => {
    if (table.getCanPreviousPage()) {
      table.previousPage()
    } else if (currentPage > 1) {
      router.push(
        `?${createQueryString({ page: (currentPage - 1).toString(), startFromEnd: '1' })}`,
      )
    }
  }

  return (
    <div>
      <ConfirmDialog />
      <div className='flex items-center py-4'>
        <Button
          onClick={handleDelete}
          disabled={disabled || table.getFilteredSelectedRowModel().rows.length === 0}
          size='sm'
          variant='outline'
          className='ml-auto font-normal text-xs'
        >
          <Trash className='size-4 mr-2' />
          {t('table.delete', { count: table.getFilteredSelectedRowModel().rows.length })}
        </Button>
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  {t('table.no_results')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex-1 text-sm mt-2 text-muted-foreground'>
        {t('table.rows_selected', {
          selected: table.getFilteredSelectedRowModel().rows.length,
          total: table.getFilteredRowModel().rows.length,
        })}
      </div>
      <div className='flex items-center justify-end space-x-2 py-4 px-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={handlePrev}
          disabled={!table.getCanPreviousPage() && currentPage === 1}
        >
          {t('table.previous')}
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={handleNext}
          disabled={!table.getCanNextPage() && currentPage === totalPages}
        >
          {t('table.next')}
        </Button>
      </div>
    </div>
  )
}
