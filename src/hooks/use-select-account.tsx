import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { JSX, useRef, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const useSelectAccount = (): [() => JSX.Element, () => Promise<unknown>] => {
  const accountQuery = {
    data: {
      data: [
        { id: '1', name: 'Account 1' },
        { id: '2', name: 'Account 2' },
        { id: '3', name: 'Account 3' },
      ],
    },
  }

  const accountOptions = (accountQuery.data?.data ?? []).map(account => ({
    label: account.name,
    value: account.id,
  }))
  const [promise, setPromise] = useState<{ resolve: (value: string | undefined) => void } | null>(
    null,
  )

  // const queryClient = useQueryClient()
  // const accountMutation = useCreateAccount()

  // const createNewAccount = (name: string) =>
  //   accountMutation.mutate(name, {
  //     onSuccess: () => {
  //       toast.success('Account created successfully')
  //       // Invalidate and refetch
  //       queryClient.invalidateQueries({ queryKey: ['accounts'] })
  //     },
  //     onError: () => toast.error('Something went wrong!'),
  //   })

  const selectValue = useRef<string>('')

  const confirm = () =>
    new Promise((resolve, reject) => {
      setPromise({ resolve })
    })

  const handleClose = () => {
    setPromise(null)
  }
  const handleConfirm = () => {
    promise?.resolve(selectValue.current)
    handleClose()
  }
  const handleCancel = () => {
    promise?.resolve(undefined)
    handleClose()
  }

  const AccountDialog = () => (
    <Dialog open={promise !== null}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Account</DialogTitle>
          <DialogDescription>Please select an account to continue</DialogDescription>
        </DialogHeader>

        <Select onValueChange={value => (selectValue.current = value)}>
          <SelectTrigger>
            <SelectValue placeholder='Select an account' />
          </SelectTrigger>
          <SelectContent>
            {accountOptions.map(account => (
              <SelectItem key={account.value} value={account.value}>
                {account.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter className='pt-2'>
          <Button onClick={handleCancel} variant={'outline'}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return [AccountDialog, confirm]
}
