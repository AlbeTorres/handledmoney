import { Check, Info, PieChart, Square } from 'lucide-react'
import { useState } from 'react'

const TemplateBudgetSelect = () => {
  // Estado para manejar la plantilla seleccionada ('blank' o 'zero-sum')
  const [selectedTemplate, setSelectedTemplate] = useState('zero-sum')

  // Datos de las plantillas
  const templates = [
    {
      id: 'blank',
      icon: <Square className='w-6 h-6' strokeWidth={1.5} />,
      title: 'Start Blank',
      description: 'Build your budget categories from scratch.',
      info: 'No categories will be created. You will start with a completely empty budget.',
    },
    {
      id: 'zero-sum',
      icon: <PieChart className='w-6 h-6' strokeWidth={1.5} />,
      title: 'Zero-Sum Starter',
      description: 'Standard categories setup for zero-based budgeting.',
      info: 'Includes categories for Housing, Savings, Food, Transport, and Utilities with $0.00 assigned.',
    },
  ]

  return (
    <div className='mb-8'>
      <label className='block label-caps text-muted-foreground mb-3'>
        STARTING TEMPLATE
      </label>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        {templates.map(template => {
          const isSelected = selectedTemplate === template.id

          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={
                isSelected
                  ? 'border-2 border-primary rounded-lg p-4 cursor-pointer bg-card relative elevation-2 transition-all'
                  : 'border border-border rounded-lg p-4 cursor-pointer hover:border-primary hover:bg-muted/50 transition-all'
              }
            >
              {/* Mostrar el check absolute solo si está seleccionado */}
              {isSelected && (
                <div className='absolute -top-3 -right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm'>
                  <Check className='w-4 h-4 text-primary-foreground' strokeWidth={3} />
                </div>
              )}

              <div className='flex items-center justify-between mb-3'>
                <div className={isSelected ? 'text-primary' : 'text-muted-foreground'}>
                  {template.icon}
                </div>
                {/* Círculo de selección (radio button visual) */}
                <div
                  className={
                    isSelected
                      ? 'w-4 h-4 rounded-full border-4 border-primary bg-background'
                      : 'w-4 h-4 rounded-full border border-border'
                  }
                ></div>
              </div>

              <h4
                className={`body-lg font-medium mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}
              >
                {template.title}
              </h4>
              <p className='body-sm text-muted-foreground'>
                {template.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Cuadro de información dinámico */}
      <div className='bg-muted p-4 rounded-md border border-border flex items-start gap-3'>
        <Info className='text-muted-foreground mt-0.5 w-5 h-5 shrink-0' />
        <p className='body-sm text-muted-foreground leading-relaxed'>
          {templates.find(t => t.id === selectedTemplate)?.info}
        </p>
      </div>
    </div>
  )
}

export default TemplateBudgetSelect
