const copy: Record<string, string> = {
  name: 'Budget name', name_placeholder: 'e.g. May 2026 Budget', start_date: 'Start date', end_date: 'End date', color: 'Budget color',
  plan: 'Budget plan', add_group: 'Add group', group_name: 'Group name', group_name_placeholder: 'e.g. Fixed expenses', group_type: 'Group type', income: 'Income', outflow: 'Outflow',
  add_item: 'Add item', category: 'Category', category_placeholder: 'Select a category', category_search: 'Search categories', category_empty: 'No compatible categories found.', create_category: 'Create category',
  amount: 'Planned amount', remove_group: 'Remove group', remove_item: 'Remove item', create_button: 'Create budget', creating: 'Creating…', cancel: 'Cancel',
  group_confirm_title: 'Remove group?', group_confirm_description: 'This group and its draft allocations will be removed.', item_confirm_title: 'Remove allocation?', item_confirm_description: 'This allocation will be removed from the draft.',
  quick_category_title: 'Create category', quick_category_description: 'Add a category without leaving this budget plan.', category_name: 'Category name', category_type: 'Category type', category_color: 'Category color', category_icon: 'Category icon',
  save_category: 'Create category', saving_category: 'Creating…', category_created: 'Category created and selected', success: 'Budget created successfully', error_generic: 'Something went wrong',
}

export const budgetText = (key: string) => copy[key] ?? key
