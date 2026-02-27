import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { SelectedColumns } from './interfaces'
import { TableHeadSelected } from './TableHeadSelected'

type Props = {
  headers: string[]
  body: string[][]
  selectedColumns: SelectedColumns
  onTableHeadSelectChange: (columnIndex: number, value: string | null) => void
}

export const ImportTable = ({ headers, body, selectedColumns, onTableHeadSelectChange }: Props) => {
  return (
    <div className='rounded-md border overflow-hidden'>
      <Table>
        <TableHeader className='bg-muted'>
          <TableRow>
            {headers.map((_, index) => (
              <TableHead key={index}>
                <TableHeadSelected
                  columnIndex={index}
                  selectedColumns={selectedColumns}
                  onChange={onTableHeadSelectChange}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {body.map((row: string[], index) => (
            <TableRow key={index}>
              {row.map((cell, index) => (
                <TableCell key={index}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
