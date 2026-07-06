import { LucideLock } from 'lucide-react'

export default function UpdatePasswordSettings() {
  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-2'>
      <div className='flex items-center gap-2 mb-5'>
        <LucideLock size={20} />
        <h3 className='font-bold text-foreground'>Security Settings</h3>
      </div>
      <div className='space-y-4'>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>CURRENT PASSWORD</label>
          <div className='relative'>
            <input
              className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg input-focus-ring transition-all'
              placeholder='••••••••••••'
              type='password'
            />
            <span
              className='material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant cursor-pointer'
              data-icon='visibility'
            >
              visibility
            </span>
          </div>
        </div>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>NEW PASSWORD</label>
          <input
            className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg input-focus-ring transition-all'
            type='password'
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>CONFIRM NEW PASSWORD</label>
          <input
            className='w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-lg input-focus-ring transition-all'
            type='password'
          />
        </div>
        <div className='pt-2'>
          <button className='w-full py-3 bg-primary text-white rounded-lg font-label-caps hover:bg-primary-container transition-all flex items-center justify-center gap-2'>
            <span className='material-symbols-outlined text-[18px]' data-icon='key'>
              key
            </span>
            Update Password
          </button>
        </div>
      </div>
    </div>
  )
}
