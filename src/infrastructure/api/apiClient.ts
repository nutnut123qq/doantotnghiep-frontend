import axios, { AxiosRequestConfig } from 'axios'
import { config } from '../config/env'
import { storage } from '../storage/localStorage'
import { notify } from '@/shared/utils/notify'

// Extend AxiosRequestConfig to support silent flag
declare module 'axios' {
  export interface AxiosRequestConfig {
    silent?: boolean // If true, don't show toast notifications for errors
  }
}

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

const LOGIN_RETURN_URL_KEY = 'login_returnUrl'

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSilent = error.config?.silent === true

    if (error.response?.status === 401) {
      const path = typeof window !== 'undefined' ? window.location.pathname : ''
      if (path === '/login') return Promise.reject(error)
      storage.remove('token')
      storage.remove('user')
      if (typeof window !== 'undefined') {
        const returnUrl = window.location.pathname + window.location.search || '/'
        try {
          sessionStorage.setItem(LOGIN_RETURN_URL_KEY, returnUrl)
        } catch {
          /* ignore */
        }
        window.location.href = '/login'
      }
      return Promise.reject(error)
    } else if (error.response) {
      // Handle other HTTP errors
      const status = error.response.status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred'
      
      // Only show toast for client errors (4xx) and server errors (5xx)
      // Skip 401 as it's handled above
      // Skip 404 for UserPreference endpoints (expected when preference doesn't exist)
      const isExpected404 = status === 404 && 
        error.config?.url?.toLowerCase().includes('/userpreference')
      
      if (status >= 400 && status !== 401 && !isExpected404 && !isSilent) {
        if (status >= 500) {
          notify.error(`Server error: ${message}`)
        } else {
          notify.error(message)
        }
      }
    } else if (error.request && !isSilent) {
      // Network error
      notify.error('Network error: Please check your connection')
    }
    
    return Promise.reject(error)
  }
)

