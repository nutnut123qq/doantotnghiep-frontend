import { toast as sonnerToast } from 'sonner'

export type NotifyType = 'success' | 'error' | 'info' | 'warning'

export interface NotifyOptions {
  silent?: boolean
  duration?: number
}

/**
 * Shared notification helper that prevents duplicate toasts
 * Supports a silent flag to prevent showing toasts (useful for axios interceptor)
 */
export const notify = {
  success: (message: string, options?: NotifyOptions) => {
    if (options?.silent) return
    sonnerToast.success(message, { duration: options?.duration })
  },
  
  error: (message: string, options?: NotifyOptions) => {
    if (options?.silent) return
    sonnerToast.error(message, { duration: options?.duration })
  },
  
  info: (message: string, options?: NotifyOptions) => {
    if (options?.silent) return
    sonnerToast.info(message, { duration: options?.duration })
  },
  
  warning: (message: string, options?: NotifyOptions) => {
    if (options?.silent) return
    sonnerToast.warning(message, { duration: options?.duration })
  },
  
  show: (type: NotifyType, message: string, options?: NotifyOptions) => {
    if (options?.silent) return
    switch (type) {
      case 'success':
        sonnerToast.success(message, { duration: options?.duration })
        break
      case 'error':
        sonnerToast.error(message, { duration: options?.duration })
        break
      case 'info':
        sonnerToast.info(message, { duration: options?.duration })
        break
      case 'warning':
        sonnerToast.warning(message, { duration: options?.duration })
        break
    }
  },
}
