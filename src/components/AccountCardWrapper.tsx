'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AccountCard } from './AccountCard'
import { DeleteAccountDialog } from './DeleteAccountDialog'
import { ICONS } from './IconPicker'

interface AccountCardWrapperProps {
  account: {
    id: string
    name: string | null
    bank: string | null
    type: string | null
    currency: string | null
    balance: string | null
    icon: string | null
    color: string | null
  }
  hasTransactions: boolean
  otherAccounts: { id: string; name: string }[]
}

export function AccountCardWrapper({
  account,
  hasTransactions,
  otherAccounts,
}: AccountCardWrapperProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()

  const handleEdit = () => {
    router.push(`/account/${account.id}/edit`)
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  // Find the icon component based on the name stored in DB
  const iconData = ICONS.find(i => i.name === (account.icon || 'account_balance'))
  const iconComponent = iconData?.icon ?? ICONS[0].icon

  return (
    <>
      <AccountCard
        id={account.id}
        institution={account.bank ?? 'Unknown Bank'}
        name={account.name ?? 'Unnamed Account'}
        balance={
          account.balance
            ? parseFloat(account.balance).toLocaleString('en-US', {
                style: 'currency',
                currency: account.currency ?? 'USD',
              })
            : '$0.00'
        }
        currency={account.currency ?? 'USD'}
        detail={account.type ?? 'General'}
        status='Active' // Hardcoded for now as per current design
        statusVariant='active'
        accentColor={account.color ? `#${account.color}` : '#3b82f6'}
        icon={iconComponent}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DeleteAccountDialog
        id={account.id}
        name={account.name ?? 'Unnamed Account'}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        hasTransactions={hasTransactions}
        otherAccounts={otherAccounts}
      />
    </>
  )
}
