# Technical Design: i18n Account Section Localization

## Architecture Decision
Follow existing `next-intl` pattern: `useTranslations()` for client components, `getTranslations()` for server components. Namespace: `handledmoney.account`.

## JSON Key Structure

```json
{
  "handledmoney": {
    "account": {
      "breadcrumbs": {
        "accounts": "Accounts / Cuentas",
        "create": "Create / Crear",
        "edit": "Edit / Editar"
      },
      "empty_state": {
        "title": "...",
        "description": "...",
        "add_first_account": "...",
        "import_data": "..."
      },
      "action": {
        "search_placeholder": "...",
        "new_account": "...",
        "filter_currency": "...",
        "sort_highest_balance": "...",
        "sort_account_name": "...",
        "sort_recently_added": "..."
      },
      "card": {
        "details": "...",
        "edit_account": "...",
        "delete_account": "...",
        "options_aria": "...",
        "unknown_bank": "...",
        "unnamed_account": "...",
        "general_type": "...",
        "add_new_account": "...",
        "connect_description": "..."
      },
      "info": {
        "current_balance": "...",
        "export_csv": "..."
      },
      "detail": {
        "error": "...",
        "total_income": "...",
        "total_expenses": "...",
        "net_flow": "...",
        "avg_daily_spend": "...",
        "transactions_for": "Transactions of {name}"
      },
      "form": {
        "account_name": "...",
        "account_name_placeholder": "...",
        "account_name_description": "...",
        "update_name_description": "...",
        "bank_name": "...",
        "bank_name_placeholder": "...",
        "account_type": "...",
        "select_placeholder": "...",
        "currency": "...",
        "appearance": "...",
        "select_icon": "...",
        "account_color": "...",
        "create_button": "...",
        "creating": "...",
        "update_button": "...",
        "updating": "...",
        "error_generic": "..."
      },
      "delete": {
        "title": "...",
        "description": "Are you sure you want to delete {name}?",
        "has_transactions_warning": "...",
        "transfer_to": "...",
        "select_account": "...",
        "no_transactions": "...",
        "cancel": "...",
        "confirm_button": "...",
        "deleting": "...",
        "error_no_transfer": "...",
        "error_generic": "..."
      },
      "table": {
        "confirm_title": "...",
        "confirm_description": "...",
        "no_results": "...",
        "rows_selected": "...",
        "previous": "...",
        "next": "..."
      },
      "filter": {
        "clear": "..."
      },
      "sort": {
        "by": "..."
      },
      "create": {
        "title": "...",
        "description": "..."
      },
      "edit": {
        "title": "...",
        "description": "...",
        "not_found": "...",
        "go_back": "..."
      }
    }
  }
}
```

## File Change Pattern

### Server Components (Phase 2)
```tsx
// Before
<p>Error</p>

// After
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('handledmoney.account')
<p>{t('detail.error')}</p>
```

### Client Components (Phases 3-5)
```tsx
// Before
<FieldLabel>Account Name</FieldLabel>

// After
import { useTranslations } from 'next-intl'
const t = useTranslations('handledmoney.account')
<FieldLabel>{t('form.account_name')}</FieldLabel>
```

## Execution Strategy
Each phase is a separate session. Context per phase:
- **Phase 1**: Only JSON files (~200 lines)
- **Phase 2**: 4 page files (~300 lines total)
- **Phase 3**: 3 form components (~500 lines total)
- **Phase 4**: 5 card/dialog components (~400 lines total)
- **Phase 5**: 3 shared components (~400 lines total)

Total context per execution: max ~500 lines (vs 2000+ if done all at once).
