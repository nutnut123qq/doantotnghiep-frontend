import { useCallback, useEffect } from 'react'
import { useSignalR } from '@/shared/hooks/useSignalR'
import { notify } from '@/shared/utils/notify'
import type { AlertNotification } from '@/features/settings/types/notificationChannel.types'

/**
 * Subscribes to real-time alert notifications via SignalR Trading hub.
 * Uses shared useSignalR (token key "token", config.signalRUrl + hub "trading").
 */
interface UseAlertNotificationsOptions {
  onAlertTriggered?: (notification: AlertNotification) => void
  showToast?: boolean
}

export const useAlertNotifications = (options?: UseAlertNotificationsOptions) => {
  const { on, isConnected } = useSignalR('trading')
  const showToast = options?.showToast ?? true
  const onAlertTriggered = options?.onAlertTriggered

  const handleAlertTriggered = useCallback((notification: AlertNotification) => {
    onAlertTriggered?.(notification)

    if (showToast) {
      const threshold = Number(notification.threshold)
      const currentValue = Number(notification.currentValue)

      const msg = [
        `🔔 Alert: ${notification.symbol} ${notification.type}`,
        `Threshold: ${threshold.toLocaleString('vi-VN')}`,
        `Current: ${currentValue.toLocaleString('vi-VN')}`,
      ].join('\n')

      notify.success(msg, { duration: 8000 })
    }
  }, [onAlertTriggered, showToast])

  // useSignalR sets connectionRef asynchronously; calling on() before connect yields a no-op.
  // Subscribe only after the hub is connected so AlertTriggered handlers actually attach.
  useEffect(() => {
    if (!isConnected) return
    const unsub = on('AlertTriggered', handleAlertTriggered as (...args: unknown[]) => void)
    return unsub
  }, [isConnected, on, handleAlertTriggered])
}
