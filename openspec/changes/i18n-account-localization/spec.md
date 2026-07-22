# Spec: i18n Account Section Localization

## Namespace
`handledmoney.account.*`

## Phase 1: JSON Infrastructure

### Requirement
Add `account` section to both `messages/es.json` and `messages/en.json` with all localization keys.

### Scenario: Keys structure
- **Given** the existing `handledmoney.auth` and `handledmoney.settings` sections
- **When** adding the `account` section
- **Then** it MUST follow the same nested structure pattern
- **And** keys MUST use snake_case naming
- **And** parameterized messages MUST use `{variable}` syntax (e.g. `"transactions_for": "Transacciones de {name}"`)

### Scenario: Spanish translations
- **Given** the `es.json` file
- **When** adding account keys
- **Then** all values MUST be in Spanish (Rioplatense style consistent with existing translations)

### Scenario: English translations
- **Given** the `en.json` file
- **When** adding account keys
- **Then** all values MUST be in English

---

## Phase 2: Server Components (Pages)

### Requirement
Replace hardcoded text in server-rendered page components with `getTranslations('handledmoney.account')`.

### Scenario: Account list page (account/page.tsx)
- **Given** the EmptyState component with hardcoded props
- **When** rendering the empty state
- **Then** `title`, `description`, `primaryActionText`, `importActionText` MUST use translated values

### Scenario: Account detail page (account/[id]/page.tsx)
- **Given** InfoCard titles and section headings
- **When** rendering account details
- **Then** "Total Income", "Total Expenses", "Net Flow", "Avg Daily Spend" MUST use translated keys
- **And** the "Transactions for {name}" heading MUST use parameterized translation

### Scenario: Create account page (account/create/page.tsx)
- **Given** FormWrapper with title/description props
- **When** rendering the create form wrapper
- **Then** title, description, breadcrumb values MUST use translations

### Scenario: Edit account page (account/[id]/edit/page.tsx)
- **Given** FormWrapper and error states
- **When** rendering the edit form wrapper
- **Then** title, description, breadcrumb values MUST use translations
- **And** "Account not found" and "Go back to accounts" MUST use translations

---

## Phase 3: Client Forms

### Requirement
Replace hardcoded text in client form components with `useTranslations('handledmoney.account')`.

### Scenario: CreateAccountForm
- **Given** the create account form
- **When** rendering field labels, placeholders, descriptions
- **Then** "Account Name", "Bank Name", "Account Type", "Currency" labels MUST use translations
- **And** placeholders "e.g., Main Savings", "e.g., Chase Bank" MUST use translations
- **And** button text "Create Account" / "Creating…" MUST use translations
- **And** error toast "Something went wrong" MUST use translations

### Scenario: EditAccountForm
- **Given** the edit account form
- **When** rendering field labels, placeholders, descriptions
- **Then** same labels as CreateAccountForm MUST use translations (reused keys)
- **And** "Update the name for your records." description MUST use translation
- **And** button text "Update Account" / "Updating…" MUST use translations

### Scenario: AppearanceSection
- **Given** the appearance section in both create/edit forms
- **When** rendering section heading and field labels
- **Then** "Account Appearance", "Select Icon", "Account Color" MUST use translations

---

## Phase 4: Client Cards & Dialogs

### Requirement
Replace hardcoded text in card and dialog components with `useTranslations('handledmoney.account')`.

### Scenario: AccountCard
- **Given** the account card dropdown menu
- **When** rendering menu items
- **Then** "Details", "Edit Account", "Delete Account" MUST use translations
- **And** aria-label "Account options" MUST use translation

### Scenario: AccountCardWrapper
- **Given** fallback values for account data
- **When** account.bank or account.name is null
- **Then** "Unknown Bank", "Unnamed Account", "General" fallbacks MUST use translations

### Scenario: DeleteAccountDialog
- **Given** the delete confirmation dialog
- **When** rendering dialog content
- **Then** title, description, warnings, button text MUST use translations
- **And** parameterized description "Are you sure you want to delete {name}?" MUST use `{name}` variable
- **And** toast errors "Please select an account..." and "Something went wrong" MUST use translations

### Scenario: AccountInfo
- **Given** the account detail header
- **When** rendering balance label and export button
- **Then** "Current Balance" and "Export CSV" MUST use translations

### Scenario: _AddAccountCard_
- **Given** the alternative add account card
- **When** rendering card text
- **Then** "Add New Account" and "Connect a bank or wallet" MUST use translations

---

## Phase 5: Shared Components

### Requirement
Replace hardcoded text in shared components used by the Account section.

### Scenario: ActionBar
- **Given** the action bar component
- **When** receiving props from AccountAction
- **Then** the component itself has no hardcoded text (text comes via props)
- **And** AccountAction.tsx MUST pass translated values for placeholder, ariaLabel, buttonText

### Scenario: FilterDropdown & SortDropdown
- **Given** the filter/sort dropdown components
- **When** rendering labels
- **Then** "Clear filter" and "Sort by" labels MUST use translations

### Scenario: DataTable
- **Given** the data table component
- **When** rendering empty state, pagination, confirm dialog
- **Then** "No results.", "Previous", "Next", row selection text MUST use translations
- **And** confirm dialog "Are you sure?" / "bulk delete" MUST use translations
