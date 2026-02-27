import { Row } from '@tanstack/react-table'
import { DataTable } from './DataTable'

import { incomecolumns } from './IncomeColumns'
import { IncomeTransaction } from './financeapp/interfaces'

type Props = {
  data: IncomeTransaction[]
}

export default function IncomeTable({ data }: Props) {
  function deleteIncomeTransaction(rows: Row<IncomeTransaction>[]) {
    const ids = rows.map(row => row.original.id)
    console.log('Deleting these ids:', ids)
  }

  return (
    <DataTable
      columns={incomecolumns}
      data={data}
      filterKey='date'
      onDelete={deleteIncomeTransaction}
    />
  )
}
