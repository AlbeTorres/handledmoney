# CSV Import Specification

## Purpose

Bulk import of real bank and expense-app CSV exports into a selected account: upload, column mapping, normalization, review with per-row flags, and atomic persistence with correct balance effects and a per-row error report. This is the canonical capability spec for `csv-import`.

## Requirements

### Requirement: CSV-IMP-01 — Account Selection (M0.1)

ONE account per file. The import header MUST provide an account Select; the `accountId` MUST come from the UI, never hardcoded and never decided by the backend. The backend MUST validate that the account belongs to the session user. Submission MUST be blocked until an account is selected.

#### Scenario: Account chosen in header

- GIVEN the import flow with the user's accounts fetched
- WHEN the user selects an account and completes mapping/review
- THEN the submit payload includes the selected `accountId` and only that account is affected

#### Scenario: No account selected

- GIVEN the import flow with no account selected
- WHEN the user attempts to submit
- THEN the UI blocks submission and prompts for account selection

#### Scenario: Foreign account rejected

- GIVEN an authenticated user submitting to an account owned by another user
- WHEN the server action runs
- THEN the action rejects with an error and inserts zero rows

### Requirement: CSV-IMP-02 — Column Mapping (M0.2, M5)

The mapping step MUST offer `amount`, `date`, `payee`, `notes`, and an optional `type` mapping. A source column MUST NOT be mapped to two targets. The user MUST NOT proceed to review until the required mappings are complete; the mapping step MUST show progress and what remains.

#### Scenario: Complete mapping

- GIVEN a parsed CSV with headers `Date,Description,Amount`
- WHEN the user maps all required columns
- THEN the flow proceeds to normalization/review

#### Scenario: Duplicate mapping rejected

- GIVEN the same source column selected for a second target
- WHEN the mapping is applied
- THEN the second selection is rejected or flagged and the flow does not proceed until resolved

#### Scenario: Incomplete mapping blocks progress

- GIVEN one or more required columns unmapped
- WHEN the user tries to proceed
- THEN the flow stays on mapping and progress indicates the missing targets

### Requirement: CSV-IMP-03 — Type Resolution (M0.2, M0.5)

A per-file mode selector MUST offer: Auto by sign (default), All expenses, All income, Map a type column. Mapped-column vocabulary MUST be case-insensitive: `DEBIT|CREDIT`, `D|C`, `+|−`, `expense|income`, `DSLIP→income`. A mapped column MUST win over sign. A conflict between mapped value and sign MUST flag the row `typeConflict` — never silently choose. Categories MUST be ignored (M0.5).

#### Scenario: Bank Details mapped (CSV 2)

- GIVEN a CSV 2 row with `Details=DEBIT`
- WHEN the type mapping is applied
- THEN the row normalizes to `expense`; `CREDIT` and `DSLIP` rows normalize to `income`

#### Scenario: Mapped column wins over sign

- GIVEN a row whose mapped type value conflicts with its amount sign
- WHEN normalization runs
- THEN the mapped type is used

#### Scenario: Type-vs-sign conflict flagged

- GIVEN a row mapped to `expense` whose sign indicates credit
- WHEN normalization runs
- THEN the row is flagged `typeConflict` and shown in review; no type is silently chosen (the user may override it via bulk actions)

#### Scenario: Unmapped bank codes ignored

- GIVEN a CSV 2 `Type` column containing bank codes (`DR`, `CR`, `DP`)
- WHEN the user maps `Details` but not `Type`
- THEN the bank codes have no effect on normalization

### Requirement: CSV-IMP-04 — Default Type for Sign-Only Files (explicit decision)

For an all-positive file with no mapped type column in Auto-by-sign mode, no polarity exists to detect; the system MUST default every row to `expense` and MUST allow the user to switch the mode, re-normalizing on change.

Tradeoff: expense-tracking exports (CSV 1) are the common migration case, so `expense` is the safe default; wrong polarity on income-only files is mitigated by the mode switch and by the review screen showing every row's type before submit.

#### Scenario: All-positive file defaults to expense (CSV 1)

- GIVEN an all-positive CSV 1 with no type column, Auto-by-sign mode
- WHEN normalization runs
- THEN every row gets `type=expense` and the review screen shows that type

#### Scenario: Mode switch re-normalizes

- GIVEN the same file after the expense default
- WHEN the user switches the mode to "All income"
- THEN every row re-normalizes to `type=income`

### Requirement: CSV-IMP-05 — Amount Normalization (M0.8, M0.9)

A manual number-format selector MUST support US `1,234.56` and EU `1.234,56`. Currency symbols MUST be stripped. Amounts MUST be stored positive, with polarity carried by `type`. An amount that is zero or negative after normalization MUST be reported as an invalid row.

#### Scenario: EU format

- GIVEN the EU number format and the value `1.234,56`
- WHEN normalization runs
- THEN the amount is `1234.56`

#### Scenario: Currency symbol stripped

- GIVEN the value `$100.00` (CSV 1)
- WHEN normalization runs
- THEN the amount is `100.00`

#### Scenario: Signed amount stored positive

- GIVEN `-25.00` in Auto-by-sign mode
- WHEN normalization runs
- THEN the amount is stored as positive `25.00` with `type=expense`

#### Scenario: Zero/negative after normalization is invalid

- GIVEN an amount that normalizes to zero or negative
- WHEN the row is submitted
- THEN the backend report marks it invalid with `field=amount` and a reason, and nothing is inserted

### Requirement: CSV-IMP-06 — Date Normalization (M0.3)

Date order MUST be auto-detected from sample rows: first part > 12 → DD/MM; second part > 12 → MM/DD. If both parts are ≤ 12, a format selector MUST be shown, defaulting by persisted locale (es → DD/MM, en → MM/DD). Dates MUST be normalized to `YYYY-MM-DD` date-only values; raw date strings MUST NOT be fed to `new Date()` (UTC off-by-one).

#### Scenario: Unambiguous MM/DD (CSV 1)

- GIVEN `1/24/2024` (second part > 12)
- WHEN normalization runs
- THEN the date is `2024-01-24` with no selector shown

#### Scenario: Ambiguous date with locale bias (CSV 2)

- GIVEN `08/10/2026` (both parts ≤ 12)
- WHEN the selector resolves with en bias (MM/DD)
- THEN the date is `2026-08-10`; with es bias (DD/MM) it is `2026-10-08`

#### Scenario: No UTC shift

- GIVEN a normalized date-only value `2024-01-24`
- WHEN it is stored and re-read in any timezone
- THEN it remains `2024-01-24` with no off-by-one

### Requirement: CSV-IMP-07 — Robust Parsing (M4)

Trailing empty columns and fully empty rows MUST be filtered before mapping. papaparse errors MUST be surfaced to the user — a failed parse MUST NOT silently continue. The import result type MUST reflect papaparse's `ParseResult` (typed errors/meta).

#### Scenario: Trailing empties filtered (CSV 1)

- GIVEN a CSV 1 file whose rows end with `,,,`
- WHEN the file is parsed
- THEN no empty trailing columns appear in the preview

#### Scenario: Fully empty row dropped

- GIVEN a CSV containing a row of only empty cells
- WHEN the file is parsed
- THEN the empty row is dropped before mapping

#### Scenario: Parse error surfaced

- GIVEN a malformed CSV that produces papaparse errors
- WHEN the file is parsed
- THEN the error is surfaced to the user and no import proceeds

### Requirement: CSV-IMP-08 — Review & Confirmation (M0.4, M0.7, M5)

Before submit, the system MUST show a normalized review table with per-row flags `possibleDuplicate`, `payeeMissing`, `typeConflict`. Rows sharing the same account, date, amount, and payee MUST be flagged as duplicate candidates — never auto-skipped (M0.4). Rows without payee MUST be flagged and the user decides exclude or keep — never an auto-placeholder (M0.7). The review MUST support bulk selection with bulk actions to change type and to exclude duplicates. The rows shown in review MUST be exactly the rows submitted.

#### Scenario: Legit duplicates preserved (CSV 1)

- GIVEN three identical `$3.49 Rebtel` rows (CSV 1)
- WHEN review renders
- THEN all three are flagged `possibleDuplicate` and none is auto-skipped or removed

#### Scenario: Bulk duplicate exclusion

- GIVEN flagged duplicate rows selected in bulk
- WHEN the user applies the bulk exclude action
- THEN the excluded rows are removed from the submit payload

#### Scenario: Bulk type change

- GIVEN several rows selected in bulk
- WHEN the user applies a bulk type change
- THEN all selected rows update their type before submission

#### Scenario: Payee-missing rows

- GIVEN a row with an empty payee
- WHEN review renders
- THEN the row is flagged `payeeMissing`; if the user keeps it, the backend report marks it invalid (payee required) and the all-or-nothing rule applies; if the user excludes it, it is dropped

### Requirement: CSV-IMP-09 — Atomic Persistence & Balance (M0.6, M0.9, M1)

The bulk action MUST re-validate the session, validate that `accountId` belongs to the session user, and validate every row against `CreateTransactionSchema`. Persistence MUST be all-or-nothing: no partial insert. On failure, the action MUST return a per-row report `{ rowIndex, field, reason }`. Inside the same `db.transaction`, the action MUST apply per-row balance effects identical to `createTransaction` (income `+`, expense `−`) and `transactionsCount + 1`, then `revalidatePath('/transaction')`. No DB unique index (M0.4).

#### Scenario: Successful import (fixture-verified)

- GIVEN CSV 2 rows normalized for a valid account (income 2000.00, income 500.00, expense 120.50)
- WHEN the bulk action runs
- THEN three transactions are inserted, the account balance changes by exactly `+2379.50`, `transactionsCount` increases by 3, and `/transaction` is revalidated

#### Scenario: All-or-nothing on one bad row

- GIVEN a payload where one row fails `CreateTransactionSchema` (e.g., zero amount)
- WHEN the bulk action runs
- THEN zero rows are inserted and the report lists that row as `{ rowIndex, field, reason }`

#### Scenario: Unauthorized or foreign account

- GIVEN no session, or an account owned by another user
- WHEN the bulk action runs
- THEN the action rejects and inserts zero rows

### Requirement: CSV-IMP-10 — UX States (M7)

During submit the UI MUST show a real loading state and prevent double submission. Outcomes MUST produce actionable toasts: success with the inserted count; failure with the per-row error summary. After a failure the user MUST be able to retry with the same payload.

#### Scenario: Loading during submit

- GIVEN a completed review and a valid account
- WHEN the user submits
- THEN a loading state is shown and the submit control is disabled until completion

#### Scenario: Success toast

- GIVEN a successful import of N rows
- WHEN the action resolves
- THEN a success toast reports N inserted rows

#### Scenario: Failure and retry

- GIVEN an import that fails with per-row errors
- WHEN the action rejects
- THEN the toast summarizes the report and retry re-submits the unchanged payload

### Requirement: CSV-IMP-11 — Pure Normalization Logic

Amount, date-order, type, and duplicate-candidate logic MUST be provided as pure, deterministic functions in `src/lib/csv/` (`normalizeAmount`, `detectDateOrder`, `detectType`, `findDuplicateCandidates`) usable without a DOM, so the preview and the submission share identical results and the logic is unit-testable.

#### Scenario: DOM-free unit tests

- GIVEN the normalization helpers
- WHEN they are tested in `src/test/` per repo convention (vi.hoisted mocks)
- THEN each helper is verified against the fixture values without requiring a browser

#### Scenario: Preview equals submission

- GIVEN normalized rows rendered in the review table
- WHEN the user submits
- THEN the backend receives exactly the rows and values shown in review

## Test Fixtures

Test data for verification, covering the documented edge cases.

### Fixture CSV 1 — expense-app export (MM/DD dates, all-positive, no type column, trailing empties, legit duplicates)

```csv
Date,Description,Category,Amount,Year,Month,Day,,,,
1/24/2024,Rebtel,Phone,$3.49,2024,1,24,,,,
1/24/2024,Rebtel,Phone,$3.49,2024,1,24,,,,
1/24/2024,Rebtel,Phone,$3.49,2024,1,24,,,,
1/25/2024,Opening balance,General,$100.00,2024,1,25,,,,
```

Expected: 4 rows parsed; trailing empties filtered; dates `2024-01-24`/`2024-01-25`; amounts `3.49`/`100.00`; all rows `type=expense` (sign-only default); the three Rebtel rows flagged `possibleDuplicate`; balance delta `−110.47`.

### Fixture CSV 2 — bank statement (Details DEBIT/CREDIT/DSLIP, ambiguous date, signed amounts, bank Type codes)

```csv
Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
DEBIT,08/10/2026,Grocery Store,-120.50,DR,1879.50,
CREDIT,08/10/2026,Client Payment,+2000.00,CR,3879.50,
DSLIP,08/10/2026,Cash Deposit,500.00,DP,4379.50,
```

Expected with `Details` mapped and en-biased date resolution (MM/DD): 3 rows; dates `2026-08-10`; DEBIT→expense 120.50; CREDIT→income 2000.00; DSLIP→income 500.00; bank codes `DR/CR/DP` ignored; balance delta `+2379.50`.
