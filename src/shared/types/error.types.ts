// Type for API errors
export interface ApiError {
  message?: string
  error?: string
  errors?: string[]
  response?: {
    data?: {
      message?: string
      error?: string
    }
  }
}

// Type guard for ApiError
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error || 'error' in error || 'response' in error)
  )
}

// Helper to extract error message
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.response?.data?.error) {
      return error.response.data.error
    }
    if (error.message) {
      return error.message
    }
    if (error.error) {
      return error.error
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}
