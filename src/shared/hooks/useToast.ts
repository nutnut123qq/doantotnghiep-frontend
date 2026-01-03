import { toast as sonnerToast } from 'sonner'

export const useToast = () => {
  return {
    success: (message: string) => sonnerToast.success(message),
    error: (message: string) => sonnerToast.error(message),
    info: (message: string) => sonnerToast.info(message),
    warning: (message: string) => sonnerToast.warning(message),
    showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
      switch (type) {
        case 'success':
          sonnerToast.success(message)
          break
        case 'error':
          sonnerToast.error(message)
          break
        case 'info':
          sonnerToast.info(message)
          break
        case 'warning':
          sonnerToast.warning(message)
          break
      }
    },
  }
}

