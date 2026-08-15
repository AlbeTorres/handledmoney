import enMessages from '../../messages/en.json'
import esMessages from '../../messages/es.json'
import { describe, expect, it } from 'vitest'

// Every key the new budget-creation wizard actually calls through
// useTranslations('handledmoney.budget.form'). This list is the single source
// of truth for both language files:
//   - a message key NOT in this list is an orphan and must be removed, and
//   - a wizard key MISSING from either file is a parity gap.
//
// The list covers the wizard components (stepper, template select, structure
// editor and group card, category combobox, allocation editor and summary),
// the orchestrator (CreateBudgetForm), and the quick-create drawer it renders.
const wizardKeys = [
  'add_category',
  'add_group',
  'allocation_assigned',
  'allocation_income',
  'allocation_unassigned',
  'amount_for_category',
  'back',
  'balance_negative',
  'balance_positive',
  'balance_zero',
  'cancel',
  'category_color',
  'category_created',
  'category_empty',
  'category_icon',
  'category_income_share',
  'category_name',
  'category_placeholder',
  'category_search',
  'category_type',
  'create_button',
  'create_category',
  'create_group',
  'creating',
  'delete_group',
  'end_date',
  'error_generic',
  'group_confirm_description',
  'group_confirm_title',
  'group_empty_description',
  'group_empty_title',
  'group_name',
  'group_name_placeholder',
  'group_total',
  'group_type',
  'group_type_income',
  'group_type_outflow',
  'heading_allocation',
  'heading_structure',
  'income',
  'income_group_required',
  'item_confirm_description',
  'item_confirm_title',
  'name',
  'name_placeholder',
  'next',
  'outflow',
  'plan',
  'quick_category_description',
  'quick_category_title',
  'remove_category',
  'save_category',
  'saving_category',
  'start_date',
  'step_allocation',
  'step_count',
  'step_setup',
  'step_structure',
  'steps_label',
  'success',
  'summary_categories',
  'summary_groups',
  'summary_income_pending',
  'summary_income_ready',
  'summary_title',
  'template_blank',
  'template_blank_description',
  'template_info_blank',
  'template_info_starter',
  'template_legend',
  'template_replace_cancel',
  'template_replace_confirm',
  'template_replace_description',
  'template_replace_title',
  'template_starter',
  'template_starter_description',
] as const

describe('budget wizard i18n parity', () => {
  const enForm = enMessages.handledmoney.budget.form
  const esForm = esMessages.handledmoney.budget.form

  it('keeps the exact same key set in en and es', () => {
    const enKeys = Object.keys(enForm).sort()
    const esKeys = Object.keys(esForm).sort()
    expect(esKeys).toEqual(enKeys)
  })

  it('provides every key the wizard uses in both languages', () => {
    const missing = wizardKeys.filter(key => !(key in enForm) || !(key in esForm))
    expect(missing).toEqual([])
  })

  it('contains no orphan keys (every message key is used by the wizard)', () => {
    const orphans = Object.keys(enForm).filter(key => !wizardKeys.includes(key as (typeof wizardKeys)[number]))
    expect(orphans).toEqual([])
  })
})
