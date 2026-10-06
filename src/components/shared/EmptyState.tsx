import { Import, Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type EmptyStateProps = {
  title: string
  description: string
  primaryActionText: string
  primaryActionIcon?: string
  onPrimaryActionHref: string
  importActionText?: string
  onImportAction?: string
  showImportButton?: boolean
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  primaryActionText,
  onPrimaryActionHref,
  importActionText = 'Import Data',
  onImportAction,
  showImportButton = false,
}) => {
  return (
    <div className='flex flex-col gap-4  w-full px-5  py-8 text-center'>
      <div className='space-y-4 px-lg'>
        <h3 className='font-bold  text-lg text-primary'>{title}</h3>
        <p className='text-body-lg text-on-surface-variant max-w-md mx-auto'>{description}</p>
      </div>

      <div className='mt-4 flex flex-col sm:flex-row items-center justify-center gap-4'>
        <Link
          href={onPrimaryActionHref}
          className='flex items-center gap-2 bg-primary text-white hover:bg-secondary transition-all duration-300 px-4 py-2.5 rounded-md text-sm  shadow-lg shadow-primary/20 hover:scale-105'
        >
          <Plus className='size-4' />
          {primaryActionText}
        </Link>

        {showImportButton && (
          <Link
            href={onImportAction || ''}
            className='flex items-center border-2 border-primary gap-2 bg-transparent text-primary hover:bg-secondary hover:text-white hover:border-secondary transition-all duration-300 px-4 py-2 rounded-md text-sm  shadow-lg shadow-primary/20 hover:scale-105'
          >
            <Import className='size-4' />
            {importActionText}
          </Link>
        )}
      </div>
    </div>
  )
}
