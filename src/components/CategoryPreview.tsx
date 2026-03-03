import { LucideIcon } from 'lucide-react'

type CategoryPreviewProps = {
  name: string
  color: string
  type: string
  Icon: LucideIcon
}

export const CategoryPreview = ({ name, color, type, Icon }: CategoryPreviewProps) => {
  return (
    <div className='pt-8 border-t border-slate-100 dark:border-slate-800'>
      <div className='max-w-sm mx-auto p-2'>
        <label className='block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center'>
          Live Preview
        </label>
        <div
          className='flex items-center p-5 rounded-2xl border transition-all shadow-sm'
          style={{
            backgroundColor: '#' + color + '08',
            borderColor: '#' + color + '30',
          }}
        >
          <div
            className='size-14 rounded-2xl flex items-center justify-center text-white mr-5 shadow-lg shadow-black/5 transition-all'
            style={{
              backgroundColor: '#' + color,
              boxShadow: `0 10px 20px -5px ${color}40`,
            }}
          >
            <Icon />
          </div>
          <div>
            <h4 className='font-bold text-base' style={{ color: '#0f172a' }}>
              {name || 'Category Name'}
            </h4>
            <p className='text-xs font-semibold' style={{ color: '#' + color }}>
              {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Type'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
