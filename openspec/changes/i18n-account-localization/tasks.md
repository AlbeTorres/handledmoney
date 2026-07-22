# Tasks: i18n Account Section Localization

## Phase 1: JSON Infrastructure
**Context needed**: `messages/es.json`, `messages/en.json`
**Estimated tokens**: ~2K

- [ ] 1.1 Add `handledmoney.account` section to `messages/en.json` with all keys
- [ ] 1.2 Add `handledmoney.account` section to `messages/es.json` with all keys
- [ ] 1.3 Verify key structure matches design doc (no missing keys)

---

## Phase 2: Server Components (Pages)
**Context needed**: 4 page files + understanding of `getTranslations`
**Estimated tokens**: ~3K

- [ ] 2.1 Localize `account/page.tsx` — EmptyState props
- [x] 2.2 Localize `account/[id]/page.tsx` — InfoCard titles, heading, error
- [ ] 2.3 Localize `account/create/page.tsx` — FormWrapper props
- [x] 2.4 Localize `account/[id]/edit/page.tsx` — FormWrapper props, error states

---

## Phase 3: Client Forms
**Context needed**: 3 form components + understanding of `useTranslations`
**Estimated tokens**: ~4K

- [ ] 3.1 Localize `CreateAccountForm.tsx` — labels, placeholders, descriptions, buttons, errors
- [ ] 3.2 Localize `EditAccountForm.tsx` — labels, placeholders, descriptions, buttons, errors
- [ ] 3.3 Localize `AppearanceSection.tsx` — heading, field labels

---

## Phase 4: Client Cards & Dialogs
**Context needed**: 5 card/dialog components
**Estimated tokens**: ~3K

- [ ] 4.1 Localize `AccountCard.tsx` — dropdown menu items, aria-label
- [ ] 4.2 Localize `AccountCardWrapper.tsx` — fallback values
- [x] 4.3 Localize `DeleteAccountDialog.tsx` — title, description, warnings, buttons, toasts
- [ ] 4.4 Localize `AccountInfo.tsx` — balance label, export button
- [x] 4.5 Localize `_AddAccountCard_.tsx` — card text

---

## Phase 5: Shared Components
**Context needed**: 3 shared components + AccountAction
**Estimated tokens**: ~3K

- [ ] 5.1 Localize `AccountAction.tsx` — pass translated props to ActionBar
- [x] 5.2 Localize `FilterDropdown.tsx` — "Clear filter" text
- [ ] 5.3 Localize `SortDropdown.tsx` — "Sort by" label
- [ ] 5.4 Localize `DataTable.tsx` — empty state, pagination, confirm dialog

---

## Execution Order
1. Phase 1 → JSON (foundation, no dependencies)
2. Phase 2 → Server pages (depends on Phase 1 keys)
3. Phase 3 → Client forms (depends on Phase 1 keys)
4. Phase 4 → Cards/dialogs (depends on Phase 1 keys)
5. Phase 5 → Shared components (depends on Phase 1 keys)

Phases 2-5 are independent of each other (only depend on Phase 1).
