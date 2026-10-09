type Props = {
  activeView: 'expense' | 'income'
  onViewChange: (view: 'expense' | 'income') => void
  tabs: ['income', 'expense']
  labels?: Record<string, string>
}

export const Tab = ({ activeView, onViewChange, tabs, labels }: Props) => {
  return (
    <div className='flex items-center w-fit gap-1 rounded-lg bg-muted p-1'>
      {tabs.map(view => (
        <button
          key={view}
          type='button'
          onClick={() => onViewChange(view)}
          className={`px-4 py-1.5 w-full rounded-md text-sm font-semibold capitalize transition-colors ${
            activeView === view
              ? 'bg-background text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {labels?.[view] ?? view}
        </button>
      ))}
    </div>
  )
}