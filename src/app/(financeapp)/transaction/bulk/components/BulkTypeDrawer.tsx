'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface BulkTypeDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  onSubmit: (type: 'expense' | 'income') => void
}

/**
 * Sheet drawer that applies a single type to all bulk-selected review rows,
 * mirroring the BulkCategoryDrawer pattern (M5).
 */
export function BulkTypeDrawer({
  isOpen,
  onClose,
  selectedCount,
  onSubmit,
}: BulkTypeDrawerProps) {
  const t = useTranslations('handledmoney.transaction')
  const [selectedType, setSelectedType] = useState<'expense' | 'income' | ''>('')

  function handleSubmit() {
    if (!selectedType) return
    onSubmit(selectedType)
    setSelectedType('')
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>{t('import.bulk_type_title')}</SheetTitle>
        </SheetHeader>
        <div className='flex flex-col gap-4 p-4'>
          <p className='text-sm text-muted-foreground'>
            {t('import.bulk_type_count', { count: selectedCount })}
          </p>
          <Select
            value={selectedType}
            onValueChange={value => setSelectedType(value as 'expense' | 'income')}
            data-testid='bulk-type-select'
          >
            <SelectTrigger>
              <SelectValue placeholder={t('import.bulk_type_select')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='expense'>{t('transaction_type_expense')}</SelectItem>
              <SelectItem value='income'>{t('transaction_type_income')}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={!selectedType} data-testid='bulk-type-submit-button'>
            {t('import.bulk_type_submit')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
