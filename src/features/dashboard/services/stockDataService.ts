import { apiClient } from '@/infrastructure/api/apiClient'

export interface OHLCVData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockQuote {
  symbol: string
  name: string
  exchange: string
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
}

export interface StockSymbol {
  symbol: string
  name: string
  exchange: string
  industry?: string
}

export const stockDataService = {
  async getOHLCVData(
    symbol: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<OHLCVData[]> {
    const params = new URLSearchParams()
    if (startDate) {
      params.append('startDate', startDate.toISOString())
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString())
    }

    const response = await apiClient.get<OHLCVData[]>(
      `/api/StockData/ohlcv/${symbol}?${params.toString()}`
    )
    return response.data
  },

  async getQuote(symbol: string): Promise<StockQuote> {
    const response = await apiClient.get<StockQuote>(`/api/StockData/quote/${symbol}`)
    return response.data
  },

  async getSymbols(exchange?: string): Promise<StockSymbol[]> {
    const params = exchange ? `?exchange=${exchange}` : ''
    const response = await apiClient.get<StockSymbol[]>(`/api/StockData/symbols${params}`)
    return response.data
  },
}

