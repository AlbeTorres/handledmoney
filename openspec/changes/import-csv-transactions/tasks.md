# Tasks: CSV Bulk Transaction Import (import-csv-transactions)

> Guards: ONE `t = useTranslations('handledmoney.transaction')` hook per component, full-path keys, never `tt`; strings under `transaction.import.*` (en/es); rowIndex 0-based, UI +1; no 2-digit years / accounting negatives.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1900–2300 (16 src + 7 test files + 2 messages) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 Foundation → PR2 Client → PR3 Backend |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending — user decides |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Foundation | PR 1 | `npx vitest run 'src/test/{csv-normalize,csv-state}.test.ts'` | N/A — no DOM | delete `src/lib/csv/`; revert interfaces + store |
| 2 | Client + i18n | PR 2 | `npx vitest run 'src/test/{upload-button,import-card,review-import-table}.test.tsx'` | manual `/transaction/bulk` | revert components + CardContainer; drop `import.*` keys |
| 3 | Backend | PR 3 | `npx vitest run 'src/test/{create-transactions-bulk.action,create-transactions-bulk.repository}.test.ts'` | N/A — mocked DB | revert action + repository |

## Phase 1: Foundation

- [x] 1.1 Create `src/lib/csv/types.ts` (TypeMode, DateOrder, NumberFormat, ImportConfig, NormalizedRow, RowError, BulkImportInput) + `constants.ts` (MAX_IMPORT_ROWS=1000, TYPE_OPTIONS, vocabulary) — D1/D8
- [x] 1.2 Create `src/lib/csv/{clean,duplicates,normalize}.ts` (`cleanCsvRows`, `findDuplicateCandidates`, `normalizeAmount`/`detectDateOrder`/`normalizeDate`/`detectType`/`normalizeRows` w/ all-positive→expense) + test `src/test/csv-normalize.test.ts` (CSV 1 & 2 fixtures; EU `1.234,56`; `-25.00`→expense; date biases; empties; 3× Rebtel dups; default) — CSV-IMP-03..08, 11
- [x] 1.3 Modify `src/interfaces/CSV.ts` (`IMPORT_RESULT = ParseResult<string[]>`, `VARIANTS += REVIEW`); keep `CSVTransaction` payload shape (date `Date`, no accountId — D2) — CSV-IMP-07
- [x] 1.4 Modify `src/store/CSVState.ts` (`isImporting 'LIST'|'IMPORT'|'REVIEW'`; `config`, `normalizedRows`, `setConfig`, `setNormalizedRows`, `excludeRows`, `setRowType`) + test `src/test/csv-state.test.ts` — D1

## Phase 2: Client

- [x] 2.1 Modify `src/components/UploadButton.tsx` (errors→toast+abort; `cleanCsvRows`; cap `>MAX_IMPORT_ROWS`→toast; setResults→IMPORT; one t hook) + test `src/test/upload-button.test.tsx` (mock `CSVReader`; parse-error toast; cap) — CSV-IMP-07, D8
- [x] 2.2 Modify `src/components/TableHeadSelected.tsx`: options += `type` (defect 8) — CSV-IMP-02
- [x] 2.3 Modify `src/components/ImportCard.tsx` (remove hardcoded id + dead `formatDate`; header controls→`config`: account Select, type-mode, date-fmt when ambiguous + locale bias, number-fmt; Continue gates account + required mappings, incl. type when mode=map; `normalizeRows`→REVIEW; one t hook) + test `src/test/import-card.test.tsx` (blocked w/o account/mapping; REVIEW transition; mode-switch re-normalize) — CSV-IMP-01..06
- [x] 2.4 Create `src/components/ReviewImportTable.tsx` (flags `possibleDuplicate`/`payeeMissing`/`typeConflict`; `selectedIds: Set<number>` + indeterminate select-all; bulk bar + `BulkTypeDrawer.tsx`; exclude→`excluded`; submit `filter(!excluded)` + loading/disable; rows +1; report + retry) + test `src/test/review-import-table.test.tsx` (vi.hoisted next-intl; flags, select-all, bulk type change, exclude→payload) — CSV-IMP-08/10
- [x] 2.5 Modify `src/app/(financeapp)/transaction/bulk/CardContainer.tsx`: REVIEW variant→review table; submit `{accountId, rows}`; success (count)/failure toasts + retry; reset; `page.tsx` unchanged — CSV-IMP-01/10

## Phase 3: Backend

- [x] 3.1 Modify `src/actions/transaction/create-transaction.ts`: `createTransactionsBulkAction({accountId, rows})` — session→`getBankAccountById(accountId, userId)`→cap→per-row `safeParse({...row, accountId})`→`RowError[]` (0-based rowIndex, field, reason)→all-or-nothing→`revalidatePath('/transaction')` + test `src/test/create-transactions-bulk.action.test.ts` (401; foreign account→0 rows; report; cap; success injected accountId; 500) — CSV-IMP-01/05/09
- [x] 3.2 Modify `src/repository/transaction.ts`: `createTransactionsBulk(rows, userId)` — insert all in one `db.transaction`; single net UPDATE balance (rounded `String`) + count +N (defect 6) + test `src/test/create-transactions-bulk.repository.test.ts` (db-chain + `db.transaction` mock; inserts; net-balance; count) — D3, CSV-IMP-09

## Phase 4: i18n & wiring

- [x] 4.1 Add `handledmoney.transaction.import.*` to `messages/en.json` + `es.json`: upload errors, controls, type modes, formats, flags, bulk, submit/loading, toasts, report
- [x] 4.2 Final wiring: grep — no hardcoded accountId, no `tt`; `npx tsc --noEmit` + full vitest run; review rows == submitted rows (CSV-IMP-11)
