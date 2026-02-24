export interface Account {
  id: string
  name: string
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
