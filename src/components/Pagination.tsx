'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  page: number
  totalPages: number
  total: number
  shown: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, total, shown, onPageChange }: Props) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    // Center window around current page
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    return start + i
  })

  return (
    <div className='px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-primary/10'>
      <span className='text-xs font-medium text-slate-500'>
        Showing {shown} of {total} records
      </span>
      <div className='flex gap-2 items-center'>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className='size-8 flex items-center justify-center rounded border border-primary/10 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        >
          <ChevronLeft className='size-4' />
        </button>

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`size-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
              p === page
                ? 'bg-primary text-white'
                : 'border border-primary/10 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className='size-8 flex items-center justify-center rounded border border-primary/10 hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
        >
          <ChevronRight className='size-4' />
        </button>
      </div>
    </div>
  )
}
