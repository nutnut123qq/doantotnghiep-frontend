import { useState } from 'react'
import { toast } from 'sonner'
import { notificationTemplateService } from '../services/notificationTemplateService'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import type { PushNotificationConfig } from '@/shared/types/notificationTemplateTypes'

export const usePushConfig = () => {
  const [pushConfig, setPushConfig] = useState<PushNotificationConfig | null>(null)
  const [isLoadingPushConfig, setIsLoadingPushConfig] = useState(false)

  const loadPushConfig = async () => {
    try {
      setIsLoadingPushConfig(true)
      const config = await notificationTemplateService.getPushConfig()
      setPushConfig(config)
    } catch (error: unknown) {
      toast.error(getAxiosErrorMessage(error) || 'Failed to load push config')
    } finally {
      setIsLoadingPushConfig(false)
    }
  }

  return {
    pushConfig,
    isLoadingPushConfig,
    loadPushConfig,
  }
}
