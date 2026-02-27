type Props = {
  activeView: string
  onViewChange: (view: string) => void
  tabs: string[]
}

export const Tab = ({ activeView, onViewChange, tabs }: Props) => {
  return (
    <div className='flex items-center w-fit gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg'>
      {tabs.map(view => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${
            activeView === view
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {view}
        </button>
      ))}
    </div>
  )
}
