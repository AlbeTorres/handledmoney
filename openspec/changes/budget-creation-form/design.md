# Design: Budget Creation Form

## Technical Approach

Recover from `HEAD` and deliver an authenticated `/budget/create` RHF/Zod form that atomically persists the complete plan. Implement both delta specs without changing Budget Details or unrelated shared/localization components.

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Recovery boundary | Restore unrelated Details, shared, category-action, and localization diffs to `HEAD`; delete `CreateBudgetSheet.tsx`. | Keep recovery scoped; the existing category action already authorizes and returns its created row. |
| Creation UI | Rewrite `CreateBudgetForm.tsx`, `components/budget-plan/*`, and `budget/create/page.tsx`; replace the list sheet trigger with a link. | The current draft incorrectly requires Income, blocks cross-group reuse, and overloads the drawer target. |
| Draft template and minimum | At form initialization, copy exactly the six groups from the current `initialGroups` template: Income, Bills, Variable Expenses, Debt, Savings, and Investments. Each seeded group is editable and removable; require only at least one group to save. | These names are existing template data, not a newly chosen product taxonomy. The current template includes Income, but neither client nor server requires an Income group to exist or remain after editing. |

## Data Flow

```
server page: session + getCategoriesByUserId
  -> serializable BudgetCategory[] -> CreateBudgetForm (RHF + Zod)
  -> BudgetPlanEditor / compatible selector / fixed-type drawer
  -> createBudgetAction -> createBudget transaction -> budget, groups, items
```

The page authenticates before loading requester-scoped `id,name,type,icon,color` categories. `FormWrapper` supplies navigation/header and `FormActions` submits/cancels. RHF copies the six-row template, retains failures, and uses field arrays so every seeded group can be edited or removed and groups/items added. Removal confirms but protects no group; only zero groups fails. The selector maps `income -> income` and `outflow -> expense`, offers compatible categories, and targets quick creation by `{groupIndex,itemIndex,calculationType}`. The fixed-type drawer calls the existing action, appends its result, and selects it only for the source item.

## File Changes

| File | Action | Description |
|---|---|---|
| `src/app/(financeapp)/budget/create/page.tsx` | Rewrite | Auth, category DTO, `FormWrapper`. |
| `src/app/(financeapp)/budget/page.tsx` | Modify | Link “New Budget” to `/budget/create`. |
| `src/components/CreateBudgetSheet.tsx` | Delete | Remove legacy entry point. |
| `src/components/CreateBudgetForm.tsx`, `src/components/budget-plan/*` | Rewrite | Draft editor, selector/drawer, confirmations. |
| `src/lib/schema.ts`, `src/actions/budget/create-budget.ts`, `src/repository/budget.ts` | Modify | Input, action outcome, atomic write. |
| `src/db/schema.ts`, `drizzle/0012_budget_color.sql`, `drizzle/meta/*` | Modify after approval | Color column and reconciled migration lineage. |
| `src/components/BudgetDetailView.tsx`, `BudgetGroupSection.tsx`, `FormActions.tsx`, `ui/field.tsx`, `actions/category/create-category.ts`, `messages/*` | Restore | Exclude unrelated changes. |

## Interfaces / Contracts

```ts
type BudgetCategory = { id: string; name: string; type: 'income' | 'expense'; icon: string; color: string }
type CreateBudgetValues = {
  name: string; color: Hex6; startDate: Date; endDate?: Date | null
  groups: Array<{ name: string; calculationType: 'income' | 'outflow'; sortOrder: number
    items: Array<{ categoryId: string; plannedAmount: number }> }>
}
// action: { success: true; status: 201; data: { id: string } } | failure(status, message, errors?)
```

The group contract adds only non-empty `groups`. Existing `CreateBudgetSchema` validation remains; this design adds neither a non-negative-amount nor date-range rule. The action authenticates and parses `unknown`; one transaction verifies referenced categories exist, belong to the requester, and match group type, then inserts budget, groups, and items. Errors roll back with a non-sensitive failure.

## Testing Strategy

| Layer | Coverage | Approach |
|---|---|---|
| Schema/action | six template groups, zero groups rejected, no-Income plan accepted, duplicate category, auth/invalid input | Vitest mocks; no group type is protected. |
| Repository | foreign/missing/incompatible category; late-write rollback | Transaction fixture proves no records survive. |
| Components/route | groups, confirmations, selector/drawer, created selection, auth/navigation | RTL/user-event with mocks. |
| Migration | approved staging backfill/non-null rehearsal | Never use an unapproved DB. |

## Threat Matrix

| Boundary | Applicability | Design response / RED tests |
|---|---|---|
| Documentation-like paths | N/A — no classification/execution | None |
| Git repository selection | N/A — no VCS command | None |
| Commit state | N/A — no commit automation | None |
| Push state | N/A — no push automation | None |
| PR commands | N/A — no PR automation | None |

## Migration / Rollout

`_journal.json` names 0011/0012 but their snapshots are missing. Do not apply `0012_budget_color.sql` before reconciling approved lineage and approving staging. The additive migration defaults/backfills `94a3b8`, then enforces non-null; deploy it before the route. Roll back code first; reverse database changes only through an approved, data-preserving plan.

## Open Questions

- [ ] Which approved database/history is authoritative for reconstructing snapshots 0011 and 0012?
