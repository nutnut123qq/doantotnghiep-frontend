import { useCallback, useEffect } from 'react'
import { useSignalR } from '@/shared/hooks/useSignalR'
import { notify } from '@/shared/utils/notify'
import type { AlertNotification } from '@/features/settings/types/notificationChannel.types'

/**
 * Subscribes to real-time alert notifications via SignalR Trading hub.
 * Uses shared useSignalR (token key "token", config.signalRUrl + hub "trading").
 */
export const useAlertNotifications = () => {
  const { on } = useSignalR('trading')

  const handleAlertTriggered = useCallback((notification: AlertNotification) => {
    const msg = [
      `🔔 Alert: ${notification.symbol} ${notification.type}`,
      `Threshold: ${Number(notification.threshold).toLocaleString()}`,
      `Current: ${Number(notification.currentValue).toLocaleString()}`,
      notification.aiExplanation ? `💡 ${notification.aiExplanation}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    notify.success(msg, { duration: 8000 })
  }, [])

  useEffect(() => {
    const unsub = on('AlertTriggered', handleAlertTriggered as (...args: unknown[]) => void)
    return unsub
  }, [on, handleAlertTriggered])
}
