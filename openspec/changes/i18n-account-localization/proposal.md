# Change Proposal: i18n Account Section Localization

## Intent
Localize all hardcoded English text in the Account section to support Spanish/English via next-intl, following the existing pattern used in `auth` and `settings` sections.

## Scope
- 2 JSON message files (es.json, en.json)
- 15 component files across 4 pages
- ~80 text strings to localize

## Approach
**Phased execution** to optimize context and token usage. Each phase is independently executable:
- Phase 1: JSON infrastructure (no code, just keys)
- Phase 2: Server components (pages use `getTranslations`)
- Phase 3: Client forms (use `useTranslations`)
- Phase 4: Client cards & dialogs
- Phase 5: Shared components (DataTable, ActionBar, etc.)

## Affected Modules
- `messages/es.json`, `messages/en.json`
- `src/app/(financeapp)/account/**` (4 pages)
- `src/components/Account*.tsx`, `CreateAccountForm`, `EditAccountForm`, `DeleteAccountDialog`, `AppearanceSection`, `_AddAccountCard_`, `DataTable`, `ActionBar`, `FilterDropdown`, `SortDropdown`

## Risk
Low — additive changes only, no logic modification.
