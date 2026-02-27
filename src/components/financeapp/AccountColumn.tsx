import { useAccountState } from '@/store'

type Props = {
  accountId: string
  accountName: string
}

export const AccountColumn = ({ accountId, accountName }: Props) => {
  const { onOpen } = useAccountState()
  return (
    <div
      className='flex items-center cursor-pointer hover:underline'
      onClick={() => onOpen(accountId)}
    >
      {accountName}
    </div>
  )
}
