/**
 * Removes trailing empty cells from every row and drops fully empty rows
 * (CSV-IMP-07, defect 11). Both fixtures end with `,,,`; this keeps the
 * header row (mapping needs the column names) and aligns every row to the
 * trimmed header width.
 */
export function cleanCsvRows(data: string[][]): string[][] {
  return data
    .map(row => trimTrailingEmptyCells(row))
    .filter(row => row.some(cell => cell.trim() !== ''))
}

function trimTrailingEmptyCells(row: string[]): string[] {
  let end = row.length
  while (end > 0 && row[end - 1].trim() === '') {
    end -= 1
  }
  return row.slice(0, end)
}
