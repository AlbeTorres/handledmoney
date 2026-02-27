export interface Account {
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  id: string
  plaidId: string | null
  userId: string
  name: string | null
  bank: string | null
  type: string | null
  currency: string | null
  balance: string | null
  icon: string | null
  color: string | null
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
