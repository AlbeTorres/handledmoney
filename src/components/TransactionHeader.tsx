import { Search } from 'lucide-react'

type Props = {
  activeView: string
  onViewChange: (view: string) => void
  search: string
  onSearch: (search: string) => void
}

export default function TransactionHeader({ activeView, onViewChange, search, onSearch }: Props) {
  return (
    <header className='sticky top-0 z-10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 py-4 border-b border-primary/10'>
      <div className='flex items-center gap-6'>
        <div className='flex items-center gap-2'>
          <h2 className='text-slate-900 dark:text-white text-xl font-bold tracking-tight'>
            Main Checking History
          </h2>
        </div>
        <nav className='hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg'>
          {['expenses', 'income'].map(view => (
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
        </nav>
      </div>
      <div className='flex items-center gap-4'>
        <div className='relative'>
          <Search />

          <input
            className='pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64 transition-all'
            placeholder={activeView === 'income' ? 'Search by date...' : 'Search transactions...'}
            type='text'
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>
        <button className='p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative'>
          <span className='material-symbols-outlined'>notifications</span>
          <span className='absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900'></span>
        </button>
      </div>
    </header>
  )
}
