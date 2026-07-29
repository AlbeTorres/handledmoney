'use client'

import { CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

type Status = 'cleared' | 'pending' | 'recurring'

interface TransactionStatusBadgeProps {
  status: Status | null | undefined
}

const STATUS_CONFIG: Record<Status, { icon: typeof CheckCircle; className: string }> = {
  cleared: {
    icon: CheckCircle,
    className: 'bg-emerald-50 text-emerald-700',
  },
  pending: {
    icon: Clock,
    className: 'bg-amber-50 text-amber-700',
  },
  recurring: {
    icon: RefreshCw,
    className: 'bg-slate-100 text-slate-600',
  },
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const t = useTranslations('handledmoney.transaction')

  if (!status) return null

  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.className}`}
    >
      <Icon className='size-3' />
      {t(`status.${status}`)}
    </span>
  )
}
