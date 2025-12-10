export interface StockTicker {
  id: string
  symbol: string
  name: string
  exchange: 'HOSE' | 'HNX' | 'UPCOM'
  industry?: string
  currentPrice: number
  previousClose?: number
  change?: number
  changePercent?: number
  volume?: number
  value?: number
  lastUpdated: string
}

