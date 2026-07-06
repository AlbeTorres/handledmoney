import { LucideUserPen } from 'lucide-react'

export default function PersonalInfomationSettings() {
  return (
    <div className='bg-white shadow-sm p-6 rounded-xl flex flex-col gap-2'>
      <div className='flex justify-between items-center mb-5'>
        <div className='flex items-center gap-2'>
          <LucideUserPen size={20} />
          <h3 className='font-bold text-foreground'>Personal Information</h3>
        </div>
        <button
          className='text-secondary font-label-caps hover:underline cursor-pointer'
          id='edit-personal'
        >
          EDIT
        </button>
      </div>
      <div className='space-y-4'>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>FULL NAME</label>
          <input
            className='personal-input w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-lg text-on-surface outline-none transition-all cursor-not-allowed'
            type='text'
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>EMAIL ADDRESS</label>
          <input
            className='personal-input w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-lg text-on-surface outline-none transition-all cursor-not-allowed'
            type='email'
          />
        </div>
        <div className='flex flex-col gap-1'>
          <label className='font-label-caps text-on-surface-variant'>PHONE NUMBER</label>
          <input
            className='personal-input w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-lg text-on-surface outline-none transition-all cursor-not-allowed'
            type='tel'
          />
        </div>
      </div>
      <div className='hidden flex justify-end gap-3 mt-4' id='personal-actions'>
        <button className='px-6 py-2 border border-outline text-on-surface-variant rounded-lg font-label-caps hover:bg-surface-container transition-colors'>
          CANCEL
        </button>
        <button className='px-6 py-2 bg-primary text-white rounded-lg font-label-caps hover:opacity-90 shadow-sm transition-all'>
          SAVE CHANGES
        </button>
      </div>
    </div>
  )
}
