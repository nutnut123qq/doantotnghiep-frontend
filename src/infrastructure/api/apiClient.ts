import axios from 'axios'
import { config } from '../config/env'
import { storage } from '../storage/localStorage'

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get<string>('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove('token')
      storage.remove('user')
      window.location.href = '/login'
    } else if (error.response) {
      // Handle other HTTP errors
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred'
      
      // Only show toast for client errors (4xx) and server errors (5xx)
      // Skip 401 as it's handled above
      // Skip 404 for UserPreference endpoints (expected when preference doesn't exist)
      const isExpected404 = status === 404 && 
        error.config?.url?.toLowerCase().includes('/userpreference')
      
      if (status >= 400 && status !== 401 && !isExpected404) {
        // Import toast dynamically to avoid circular dependencies
        import('sonner').then(({ toast }) => {
          if (status >= 500) {
            toast.error(`Server error: ${message}`)
          } else {
            toast.error(message)
          }
        })
      }
    } else if (error.request) {
      // Network error
      import('sonner').then(({ toast }) => {
        toast.error('Network error: Please check your connection')
      })
    }
    
    return Promise.reject(error)
  }
)

