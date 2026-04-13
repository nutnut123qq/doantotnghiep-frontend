import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAlertNotifications } from '@/hooks/useAlertNotifications'
import { useAlertTriggeredFeed } from '@/shared/contexts/AlertTriggeredFeedContext'
import type { AlertNotification } from '@/features/settings/types/notificationChannel.types'

/**
 * Single SignalR subscription for the app: append to persistent feed (sessionStorage + context)
 * and refetch alerts. No toast — list on /alerts stays visible.
 */
export function GlobalAlertNotifications() {
  const queryClient = useQueryClient()
  const { append } = useAlertTriggeredFeed()

  const onAlertTriggered = useCallback(
    (notification: AlertNotification) => {
      append(notification)
      void queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    [append, queryClient]
  )

  useAlertNotifications({
    showToast: false,
    onAlertTriggered,
  })

  return null
}
