export enum AlertType {
  Price = 1,
  Volume = 2,
  TechnicalIndicator = 3,
  Sentiment = 4,
  Volatility = 5,
}

export interface Alert {
  id: string
  symbol?: string
  type: AlertType
  condition: string
  threshold?: number
  timeframe?: string
  isActive: boolean
  createdAt: string
  triggeredAt?: string
}

export interface CreateAlertRequest {
  symbol?: string
  naturalLanguageInput?: string
  type?: AlertType
  condition?: string
  threshold?: number
  timeframe?: string
}

export interface CreateAlertResponse {
  id: string
  symbol: string
  type: AlertType
  condition: string
  threshold?: number
  isActive: boolean
  createdAt: string
}

export interface GetAlertsResponse {
  alerts: Alert[]
}

export interface ParsedAlert {
  symbol: string
  type: string
  operator: string
  value: number
  timeframe?: string
}

export const AlertTypeLabels: Record<AlertType, string> = {
  [AlertType.Price]: 'Price',
  [AlertType.Volume]: 'Volume',
  [AlertType.TechnicalIndicator]: 'Technical Indicator',
  [AlertType.Sentiment]: 'Sentiment',
  [AlertType.Volatility]: 'Volatility',
}
