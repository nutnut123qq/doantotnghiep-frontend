export enum NotificationEventType {
  PriceAlert = 1,
  NewsSummary = 2,
  EventUpcoming = 3,
  ForecastUpdated = 4,
  VolumeAlert = 5,
}

export interface NotificationTemplate {
  id: string
  name: string
  eventType: NotificationEventType
  subject: string
  body: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PushNotificationConfig {
  id: string
  serviceName: string
  serverKey?: string
  appId?: string
  config?: string
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export const NOTIFICATION_EVENT_TYPE_LABELS: Record<NotificationEventType, string> = {
  [NotificationEventType.PriceAlert]: 'Price Alert',
  [NotificationEventType.NewsSummary]: 'News Summary',
  [NotificationEventType.EventUpcoming]: 'Event Upcoming',
  [NotificationEventType.ForecastUpdated]: 'Forecast Updated',
  [NotificationEventType.VolumeAlert]: 'Volume Alert',
}

export const TEMPLATE_VARIABLES: Record<string, string> = {
  stockSymbol: 'Stock symbol (e.g., VIC)',
  companyName: 'Company name',
  price: 'Current price',
  change: 'Price change',
  changePercent: 'Price change percentage',
  volume: 'Trading volume',
  condition: 'Alert condition',
  timestamp: 'Event timestamp',
  eventTitle: 'Event title',
  eventDate: 'Event date',
}

