'use client'

import { LucideTriangleAlert } from 'lucide-react'

export default function DangerZoneSettings() {
  return (
    <div className='mt-10 p-6 border border-destructive/30 bg-destructive/10 rounded-xl flex flex-col md:flex-row justify-between items-center gap-md'>
      <div>
        <h4 className=' text-2xl text-destructive flex items-center gap-2'>
          <LucideTriangleAlert size={20} />
          Danger Zone
        </h4>
        <p className='font-body-sm text-body-sm text-on-error-container'>
          Permanently delete your account and all associated financial data.
        </p>
      </div>
      <button className='px-6 py-2 border border-destructive text-destructive rounded-lg font-label-caps hover:bg-destructive hover:text-white transition-all'>
        DELETE ACCOUNT
      </button>
    </div>
  )
}
