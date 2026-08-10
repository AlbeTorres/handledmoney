import type { NormalizedRow } from './types'

/**
 * Finds candidate duplicate rows (M0.4): rows sharing account + date + amount
 * + payee. Flag-only — duplicates are NEVER auto-skipped; the user decides via
 * bulk exclusion in review (CSV-IMP-08). No DB unique index.
 *
 * Returns the 0-based indices of every row that has at least one twin
 * (so the first occurrence of a twin group is flagged too).
 */
export function findDuplicateCandidates(
  rows: NormalizedRow[],
  accountId: string,
): Set<number> {
  const seen = new Map<string, number>()
  const duplicates = new Set<number>()

  rows.forEach((row, index) => {
    const key = `${accountId}|${row.date}|${row.amount}|${row.payee.trim().toLowerCase()}`
    const firstIndex = seen.get(key)
    if (firstIndex === undefined) {
      seen.set(key, index)
    } else {
      duplicates.add(firstIndex)
      duplicates.add(index)
    }
  })

  return duplicates
}
