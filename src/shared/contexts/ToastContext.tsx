import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { id, type, message, duration }
    
    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  const success = useCallback((message: string, duration?: number) => {
    showToast('success', message, duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast('error', message, duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast('info', message, duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast('warning', message, duration)
  }, [showToast])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-6 w-6" />
      case 'error': return <XCircleIcon className="h-6 w-6" />
      case 'warning': return <ExclamationTriangleIcon className="h-6 w-6" />
      case 'info': return <InformationCircleIcon className="h-6 w-6" />
    }
  }

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map((toast) => (
          <Transition
            key={toast.id}
            show={true}
            enter="transition ease-out duration-300"
            enterFrom="transform opacity-0 translate-x-full"
            enterTo="transform opacity-100 translate-x-0"
            leave="transition ease-in duration-200"
            leaveFrom="transform opacity-100 translate-x-0"
            leaveTo="transform opacity-0 translate-x-full"
          >
            <div className={`flex items-start p-4 rounded-lg border shadow-lg ${getStyles(toast.type)}`}>
              <div className="flex-shrink-0">
                {getIcon(toast.type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </Transition>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

