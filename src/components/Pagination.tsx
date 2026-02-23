export default function Pagination({ total, shown }) {
  return (
    <div className='px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-primary/10'>
      <span className='text-xs font-medium text-slate-500'>
        Showing {shown} of {total} records
      </span>
      <div className='flex gap-2'>
        <button className='size-8 flex items-center justify-center rounded border border-primary/10 hover:bg-white transition-colors'>
          <span className='material-symbols-outlined text-sm'>chevron_left</span>
        </button>
        <button className='size-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold'>
          1
        </button>
        <button className='size-8 flex items-center justify-center rounded border border-primary/10 hover:bg-white transition-colors text-xs font-bold'>
          2
        </button>
        <button className='size-8 flex items-center justify-center rounded border border-primary/10 hover:bg-white transition-colors text-xs font-bold'>
          3
        </button>
        <button className='size-8 flex items-center justify-center rounded border border-primary/10 hover:bg-white transition-colors'>
          <span className='material-symbols-outlined text-sm'>chevron_right</span>
        </button>
      </div>
    </div>
  )
}
