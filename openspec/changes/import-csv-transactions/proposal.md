# Proposal: CSV Bulk Transaction Import

## Intent

**Business problem.** Users cannot import real bank/app exports into the app. The half-built bulk import flow is unusable: it writes to a hardcoded account, forces every row to `expense`, mis-parses amounts and dates, and silently skips updating account balances — corrupting the data users trust most.

**Product outcome.** A user uploads any real CSV (expense-app export or bank statement), maps columns, reviews normalized rows with flags (duplicates, conflicts, missing payees), and imports atomically with correct balance effects and a per-row error report.

**Target users & situations.** Self-hosted users migrating from another expense app (fixture CSV 1); freelancers/small businesses importing bank statements monthly (fixture CSV 2). Moment of use: first migration or monthly reconciliation.

## Scope

### In Scope — first slice: ONE OpenSpec change covering all 8 modules (M0.10)

| Module | Deliverable |
|--------|-------------|
| M1 Account selection | Des-hardcode accountId; Select in import header wired to submit; backend validates ownership |
| M2 Column mapping | Add `type` mapping option; keep amount/date/payee/notes; column dedupe; mapping progress |
| M3 Normalization | Sign → type; positive amounts; date normalization; number format; CSV row → valid transaction |
| M4 Robust parsing | Filter trailing empty columns / full-empty rows; surface papaparse errors; proper `IMPORT_RESULT` typing |
| M5 Review & confirmation (NEW) | Normalized preview; per-row flags (possible duplicate, invalid payee, type-vs-sign conflict); bulk checkbox pattern reused from `DataTable.tsx` (`selectedIds` Set + bulk bar + Sheet drawer like `BulkCategoryDrawer`) for: mark type in bulk, exclude duplicates in bulk, future account change in bulk |
| M6 Backend persistence | Per-row error report; account ownership validation; balance effect in bulk identical to `createTransaction`; all-or-nothing; `revalidatePath` |
| M7 UX polish | Real loading state during submit; actionable toasts; retry |

### Out of Scope

- Category matching / auto-categorization (V2 — categorize afterwards with existing `BulkCategoryDrawer`; auto-match by name is V2)
- Per-row account selection as primary flow (hybrid override is a future evolution via the bulk pattern)
- Multi-account CSV via an Account column mapping (future; design must not preclude it)
- The paywall TODO in `UploadButton`
- Timezone-based date parsing (PreferencesSettings timezone select is cosmetic — no state/persistence)

## Business Rules (product decisions, verbatim)

- **M0.1 — Account model**: ONE account per file. A Select in the import header. accountId decided in UI, never hardcoded, never decided by backend. Backend must validate account belongs to user.
- **M0.2 — Type detection**: per-file mode selector: Auto by sign (default) / All expenses / All income / Map a type column (optional, advanced). Vocabulary for mapped column: DEBIT\|CREDIT, D\|C, +\|-, expense\|income, DSLIP→income (case-insensitive). Mapped column WINS over sign. Conflict column-vs-sign → flag row for review, never silently choose.
- **M0.3 — Date format**: auto-detection with fallback: sample rows; if first part > 12 → DD/MM; if second > 12 → MM/DD; ambiguous (both ≤ 12) → show format selector in header; bias ambiguous default by persisted locale (es → DD/MM, en → MM/DD). Normalize to YYYY-MM-DD date-only to avoid UTC shift (new Date('2024-01-24') parses UTC midnight → off-by-one in UTC-3). Timezone setting in PreferencesSettings is cosmetic only (no state/persistence) — do NOT depend on it; note as future settings dependency.
- **M0.4 — Duplicates**: detect candidates (accountId+date+amount+payee), flag them in the review screen, user excludes via bulk checkboxes. NEVER auto-skip (CSV 1 has 3 identical $3.49 rows that may be legit). No DB unique index.
- **M0.5 — Categories**: IGNORE in V1. Categorize afterwards with existing BulkCategoryDrawer in transactions table. Auto-match by name is V2.
- **M0.6 — Balance**: bulk import MUST apply the same balance effect as createTransaction (income adds, expense subtracts) inside the atomic transaction. This fixes the verified bug where bulk insert doesn't touch balance.
- **M0.7 — Rows without payee**: mark invalid in review, user decides (exclude or keep). Never auto-placeholder.
- **M0.8 — Number format**: MANUAL selector in header (user explicitly chose manual over auto-detection): US 1,234.56 vs EU 1.234,56 handling.
- **M0.9 — Persistence errors**: all-or-nothing with a detailed per-row report (which row failed and why). No partial insert in V1.
- **M0.10 — Scope**: ONE OpenSpec change covering all 8 modules. PR split decided later in tasks phase via ask-on-risk.

## Current State & Verified Gaps

Flow today: `bulk/page.tsx` (server, fetches accounts) → `CardContainer.tsx` → `UploadButton.tsx` (react-papaparse → zustand) → `ImportCard.tsx` (mapping) → direct submit. Verified defects:

| # | Gap | Evidence |
|---|-----|----------|
| 1 | accountId HARDCODED | `ImportCard.tsx:113` passes literal `'50a7cbca-37f0-4995-8e0e-8a3c4b7a478d'` |
| 2 | `accounts` prop never used | `CardContainer.tsx:13` destructures `accounts`, never reads it |
| 3 | Every row forced to `expense` | `ImportCard.tsx:110` `type: 'expense'` |
| 4 | Broken amount cleanup (isNaN branch) | `ImportCard.tsx:107-109`: EU `1.234,56` → `1.23456`; signed `-25.00` stays negative → rejected by `.positive()` |
| 5 | Date parsing assumes US + naive `new Date()` | `ImportCard.tsx:106`; date-fns `formatDate` commented out (lines 15-35); `new Date('2024-01-24')` = UTC midnight → off-by-one in UTC-3 |
| 6 | Bulk insert never updates balance/count | `repository/transaction.ts:296-314` `createTransactionsBulk` inserts only; `createTransaction` (lines 48-56) applies sign-based balance + `transactionsCount` |
| 7 | No account ownership validation in bulk action | `create-transaction.ts:57-103` validates schema only (`accountId` = `min(1)` string) |
| 8 | No `type` column mapping option | `TableHeadSelected.tsx:11` options only `['amount','payee','notes','date']` |
| 9 | No review screen — parse → map → submit blind | `CardContainer.tsx:43-53`; no flags, no duplicate detection, no confirmation |
| 10 | Generic per-row errors | `create-transaction.ts:70` `{ index, error: 'Invalid fields in transaction' }` |
| 11 | Trailing empty columns not filtered; raw rows rendered | `ImportTable.tsx:29-37`; both fixtures end with `,,,` |
| 12 | `IMPORT_RESULT` mistyped | `interfaces/CSV.ts:1-5` `errors: []`, `meta: {}` — not papaparse `ParseResult` |

## Capabilities

> Contract for sdd-spec. `openspec/specs/` is empty — no existing capabilities, so only new ones.

### New Capabilities
- `csv-import`: end-to-end bulk transaction import — upload, column mapping, normalization, review with flags, atomic persistence with balance effect and per-row error report. Covers modules M1–M7.

### Modified Capabilities
- None (`openspec/specs/` is empty; single-transaction behavior stays compatible via the shared `CreateTransactionSchema`).

## Approach

Three layers, all inside one change:

1. **Client pipeline** (UploadButton → ImportCard → NEW review screen): parse with react-papaparse (keep raw rows); filter trailing empty columns and full-empty rows; map columns (add `type`); normalize per header controls — type mode selector, date format selector, number format selector (M0.2/M0.3/M0.8); produce `NormalizedRow[]` (accountId, payee, notes, date as `YYYY-MM-DD`, positive amount, type) with per-row flags (`possibleDuplicate`, `payeeMissing`, `typeConflict`); review screen reuses DataTable's `selectedIds` Set + bulk bar + Sheet drawer (BulkCategoryDrawer pattern) for bulk type change / duplicate exclusion / future account change; submit sends `{ accountId, rows }`.
2. **Server action** (`createTransactionsBulkAction`): re-validate session; validate `accountId` belongs to the session user; validate every row with `CreateTransactionSchema`; all-or-nothing; return detailed per-row report `{ rowIndex, field, reason }`; `revalidatePath('/transaction')`.
3. **Repository** (`createTransactionsBulk`): keep the single `db.transaction`; inside it, after insert, apply per-row balance effect identical to `createTransaction` (income `+`, expense `-`) plus `transactionsCount + 1`. No DB unique index (M0.4).

New `src/lib/csv/` helpers: `normalizeAmount`, `detectDateOrder`, `detectType`, `findDuplicateCandidates` — pure, unit-testable without DOM.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/(financeapp)/transaction/bulk/page.tsx` | Modified | Keep account fetch; pass to container |
| `src/app/(financeapp)/transaction/bulk/CardContainer.tsx` | Modified | Wire account Select; review step state; submit payload `{ accountId, rows }` |
| `src/components/UploadButton.tsx` | Modified | Filter empty rows/cols; papaparse error surfacing |
| `src/components/ImportCard.tsx` | Modified | Des-hardcode accountId; header controls (account, type mode, date fmt, number fmt) |
| `src/components/ImportTable.tsx`, `TableHeadSelected.tsx` | Modified | Add `type` option; column dedupe |
| `src/components/ReviewImportTable.tsx` | New | M5 review screen (flags + bulk bar + drawer) |
| `src/store/CSVState.ts` | Modified | Proper `IMPORT_RESULT` typing; review state |
| `src/interfaces/CSV.ts`, `src/interfaces/Transaction.ts` | Modified | `CSVTransaction` + accountId; papaparse result typing |
| `src/lib/csv/*` | New | `normalizeAmount` / `detectDateOrder` / `detectType` / `findDuplicateCandidates` |
| `src/actions/transaction/create-transaction.ts` | Modified | Ownership check; per-row report; all-or-nothing |
| `src/repository/transaction.ts` | Modified | `createTransactionsBulk` balance + count effect |
| `src/test/{ComponentName}.test.tsx` | New | Tests alongside code per repo convention (vi.hoisted mocks) |

## Edge Cases

- **CSV 1** (expense app): headers `Date,Description,Category,Amount,Year,Month,...`; `1/24/2024`; `$100.00` positive; no type column; trailing `,,,`. → `1/24/2024`: second > 12 → MM/DD; `$100.00` → 100.00; trailing empties filtered; **all-positive file → sign mode has no polarity**: default to expense (expense-tracking export), user can switch mode.
- **CSV 1 duplicates**: three identical `$3.49 Rebtel` rows → flagged as candidates, never auto-skipped (M0.4).
- **CSV 2** (bank): `Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #`; DEBIT/CREDIT/DSLIP; `08/10/2026`; signed amounts; bank codes in Type column. → map `Details` to type: DEBIT→expense, CREDIT→income, DSLIP→income; sign used only when no mapped column; conflicts flagged.
- **Date ambiguity** (both parts ≤ 12, e.g. `01/02/2024`): header selector; default biased by persisted locale (es → DD/MM, en → MM/DD).
- **UTC shift**: never feed raw date strings to `new Date()`; normalize to `YYYY-MM-DD` before storage.
- **Type-vs-sign conflict**: mapped column says expense, sign says credit → flag `typeConflict`, never silently choose.
- **Row without payee** → flag `payeeMissing`, user excludes or keeps (M0.7).
- **Zero/negative amount after normalization** → invalid row in report.
- **Large files**: review-table performance cap documented in design; V1 keeps a sanity limit only.

## Tradeoffs

- Manual number-format selector (M0.8) over auto-detection: deterministic, one less heuristic; costs one header control.
- Flag-only duplicate detection over auto-skip/unique index: preserves legit duplicates (CSV 1); costs a review step.
- All-or-nothing + per-row report over partial insert: safer semantics; large-file failures require retry (M7 mitigates).
- Single `csv-import` capability matches M0.10 one-change scope; sdd-spec may split requirements within it.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Balance desync from bulk path | Med | Mirror `createTransaction` sign logic exactly inside the same `db.transaction`; fixture-verified sums; existing `deleteTransaction` reverses balance |
| Wrong date interpretation (UTC shift / ambiguity) | High | `YYYY-MM-DD` date-only normalization; selector on ambiguity; locale-biased default (M0.3) |
| Wrong type polarity on sign-only files | Med | Mode selector + expense default for all-positive files; review screen shows every type before submit |
| Duplicate false flags | Med | Flag-only, never skip; bulk exclude |
| Oversized change vs review budget | Med | `ask-on-risk` delivery strategy; PR split in tasks phase (M0.10); work-unit commits |
| Large CSVs degrade client perf | Low | Filter empty rows early; document cap in design |

## Rollback Plan

- **Code**: revert the single change — additive; replaces a broken flow; no schema/migration; no DB unique index.
- **Data**: wrongly imported rows removed via existing delete flow (`deleteTransaction` reverses balance); re-import from same file after fix.

## Dependencies

- `react-papaparse` ^4.4.0 / `papaparse` ^5.5.3 — installed.
- `date-fns` ^4.1.0 — installed (normalization parsing/formatting).
- No new external dependencies expected.
- `openspec/specs/` is empty → `csv-import` becomes the first main spec at archive.

## Success Criteria

- [ ] CSV 1 imports: all rows positive, MM/DD dates correct, trailing empty columns ignored, type=expense, 3 identical Rebtel rows flagged (not skipped)
- [ ] CSV 2 imports: DEBIT/CREDIT/DSLIP mapped correctly, `08/10/2026` = Aug 10, signed amounts stored positive, bank Type codes ignored unless mapped
- [ ] Account balance delta after import == Σ(income) − Σ(expense), fixture-verified in DB
- [ ] Importing to another user's account is rejected (ownership check)
- [ ] Failed rows produce a per-row report (row number + field + reason); nothing is partially inserted
- [ ] No hardcoded accountId remains; account Select required before submit
- [ ] Review screen shows duplicate / payee-missing / type-conflict flags with bulk actions
- [ ] Tests in `src/test/` cover normalization helpers, review bulk actions, and action validation (vi.hoisted mocks per convention)
