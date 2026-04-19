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

export const AlertTypeLabels: Record<AlertType, string> = {
  [AlertType.Price]: 'Price',
  [AlertType.Volume]: 'Volume',
  [AlertType.TechnicalIndicator]: 'Technical Indicator',
  [AlertType.Sentiment]: 'Sentiment',
  [AlertType.Volatility]: 'Volatility',
}

/** API / DB / SignalR dùng nghìn VND cho giá; form & bảng dùng VND đầy đủ. */
export const PRICE_ALERT_VND_SCALE = 1000

export function coerceAlertType(type: unknown): AlertType {
  if (typeof type === 'number' && type >= 1 && type <= 5) {
    return type as AlertType
  }
  if (typeof type === 'string') {
    const byName: Record<string, AlertType> = {
      Price: AlertType.Price,
      Volume: AlertType.Volume,
      TechnicalIndicator: AlertType.TechnicalIndicator,
      Sentiment: AlertType.Sentiment,
      Volatility: AlertType.Volatility,
    }
    if (byName[type] !== undefined) return byName[type]
    const n = parseInt(type, 10)
    if (!Number.isNaN(n) && n >= 1 && n <= 5) return n as AlertType
  }
  return AlertType.Price
}

export function isPriceAlertType(type: string | AlertType): boolean {
  return type === 'Price' || type === AlertType.Price
}

export function priceThresholdUserToApi(
  type: AlertType | undefined,
  threshold: number | undefined
): number | undefined {
  if (threshold === undefined || threshold === null) return undefined
  if (type === AlertType.Price) return threshold / PRICE_ALERT_VND_SCALE
  return threshold
}

export function priceThresholdApiToUser(
  type: AlertType | undefined,
  threshold: number | null | undefined
): number | null | undefined {
  if (threshold === null || threshold === undefined) return threshold
  if (type === AlertType.Price) return threshold * PRICE_ALERT_VND_SCALE
  return threshold
}
