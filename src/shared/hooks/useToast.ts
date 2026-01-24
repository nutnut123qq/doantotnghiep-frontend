import { notify } from '@/shared/utils/notify'
import type { NotifyType, NotifyOptions } from '@/shared/utils/notify'

export const useToast = () => {
  return {
    success: (message: string, options?: NotifyOptions) => notify.success(message, options),
    error: (message: string, options?: NotifyOptions) => notify.error(message, options),
    info: (message: string, options?: NotifyOptions) => notify.info(message, options),
    warning: (message: string, options?: NotifyOptions) => notify.warning(message, options),
    showToast: (type: NotifyType, message: string, options?: NotifyOptions) => {
      notify.show(type, message, options)
    },
  }
}

