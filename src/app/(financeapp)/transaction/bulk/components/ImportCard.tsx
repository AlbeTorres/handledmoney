'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TYPE_OPTIONS } from '@/lib/csv/constants'
import { findDuplicateCandidates } from '@/lib/csv/duplicates'
import { detectDateOrder, normalizeRows } from '@/lib/csv/normalize'
import type { DateOrder, NormalizedRow, TypeMode } from '@/lib/csv/types'
import { SelectedColumns } from '@/interfaces'
import { useCSVState } from '@/store'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { ImportTable } from './ImportTable'

type Props = {
  data: string[][]
  accounts: Array<{ id: string; name: string }>
  onCancel: () => void
}

/** Targets the user must map before Continue (CSV-IMP-02); `type` is required
 *  only when the file mode maps a type column (M0.2). */
const REQUIRED_TARGETS = ['amount', 'date', 'payee']

export const ImportCard = ({ data, accounts, onCancel }: Props) => {
  const t = useTranslations('handledmoney.transaction')
  const locale = useLocale()
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumns>({})

  const { config, setConfig, setNormalizedRows } = useCSVState()

  const header = data[0] ?? []
  const body = data.slice(1)

  const onTableHeadSelectChange = (columnIndex: number, value: string | null) =>
    setSelectedColumns(prev => {
      const newSelectedColumns = { ...prev }
      // A source column must not be mapped to two targets (CSV-IMP-02).
      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null
        }
      }

      if (value === 'skip') {
        value = null
      }

      newSelectedColumns[`column_${columnIndex}`] = value
      return newSelectedColumns
    })

  const mappedTargets = new Set(
    Object.values(selectedColumns).filter((value): value is string => value !== null),
  )

  const requiredTargets =
    config.typeMode === 'map' ? [...REQUIRED_TARGETS, 'type'] : REQUIRED_TARGETS
  const progress = requiredTargets.filter(target => mappedTargets.has(target)).length
  const hasTypeColumn = mappedTargets.has('type')
  const canContinue = config.accountId !== '' && progress === requiredTargets.length

  // Date order (M0.3): decisive samples win; ambiguous files show a selector
  // in the header biased by the persisted locale (es → dd/mm, en → mm/dd).
  const findColumnIndex = (target: string) => {
    for (let i = 0; i < header.length; i++) {
      if (selectedColumns[`column_${i}`] === target) return i
    }
    return -1
  }
  const dateColumnIndex = findColumnIndex('date')
  const dateSamples =
    dateColumnIndex === -1 ? [] : body.map(row => row[dateColumnIndex] ?? '')
  const detectedOrder = detectDateOrder(dateSamples)
  const dateAmbiguous = detectedOrder === 'ambiguous'
  const localeBias: DateOrder = locale.toLowerCase().startsWith('es') ? 'dd/mm' : 'mm/dd'
  const dateOrder: DateOrder = dateAmbiguous ? config.dateOrder ?? localeBias : detectedOrder

  const handleContinue = () => {
    // Build raw mapped rows keyed by target column (CSV-IMP-11: the same rows
    // rendered in review are the rows submitted).
    const mappedRows: Record<string, string>[] = body
      .map(row => {
        const mapped: Record<string, string> = {}
        row.forEach((cell, index) => {
          const target = selectedColumns[`column_${index}`]
          if (target && target !== 'skip' && cell) {
            mapped[target] = cell
          }
        })
        return mapped
      })
      .filter(row => Object.keys(row).length > 0)

    // D5: re-normalize on Continue with the resolved date order; control
    // changes discard any bulk overrides from a previous review pass.
    setConfig({ dateOrder })
    const normalized: NormalizedRow[] = normalizeRows(
      mappedRows,
      { ...config, dateOrder },
      hasTypeColumn,
    )

    // M0.4: flag candidate duplicates (account + date + amount + payee) —
    // never auto-skip; the user decides via bulk exclusion in review.
    const duplicateIndices = findDuplicateCandidates(normalized, config.accountId)
    setNormalizedRows(
      normalized.map((row, index) => ({
        ...row,
        possibleDuplicate: duplicateIndices.has(index),
      })),
    )

    useCSVState.setState({ isImporting: 'REVIEW' })
  }

  return (
    <div className='max-w-screen-2xl mx-auto w-full pb-10 mt-24'>
      <Card className='border-none drop-shadow-sm'>
        <CardHeader className='gap-y-2 lg:flex-row lg:items-center lg:justify-between'>
          <CardTitle className='text-xl line-clamp-1'>{t('import.title')}</CardTitle>
          <div className='flex flex-wrap items-end gap-3'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>{t('import.account')}</span>
              <Select
                value={config.accountId}
                onValueChange={value => setConfig({ accountId: value })}
                data-testid='account-select'
              >
                <SelectTrigger className='w-44'>
                  <SelectValue placeholder={t('import.account_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>{t('import.type_mode')}</span>
              <Select
                value={config.typeMode}
                onValueChange={value => setConfig({ typeMode: value as TypeMode })}
                data-testid='type-mode-select'
              >
                <SelectTrigger className='w-44'>
                  <SelectValue placeholder={t('import.type_mode')} />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dateAmbiguous && dateColumnIndex !== -1 && (
              <div className='flex flex-col gap-1'>
                <span className='text-xs text-muted-foreground'>{t('import.date_order')}</span>
                <Select
                  value={dateOrder}
                  onValueChange={value => setConfig({ dateOrder: value as DateOrder })}
                  data-testid='date-order-select'
                >
                  <SelectTrigger className='w-44'>
                    <SelectValue placeholder={t('import.date_order')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='dd/mm'>{t('import.date_order_dd_mm')}</SelectItem>
                    <SelectItem value='mm/dd'>{t('import.date_order_mm_dd')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>{t('import.number_format')}</span>
              <Select
                value={config.numberFormat}
                onValueChange={value => setConfig({ numberFormat: value as 'us' | 'eu' })}
                data-testid='number-format-select'
              >
                <SelectTrigger className='w-44'>
                  <SelectValue placeholder={t('import.number_format')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='us'>{t('import.format_us')}</SelectItem>
                  <SelectItem value='eu'>{t('import.format_eu')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              size={'sm'}
              className='w-full lg:w-auto'
              onClick={onCancel}
              data-testid='cancel-button'
            >
              {t('import.cancel')}
            </Button>
            <Button
              size={'sm'}
              className='w-full lg:w-auto'
              disabled={!canContinue}
              onClick={handleContinue}
              data-testid='continue-button'
            >
              {t('import.continue')} ({progress}/{requiredTargets.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            headers={header}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
