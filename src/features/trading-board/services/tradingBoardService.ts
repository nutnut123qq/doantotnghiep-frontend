import { apiClient } from '@/infrastructure/api/apiClient'
import type { StockTicker } from '@/domain/entities/StockTicker'

export interface TradingBoardFilters {
  exchange?: string
  index?: string
  industry?: string
  watchlistId?: string
}

export const tradingBoardService = {
  async getTickers(filters?: TradingBoardFilters): Promise<StockTicker[]> {
    const params = new URLSearchParams()
    if (filters?.exchange) params.append('exchange', filters.exchange)
    if (filters?.index) params.append('index', filters.index)
    if (filters?.industry) params.append('industry', filters.industry)
    if (filters?.watchlistId) params.append('watchlistId', filters.watchlistId)

    const response = await apiClient.get<StockTicker[]>(`/api/TradingBoard?${params.toString()}`)
    return response.data
  },

  async getTickerById(id: string): Promise<StockTicker> {
    const response = await apiClient.get<StockTicker>(`/api/TradingBoard/${id}`)
    return response.data
  },
}

