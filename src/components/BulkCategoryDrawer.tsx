'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface BulkCategoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  selectedIds: string[]
  categories: { id: string; name: string }[]
  onSubmit: (categoryId: string, transactionIds: string[]) => void
}

export function BulkCategoryDrawer({
  isOpen,
  onClose,
  selectedIds,
  categories,
  onSubmit,
}: BulkCategoryDrawerProps) {
  const t = useTranslations('handledmoney.transaction')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  function handleSubmit() {
    if (!selectedCategoryId) return
    onSubmit(selectedCategoryId, selectedIds)
    setSelectedCategoryId('')
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side='right'>
        <SheetHeader>
          <SheetTitle>{t('table.bulk_category_title')}</SheetTitle>
        </SheetHeader>
        <div className='flex flex-col gap-4 p-4'>
          <p className='text-sm text-muted-foreground'>
            {t('table.bulk_category_count', { count: selectedIds.length })}
          </p>
          <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder={t('table.bulk_category_select')} />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={!selectedCategoryId}>
            {t('table.bulk_category_submit')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
