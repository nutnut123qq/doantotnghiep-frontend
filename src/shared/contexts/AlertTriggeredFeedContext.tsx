import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AlertNotification } from '@/features/settings/types/notificationChannel.types'

const STORAGE_KEY = 'alertTriggeredFeed'
const MAX_ITEMS = 40

export interface AlertFeedItem extends AlertNotification {
  id: string
  receivedAt: string
}

function loadFromStorage(): AlertFeedItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (x): x is AlertFeedItem =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as AlertFeedItem).id === 'string'
    )
  } catch {
    return []
  }
}

function saveToStorage(items: AlertFeedItem[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore quota / private mode
  }
}

interface AlertTriggeredFeedContextValue {
  items: AlertFeedItem[]
  append: (notification: AlertNotification) => void
  dismiss: (id: string) => void
  clearAll: () => void
}

const AlertTriggeredFeedContext = createContext<AlertTriggeredFeedContextValue | null>(null)

export function AlertTriggeredFeedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AlertFeedItem[]>(() => loadFromStorage())

  const append = useCallback((notification: AlertNotification) => {
    const receivedAt = new Date().toISOString()
    const id = `${notification.alertId}-${receivedAt}-${Math.random().toString(36).slice(2, 9)}`
    const row: AlertFeedItem = { ...notification, id, receivedAt }
    setItems((prev) => {
      const next = [row, ...prev].slice(0, MAX_ITEMS)
      saveToStorage(next)
      return next
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id)
      saveToStorage(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* empty */
    }
  }, [])

  const value = useMemo(
    () => ({ items, append, dismiss, clearAll }),
    [items, append, dismiss, clearAll]
  )

  return (
    <AlertTriggeredFeedContext.Provider value={value}>
      {children}
    </AlertTriggeredFeedContext.Provider>
  )
}

export function useAlertTriggeredFeed() {
  const ctx = useContext(AlertTriggeredFeedContext)
  if (!ctx) {
    throw new Error('useAlertTriggeredFeed must be used within AlertTriggeredFeedProvider')
  }
  return ctx
}
