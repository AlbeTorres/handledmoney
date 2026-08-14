# Exploration: Budget Creation Form Recovery

### Current State

The working tree contains an incomplete replacement of `CreateBudgetSheet` with `/budget/create`: the new route, RHF/Zod form, draft plan editor, atomic repository transaction, color column, and quick-category drawer are present but uncommitted. The list page now links to the route and the old sheet is deleted.

The attempt is not safe to continue as-is. It expands unrelated Budget Details and shared UI files, alters translations (including corrupted Spanish characters), and adds requirements not confirmed for this change (at least one income group and global category uniqueness). The draft editor is not covered by component tests. Drizzle metadata is also incomplete: journal entries exist for migrations 0011 and 0012, but corresponding snapshots do not exist.

### Affected Areas

- `src/app/(financeapp)/budget/page.tsx` and `src/app/(financeapp)/budget/create/page.tsx` — replace the sheet trigger with the authenticated create route and fetch selectable categories on the server.
- `src/components/CreateBudgetForm.tsx` and `src/components/budget-plan/*` — client draft form, six initial editable group tables, item/category editing, confirmations, and quick category creation.
- `src/lib/schema.ts`, `src/actions/budget/create-budget.ts`, and `src/repository/budget.ts` — validate the complete draft; verify category ownership/type; insert budget, groups, and items in one transaction.
- `src/db/schema.ts`, `drizzle/0012_budget_color.sql`, and `drizzle/meta/*` — add the non-null six-character budget color and make generated migration metadata internally consistent.
- `src/actions/category/create-category.ts` — reuse the existing category creation contract only if its response supports selecting the newly created category; avoid unrelated localization changes.
- `src/test/create-budget.action.test.ts` and new focused component/repository tests — cover action validation, atomic persistence contract, category compatibility, the one-group minimum, and drawer selection.

### Approaches

1. **Continue the current patch selectively** — repair individual defects in the existing implementation.
   - Pros: retains some working route and transaction code.
   - Cons: mixes unrelated formatting/localization/details changes with the feature, preserves untested draft-editor assumptions, and makes it difficult to prove recovery from the broken state.
   - Effort: Medium.

2. **Rebuild the creation slice from the stable base, selectively reusing verified ideas** — restore unrelated changes, then implement the route-to-atomic-create flow as a bounded change.
   - Pros: aligns exactly with confirmed scope, removes the non-functional/encoding damage, keeps Budget Details out of scope, and gives each persistence/UI contract focused tests.
   - Cons: requires deliberately re-authoring the form/editor rather than treating the working tree as the source of truth.
   - Effort: Medium.

### Recommendation

Choose approach 2. Recover in these explicit steps:

1. **Revert from this attempt**: `messages/en.json`, `messages/es.json`, `src/components/ui/field.tsx`, `src/actions/category/create-category.ts`, and the formatting-only changes in `BudgetDetailView.tsx` and `BudgetGroupSection.tsx`. Do not implement Edit Budget or redesign Budget Details. Remove the obsolete sheet only when the replacement route is complete.
2. **Re-author and retain only verified feature intent**: keep `/budget/create`, the list-page link, a `FormWrapper` + RHF + Zod + `FormActions` form, the six default draft groups, a draft-only plan editor, `useConfirm` for destructive draft actions, a group-type-filtered category combobox, and a category drawer that submits name/type/color/icon then selects the returned category.
3. **Make the server authoritative**: the create schema requires one or more groups (not an unconfirmed income-group rule); the action authenticates and validates; the repository transaction validates every referenced category belongs to the user and matches the group type, then inserts budget metadata, groups, and items atomically. Preserve the database unique category-per-budget constraint only if it is existing lifecycle behavior; do not introduce it as a new client validation rule without a requirement.
4. **Recreate migration metadata through the project Drizzle workflow**: retain an additive `budget.color` migration that backfills `94a3b8` before `SET NOT NULL`, but do not hand-edit the journal alone. Reconcile the missing 0011/0012 snapshots before generating/accepting the migration, and review the generated SQL and metadata together.
5. **Test the recovered slice**: action schema/auth paths; repository rollback on invalid/foreign/mismatched categories; create-form default six tables, group/item mutation and minimum-group guard; filtered selector; quick drawer full payload and selection; and route/list navigation. Keep existing Budget Details tests passing without expanding its feature surface.

Available verification commands (not executed): `npm run lint`, `npm test -- create-budget.action`, `npm test -- BudgetOperations.components`, `npm test -- CreateCategoryForm`, `npm test`, and `npm run build`. Migration review should use the repository's Drizzle generation/migration workflow only after snapshot reconciliation; applying migrations requires an explicitly approved database target.

### Risks

- **Migration lineage**: journal entries without 0011/0012 snapshots can make future Drizzle generation unreliable; `SET NOT NULL` also needs a production-table lock/rollout review.
- **Atomicity/security**: client category filtering is insufficient; server-side ownership and type checks must occur inside the same transaction before inserts.
- **Scope creep**: current diffs touch Details, shared fields, category actions, and translations. Those changes must not ride with this recovery.
- **Product mismatch**: requiring an income group or forbidding category reuse is stricter than the confirmed rule of at least one group.
- **Locale/data entry**: `toISOString()` date conversion can shift a local date near UTC boundaries; use the established local date input conversion pattern and test it.
- **Drawer semantics**: category type must be represented in the quick-create payload while being constrained to the invoking group's compatible type; it must not silently create an incompatible category.

### Ready for Proposal

Yes — propose one bounded `budget-creation-form` change with migration lineage reconciliation as an explicit prerequisite and with the recovery/revert plan above. No application code, migration, or translation has been changed during exploration.
