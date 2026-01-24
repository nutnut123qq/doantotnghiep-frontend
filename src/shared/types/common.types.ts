export interface ApiResponse<T> {
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export type QueryParams = Record<string, string | number | boolean | undefined>