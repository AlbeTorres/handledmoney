import { PlusIcon } from 'lucide-react'

const PLUS_ICON = <PlusIcon aria-hidden='true' />

export function AddAccountCard() {
  return (
    <button className='group bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 min-h-[220px] focus-visible:ring-2 focus-visible:ring-primary outline-none'>
      <div className='size-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all'>
        {PLUS_ICON}
      </div>
      <div className='text-center'>
        <p className='font-bold text-slate-600 dark:text-slate-300'>Add New Account</p>
        <p className='text-xs text-slate-400'>Connect a bank or wallet</p>
      </div>
    </button>
  )
}
