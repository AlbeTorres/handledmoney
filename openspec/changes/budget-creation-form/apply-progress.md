# Apply Progress: Budget Creation Form

**Mode**: Standard  
**Delivery**: single-pr; 1,900-line review budget

## Completed Tasks
- [x] 1.1 Scope recovery
- [x] 1.2 Legacy sheet removal after route replacement
- [x] 2.1 Authenticated route and list navigation
- [x] 2.2 Six-group RHF editable draft
- [x] 3.1 Server validation and transaction RED coverage
- [x] 3.2 Unknown input parsing and atomic persistence

## Pending Tasks
- [ ] 2.3 Complete route/form/drawer RTL coverage (current focused selector coverage is green).
- [ ] 3.3 Reconcile the missing 0011 snapshot from an approved authoritative source before treating Drizzle metadata lineage as complete. The 0012 SQL repair is ready, but its generated snapshot was removed because it incorrectly claimed 0010 as its parent.
- [ ] 4.1 Full focused component/navigation/drawer/migration verification.
- [ ] 4.2 Global lint/build clean run (repository-wide lint currently has pre-existing failures).

## Work Unit Evidence
| Evidence | Result |
| --- | --- |
| Focused tests | `npm test -- --run src/test/create-budget.action.test.ts src/test/budget.repository.test.ts src/test/category-combobox.test.tsx` — PASS, 3 files / 16 tests. |
| Focused lint | Feature file lint — PASS, 0 errors/warnings. |
| Repository lint | `npm run lint` — FAIL, 107 pre-existing errors / 61 warnings outside this work unit. |
| Production build | `npm run build` — FAIL at existing `src/actions/category/create-category.ts:54`: `parentId` is absent from the category row type. |
| Runtime harness | N/A — no approved authenticated database target was available; no migration was applied. |
| Rollback boundary | Route/list navigation, creation form and local plan components, schema/action/repository creation path, and focused tests. |

## Migration Repair and Read-Only Audit (2026-08-14)
- Replaced `0012_gray_layla_miller.sql` with an additive color migration: add nullable `color` if absent, backfill null values to `94a3b8`, set the default, then enforce non-null. It no longer replays the 0011 budget-lifecycle conversion or renames `budget_group_type`.
- Retained the 0012 journal entry. It is not recorded in the development database, so replacing its un-applied SQL does not hide an applied migration.
- Removed the generated `drizzle/meta/0012_snapshot.json`: it declared `0010` as its predecessor even though the journal contains 0011. No snapshot was invented or journal entry rewritten.
- A read-only PostgreSQL transaction found development has `budget_calculation_type`, `budget_group.calculation_type`, `budget.start_date`, `budget.end_date`, non-null `budget.color` defaulting to `94a3b8`, and the `budget_item_budget_category_unique` index. Its `drizzle.__drizzle_migrations` log ends at 0011; 0012 is not recorded.
- Do not run `drizzle-kit push` again. After an approved backup and schema comparison, run `drizzle-kit migrate` once against this development database: the repaired 0012 is idempotent for its existing color column and will only be recorded after it completes. Do not manually insert migration-log rows.

## Current Work Unit Evidence
| Evidence | Result |
| --- | --- |
| Focused test command and exact result | `npm test -- --run src/test/create-budget.action.test.ts src/test/budget.repository.test.ts src/test/category-combobox.test.tsx` — PASS, 3 files / 16 tests. |
| Migration metadata check | `npx drizzle-kit check --config drizzle.config.ts` — PASS: `Everything's fine`. |
| Migration static contract | Add/backfill/default/non-null statements present; legacy enum rename, enum drop, and duplicate lifecycle DDL absent — PASS. |
| Runtime harness | N/A — no approved clean or staging database was provided; no migration command was run. |
| Rollback boundary | `drizzle/0012_gray_layla_miller.sql` and removal of the invalid `drizzle/meta/0012_snapshot.json`; reverting these restores the prior un-applied artifact only. |

## Blockers
1. `drizzle/meta/0011_snapshot.json` remains absent. It must be recovered from an approved historical artifact before metadata lineage can be declared complete; do not synthesize it from the current schema.
2. Task 2.3 has no form/drawer RTL suite yet, and repository-wide lint remains failing (107 errors / 61 warnings), so the application is not fully verifiable.
