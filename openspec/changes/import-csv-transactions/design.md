# Design: CSV Bulk Transaction Import

## Technical Approach

Three layers. **Client**: `UploadButton` (papaparse `ParseResult<string[]>` → error surfacing → `cleanCsvRows`) → `CardContainer` (step router) → `ImportCard` (column mapping + header controls) → `ReviewImportTable` (flags + bulk actions) → submit `{ accountId, rows }`. **Action** `createTransactionsBulkAction`: session → account ownership → per-row `CreateTransactionSchema` → all-or-nothing with `{ rowIndex, field, reason }` report → `revalidatePath('/transaction')`. **Repository** `createTransactionsBulk`: one `db.transaction` — insert all rows, then a single net balance/count UPDATE. All normalization is pure (`src/lib/csv/`) so preview == submission (CSV-IMP-11). Fixes proposal defects 1–12.

## Architecture Decisions

| # | Decision | Choice | Alternatives | Rationale (req) |
|---|---|---|---|---|
| D1 | State model | Extend zustand `CSVState`: typed `importResult`, `isImporting: 'LIST'\|'IMPORT'\|'REVIEW'`, `config`, `normalizedRows` | Local container state | Flow spans 3 components; store already owns flow; `normalizedRows` is the single source → preview==submit (CSV-IMP-11). Selection Set stays **local** in `ReviewImportTable` (transient UI, mirrors `DataTable`) |
| D2 | Submit payload | `{ accountId, rows }`; server injects `accountId` into each row before validation | Per-row accountId (current) | M0.1 one-account-per-file; ownership checked once; no duplicate source of truth |
| D3 | Balance effect | Inside tx: insert all → one UPDATE `balance + netDelta`, `transactionsCount + N` | N per-row updates mirroring `createTransaction` | Commutative sums → identical final state, atomic, 1 round-trip (CSV-IMP-09, M0.6). `netDelta = Math.round((Σincome − Σexpense) * 100) / 100`, then `String()` — avoids float artifacts on numeric column |
| D4 | Duplicate timing | Continue blocked until account selected; `findDuplicateCandidates` uses `config.accountId` at normalize | Defer duplicates to submit | Rule key needs accountId (CSV-IMP-08); prevents review-then-blocked submit (CSV-IMP-01) |
| D5 | Header controls | Live in `ImportCard` header → `config`; re-normalize on Continue; review shows summary + Back-to-edit | Duplicate controls in review + reactive re-normalize | Single implementation, no divergence; CSV-IMP-04 mode-switch satisfied via re-Continue. Control change discards bulk overrides (documented) |
| D6 | Exclusion | `NormalizedRow.excluded` flag; submit filters | Delete rows | Stable indices for error-report mapping (CSV-IMP-08/09) |
| D7 | Parse typing | `IMPORT_RESULT = ParseResult<string[]>` (papaparse types) | Hand-rolled `{data, errors, meta}` | Typed `ParseError[]`/`ParseMeta` (CSV-IMP-07, defect 12) |
| D8 | Size cap | `MAX_IMPORT_ROWS = 1000`, enforced client + server | Virtualization / streaming | V1 sanity limit only; keeps review table + server action responsive (large-file note) |
| D9 | Fixtures | Inline strings in tests; no `.csv` files | Materialized `.csv` in `src/test/` | papaparse (trusted) owns file→matrix; our logic starts at `string[][]`; self-contained tests |

## Data Flow

```
CSVReader → ParseResult<string[]>
  UploadButton: errors? → toast+abort | cleanCsvRows() → cap check → CSVState.importResult, isImporting='IMPORT'
  ImportCard: mapping + controls → config; Continue(account + required mappings + normalizeRows) → isImporting='REVIEW'
  ReviewImportTable: flags + bulk bar + BulkTypeDrawer; Submit: rows.filter(!excluded) → CSVState
    → createTransactionsBulkAction({ accountId, rows })
    → session → getBankAccountById(accountId, userId) → cap → per-row safeParse({...row, accountId})
    → createTransactionsBulk(validatedRows, userId)
    → db.transaction: insert(rows) → UPDATE bank_account SET balance±net, count+N
    → revalidatePath('/transaction')
    → toast success(N) | toast report + retry (same payload)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/csv/constants.ts` | Create | `MAX_IMPORT_ROWS`, `TYPE_OPTIONS`, mapped-type vocabulary |
| `src/lib/csv/types.ts` | Create | `TypeMode`, `DateOrder`, `NumberFormat`, `ImportConfig`, `NormalizedRow`, `RowError`, `BulkImportInput` |
| `src/lib/csv/clean.ts` | Create | `cleanCsvRows(data: string[][]): string[][]` |
| `src/lib/csv/normalize.ts` | Create | `normalizeAmount`, `detectDateOrder`, `normalizeDate`, `detectType`, `normalizeRows` |
| `src/lib/csv/duplicates.ts` | Create | `findDuplicateCandidates(rows, accountId)` |
| `src/interfaces/CSV.ts` | Modify | `IMPORT_RESULT = ParseResult<string[]>`; `VARIANTS` += `REVIEW` |
| `src/interfaces/Transaction.ts` | Modify | `CSVTransaction` stays the payload row shape (no accountId — D2) |
| `src/components/UploadButton.tsx` | Modify | `results.errors` → toast + abort; `cleanCsvRows`; cap check |
| `src/components/ImportCard.tsx` | Modify | Remove hardcoded id (defect 1); header controls (account Select, type-mode, date-fmt when ambiguous, number-fmt); type mapping; Continue gates + normalize |
| `src/components/TableHeadSelected.tsx` | Modify | options += `type` (defect 8; dedupe logic already present) |
| `src/components/ReviewImportTable.tsx` | Create | M5 review: flags, `selectedIds: Set<number>` + select-all indeterminate, bulk bar, submit w/ loading (CSV-IMP-10) |
| `src/components/BulkTypeDrawer.tsx` | Create | Sheet + Select income/expense (mirrors `BulkCategoryDrawer`) |
| `src/store/CSVState.ts` | Modify | `config`, `normalizedRows`, `setConfig`, `setNormalizedRows`, `excludeRows(indices)`, `setRowType(indices, type)` |
| `src/actions/transaction/create-transaction.ts` | Modify | `createTransactionsBulkAction({accountId, rows})`: session → `getBankAccountById` → cap → per-row report → all-or-nothing → revalidate |
| `src/repository/transaction.ts` | Modify | `createTransactionsBulk(rows, userId)`: insert + net balance/count UPDATE (defect 6) |
| `messages/en.json`, `messages/es.json` | Modify | `handledmoney.transaction.import.*` keys (house style) |

## Interfaces / Contracts

```ts
// src/lib/csv/types.ts
type TypeMode = 'auto' | 'all_expenses' | 'all_income' | 'map'
type DateOrder = 'dd/mm' | 'mm/dd'
type NumberFormat = 'us' | 'eu'
interface ImportConfig {
  accountId: string            // '' = not selected
  typeMode: TypeMode
  dateOrder: DateOrder | null  // null = not yet resolved (auto-detect/selector)
  numberFormat: NumberFormat   // default 'us'
}
interface NormalizedRow {
  accountId: string
  payee: string
  notes: string
  date: string                 // 'YYYY-MM-DD' date-only — never a Date here
  amount: number               // positive
  type: 'expense' | 'income'
  possibleDuplicate: boolean
  payeeMissing: boolean
  typeConflict: boolean
  excluded: boolean
}
interface RowError { rowIndex: number; field: string; reason: string }
interface BulkImportInput { accountId: string; rows: CSVTransaction[] }
```

```ts
// src/lib/csv — pure, DOM-free signatures
normalizeAmount(raw: string, format: NumberFormat): number
detectDateOrder(samples: string[]): DateOrder | 'ambiguous'
normalizeDate(raw: string, order: DateOrder): string        // ISO passthrough; splits parts, never new Date()
detectType(input: { mode: TypeMode; mappedValue: string | null; rawAmount: string }):
  { type: 'expense' | 'income'; conflict: boolean }          // mapped wins; vocabulary case-insensitive (M0.2)
findDuplicateCandidates(rows: NormalizedRow[], accountId: string): Set<number>
normalizeRows(mappedRows: Record<string, string>[], config: ImportConfig, hasTypeColumn: boolean): NormalizedRow[]
// normalizeRows encapsulates CSV-IMP-04: mode==='auto' && !hasTypeColumn && all raw amounts unsigned → all_expenses
```

**Date (CSV-IMP-06, verified against schema)**: `transactionsTable.date` is Drizzle `timestamp()` = pg `timestamp without time zone`; node-postgres serializes/parses it using **local** components, so a local-midnight Date round-trips timezone-stably (matches `CreateTransactionForm`/`fmtDate` usage). Rule: helpers emit `YYYY-MM-DD` strings; the client converts at the payload boundary with `new Date(y, m - 1, d)` (split parts) — NEVER `new Date('2024-01-24')` (UTC midnight → off-by-one). `z.coerce.date()` passes the Date through; Drizzle stores `2024-01-24 00:00:00` local.

**Repository (D3)**:
```ts
const netDelta = rows.reduce((sum, r) => sum + (r.type === 'income' ? r.amount : -r.amount), 0)
const rounded = Math.round(netDelta * 100) / 100
await tx.update(bankAccountsTable).set({
  balance: sql`${bankAccountsTable.balance} + ${String(rounded)}`,
  transactionsCount: sql`${bankAccountsTable.transactionsCount} + ${rows.length}`,
}).where(eq(bankAccountsTable.id, rows[0].accountId))
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `normalizeAmount`, `detectDateOrder`, `normalizeDate`, `detectType`, `findDuplicateCandidates`, `cleanCsvRows`, `normalizeRows` (incl. all-positive default) | `src/test/csv-normalize.test.ts` — inline CSV 1 & 2 fixture matrices; assert string dates |
| Store | `setConfig`, `setNormalizedRows`, `excludeRows`, `setRowType` | `src/test/csv-state.test.ts` (pattern: `AccountSheetState.test.ts`) |
| Component | `ReviewImportTable`: flags render, select-all indeterminate, bulk type change, bulk exclude → payload | `src/test/review-import-table.test.tsx` — vi.hoisted `next-intl` mock; real store seeded via `useCSVState.setState` |
| Component | `UploadButton`: parse-error toast, cap rejection | `src/test/upload-button.test.tsx` — mock `react-papaparse` `CSVReader` |
| Action | `createTransactionsBulkAction`: 401; foreign account → 0 rows; per-row report; cap; success (injected accountId, `revalidatePath`); 500 | `src/test/create-transactions-bulk.action.test.ts` — vi.hoisted `auth`/repository/`next/cache`/`next/headers` |
| Repository | `createTransactionsBulk`: N inserts, single net-balance UPDATE, count +N, inside `db.transaction` | `src/test/create-transactions-bulk.repository.test.ts` — db chain mock like `categories.repository.test.ts` |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration (no schema change, no DB unique index — M0.4). Additive: old zustand shape gains fields. Rollback: revert the change; wrongly imported rows removed via existing `deleteTransaction` (reverses balance).

## Resolved Decisions (user-confirmed)

- **i18n namespace**: new strings under `handledmoney.transaction.import.*` in `en.json`/`es.json`. No key collision with in-flight `i18n-account-localization` (it adds `handledmoney.account`); both edits touch the same files, so apply sequentially to avoid file-level merge conflicts.
- **i18n code pattern (user convention — MANDATORY)**: exactly ONE translations hook per component: `const t = useTranslations('handledmoney.transaction')`, then localized strings via the full key path `t('something.delete.error_generic')`. NEVER create a second hook such as `const tt = useTranslations('handledmoney.transaction.something')`.
- **rowIndex**: backend reports 0-based indices over the submitted (post-exclusion) `rows` array; the UI displays `+1` to the user.
- **Out of scope in V1 (confirmed)**: 2-digit years (`1/1/24`) and accounting-notation negatives (`(1.234,56)`) are documented limits, not supported.

## Traceability

| Design element | Requirement |
|----------------|-------------|
| Account Select + ownership check + blocked submit | CSV-IMP-01 (M0.1) |
| `type` mapping option + column dedupe + progress | CSV-IMP-02 |
| Type-mode selector + vocabulary + `typeConflict` flag | CSV-IMP-03 (M0.2) |
| All-positive default + re-normalize on mode switch | CSV-IMP-04 |
| `normalizeAmount` + manual US/EU selector | CSV-IMP-05 (M0.8) |
| `detectDateOrder`/`normalizeDate` + local-midnight conversion | CSV-IMP-06 (M0.3) |
| `cleanCsvRows` + parse-error toast + typed `IMPORT_RESULT` | CSV-IMP-07 (M4) |
| `findDuplicateCandidates` + review flags + bulk actions + `excluded` | CSV-IMP-08 (M0.4, M0.7) |
| Action validation + per-row report + all-or-nothing + net balance UPDATE | CSV-IMP-09 (M0.6, M0.9) |
| Loading state + toasts + retry | CSV-IMP-10 (M7) |
| Pure helpers shared by preview and submit | CSV-IMP-11 |
