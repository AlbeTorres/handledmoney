import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { BudgetTemplateId } from '@/lib/budget-plan-templates'
import { CreateBudgetValues } from '@/lib/schema'
import { format } from 'date-fns'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, UseFormReturn } from 'react-hook-form'
import TemplateBudgetSelect from '../TemplateBudgetSelect'
import { StepFooter } from './step-footer'

type Props = {
  form: UseFormReturn<CreateBudgetValues>
  templateId: BudgetTemplateId
  changeTemplate: (templateId: BudgetTemplateId) => Promise<void>
  goToStructure: () => Promise<void>
  cancel: () => void
  isPending: boolean
}

export function SetupStep({
  form,
  templateId,
  changeTemplate,
  goToStructure,
  cancel,
  isPending,
}: Props) {
  const t = useTranslations('handledmoney.budget.form')

  return (
    <>
      <div className='w-full md:max-w-md'>
        <FieldGroup>
          <Controller
            name='name'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className='md:max-w-60' data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='budget-name'>{t('name')}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id='budget-name'
                    placeholder={t('name_placeholder')}
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                  />
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <div className='grid gap-6 md:grid-cols-2'>
            <Controller
              name='startDate'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='budget-start-date'>{t('start_date')}</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        id='date-picker-simple'
                        className='data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal'
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Select a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        defaultMonth={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name='endDate'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='budget-end-date'>{t('end_date')}</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        id='budget-end-date'
                        className='data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal'
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Select a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value ?? undefined}
                        onSelect={field.onChange}
                        defaultMonth={field.value ?? undefined}
                      />
                    </PopoverContent>
                  </Popover>

                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </div>

      <TemplateBudgetSelect
        value={templateId}
        onValueChange={value => void changeTemplate(value)}
        disabled={isPending}
      />
      <div className='flex items-start gap-2 rounded-md border w-fit bg-muted/50 p-3'>
        <Info aria-hidden='true' className='mt-0.5 size-4 shrink-0 text-muted-foreground' />
        <p className='text-sm text-muted-foreground'>
          {templateId === 'blank' ? t('template_info_blank') : t('template_info_starter')}
        </p>
      </div>
      <StepFooter onCancel={cancel} onNext={() => void goToStructure()} disabled={isPending} />
    </>
  )
}
