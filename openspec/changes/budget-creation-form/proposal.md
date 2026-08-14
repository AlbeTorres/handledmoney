# Proposal: Budget Creation Form

## Intent

Replace fragmented Budget creation with `/budget/create`, where users define metadata and an editable plan before one atomic save. Eliminate partial Budgets and hidden default plans.

## Scope

### In Scope
- Remove the legacy creation sheet; link the list to the authenticated route.
- Render six editable initial groups; allow group deletion, item add/remove, and amount edits; require at least one group.
- Save Budget color, groups, and items atomically after server-side category ownership/type checks.
- Add a color migration that backfills existing Budgets with `94a3b8` before non-null.
- Filter categories by compatible group type; quick creation accepts name, type, color, icon and selects its result.
- Recover safely: revert/avoid unrelated Details, shared UI, category-action, and translation changes; reconcile Drizzle metadata before migrations.
- Add focused action, repository, component, navigation, and drawer tests.

### Out of Scope
- Edit Budget or Budget Details redesign.
- Income-group and client-side global-category-uniqueness rules.

## Capabilities

### New Capabilities
- `budget-creation`: Route-based metadata/color and editable-plan creation, six initial groups, minimum-group validation, and all-or-nothing persistence.
- `budget-plan-category-selection`: Compatible-only category selection and constrained quick creation with automatic selection.

### Modified Capabilities
- None. Existing `csv-import` is unaffected.

## Approach

Rebuild from the stable base using server-fetched categories, FormWrapper/RHF/Zod/FormActions, draft confirmations, and a transaction that validates referenced categories before inserts. Restore Drizzle snapshot lineage through the project workflow, then review generated SQL and metadata together.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/app/(financeapp)/budget/{page,create/page}.tsx` | Modified/New | Navigation and route |
| `src/components/CreateBudgetForm.tsx`, `src/components/budget-plan/` | New | Draft editor and drawer |
| `src/lib/schema.ts`, `src/actions/budget/create-budget.ts`, `src/repository/budget.ts` | Modified | Validation and transaction |
| `src/db/schema.ts`, `drizzle/`, `drizzle/meta/` | Modified | Color and lineage |
| `src/test/` | Modified/New | Focused coverage |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Broken Drizzle lineage/production lock | Medium | Repair snapshots; review artifacts; approve target |
| Partial or unauthorized data | Medium | Transactional server validation; rollback tests |
| Scope leakage | Medium | Restore unrelated diffs; leave Details unchanged |

## Rollback Plan

Revert the bounded route/form/action/repository change and navigation; restore the legacy sheet only if the replacement cannot ship. Roll back the migration only through an approved data-preserving database plan; otherwise retain the additive column and disable the route.

## Dependencies

- Reconciled Drizzle 0011/0012 metadata and approved migration target.
- Category creation returns the created category.

## Success Criteria

- [ ] The legacy sheet is absent and `/budget/create` atomically saves metadata and plan.
- [ ] Six editable groups render; zero groups cannot save.
- [ ] Selectors and quick creation enforce/select compatible categories.
- [ ] Existing Budgets receive a default color through verified migration lineage.
- [ ] Focused validation, rollback, UI, drawer, and navigation tests pass without Details changes.
