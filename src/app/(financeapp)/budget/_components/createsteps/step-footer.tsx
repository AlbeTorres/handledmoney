import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export function StepFooter({
  onCancel,
  onBack,
  onNext,
  disabled,
}: {
  onCancel?: () => void
  onBack?: () => void
  onNext?: () => void
  disabled: boolean
}) {
  const t = useTranslations('handledmoney.budget.form')
  return (
    <div className='flex flex-wrap justify-end gap-2'>
      {onCancel && (
        <Button type='button' variant='ghost' onClick={onCancel} disabled={disabled}>
          {t('cancel')}
        </Button>
      )}
      {onBack && (
        <Button type='button' variant='ghost' onClick={onBack} disabled={disabled}>
          {t('back')}
        </Button>
      )}
      {onNext && (
        <Button type='button' onClick={() => void onNext()} disabled={disabled}>
          {t('next')}
        </Button>
      )}
    </div>
  )
}