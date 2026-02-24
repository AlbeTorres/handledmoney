export interface Category {
  id: string
  name: string
}

export interface CategoryResponseData {
  state: boolean
  error_code: 401 | 500 | 403 | 404 | 200 | 400
  error: any | null
  message: string | null
  data?: Category
}
