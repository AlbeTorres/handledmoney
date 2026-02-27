export interface Account {
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  id: string
  plaidId: string | null
  userId: string
  name: string
  bank: string
  type: string
  currency: string
  balance: string
  icon: string
  color: string
  transactionsCount: number
}

export interface AccountResponseData {
  state: boolean
  error_code: 401 | 500 | 403 | 404 | 200 | 400
  error: any | null
  message: string | null
  data?: Account
}
export interface AccountsResponseData {
  state: boolean
  error_code: 401 | 500 | 403 | 404 | 200 | 400
  error: any | null
  message: string | null
  data?: Account[]
}
