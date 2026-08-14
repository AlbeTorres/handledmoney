# Tasks: Budget Creation Form

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 1,150–1,650 authored lines |
| 1,900-line budget risk | Low |
| Chained PRs recommended | No — single PR is mandated |
| Suggested split | One PR; work units become commits only |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: High

No size exception is needed unless the actual authored diff exceeds 1,900 lines; do not create PR chains.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Restore scope | Single PR | `npm run lint -- src/components/BudgetDetailView.tsx src/components/ui/field.tsx` | N/A—restoration only | Restored Details/shared/category-action/messages files |
| 2 | Route and draft | Single PR | `npm test -- src/test/create-budget-form.test.tsx` | RTL: edit/remove all groups; save with no Income | Route, list link, sheet deletion, form/plan components |
| 3 | Atomic save | Single PR | `npm test -- src/test/create-budget.action.test.ts src/test/budget.repository.test.ts` | Vitest transaction fixture injects late write failure | Schema, action, repository |
| 4 | Color lineage | Single PR | `npm test -- src/test/budget-color-migration.test.ts` | N/A—never target an unapproved DB | Schema and reviewed `drizzle/0012_budget_color.sql`/metadata |

## Phase 1: Scope Recovery

- [x] 1.1 Restore `BudgetDetailView.tsx`, `BudgetGroupSection.tsx`, `FormActions.tsx`, `ui/field.tsx`, `actions/category/create-category.ts`, and `messages/*` to `HEAD`; confirm Details/shared UI/category action/translations are unchanged.
- [x] 1.2 Delete `src/components/CreateBudgetSheet.tsx` only after its list entry is replaced; record the focused lint result.

## Phase 2: Route and Editable Draft

- [x] 2.1 Rewrite `src/app/(financeapp)/budget/create/page.tsx` to authenticate, fetch requester category DTOs, and render `FormWrapper`; change `budget/page.tsx` New Budget to `/budget/create`.
- [x] 2.2 Rewrite `CreateBudgetForm.tsx` and `components/budget-plan/*` with RHF field arrays seeded from exactly the six current template groups; all groups are editable/removable and only one remaining group is required.
- [ ] 2.3 Add RED RTL tests for six groups, zero-group rejection, no-Income acceptance, retained failed draft, compatible/empty selector, and fixed-type quick-create selection; then implement and refactor to green.

## Phase 3: Server and Migration Preconditions

- [x] 3.1 Add RED action/repository tests for unauthenticated, invalid, missing, foreign, incompatible, and late-write rollback cases; do not add amount or date rules.
- [x] 3.2 Update `src/lib/schema.ts`, `create-budget.ts`, and `repository/budget.ts` to parse `unknown`, validate existing requester-owned type-compatible categories (no status), and atomically insert Budget, groups, and items.
- [ ] 3.3 Reconcile approved Drizzle 0011/0012 snapshot/journal lineage before generating color artifacts; generate and review the `94a3b8` backfill/non-null SQL and metadata, but do not apply any migration to an unapproved database.

## Phase 4: Verification

- [ ] 4.1 Run focused action, repository, component, navigation, drawer, and migration tests; capture results.
- [ ] 4.2 Run `npm run lint` and `npm run build`; confirm no Details changes and compare authored diff against 1,900 lines before requesting review.
