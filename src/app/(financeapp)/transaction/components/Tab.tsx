type Props = {
  activeView: 'expense' | 'income'
  onViewChange: (view: 'expense' | 'income') => void
  tabs: ['income', 'expense']
  labels?: Record<string, string>
}

export const Tab = ({ activeView, onViewChange, tabs, labels }: Props) => {
  return (
    <div className='flex items-center w-fit gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg'>
      {tabs.map(view => (
        <button
          key={view}
          type='button'
          onClick={() => onViewChange(view)}
          className={`px-4 py-1.5 w-full rounded-md text-sm font-semibold capitalize transition-all ${
            activeView === view
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {labels?.[view] ?? view}
        </button>
      ))}
    </div>
  )
}
