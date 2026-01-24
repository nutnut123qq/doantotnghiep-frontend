import { apiClient } from '@/infrastructure/api/apiClient'
import { isAxiosError } from 'axios'

export interface WatchlistStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export interface Watchlist {
  id: string
  name: string
  stocks: WatchlistStock[]
  createdAt: string
}

// Backend DTO interfaces
interface StockTickerDto {
  id: string
  symbol: string
  name: string
  exchange: string
  industry?: string
  currentPrice: number
  change?: number
  changePercent?: number
  volume?: number
}

interface WatchlistDto {
  id: string
  name: string
  createdAt: string
  updatedAt?: string
  tickers: StockTickerDto[]
}

interface GetWatchlistsResponse {
  watchlists: WatchlistDto[]
}

interface CreateWatchlistResponse {
  id: string
  name: string
  createdAt: string
}

interface AddStockResponse {
  success: boolean
  message: string
}

interface RemoveStockResponse {
  success: boolean
  message: string
}

// Transform backend DTO to frontend interface
const transformStockTicker = (ticker: StockTickerDto): WatchlistStock => {
  return {
    symbol: ticker.symbol,
    name: ticker.name,
    price: Number(ticker.currentPrice),
    change: Number(ticker.change || 0),
    changePercent: Number(ticker.changePercent || 0),
  }
}

const transformWatchlist = (dto: WatchlistDto): Watchlist => {
  // Ensure id is always a string
  const id = dto.id ? String(dto.id) : ''
  if (!id) {
    console.error('Watchlist DTO missing id:', dto)
  }
  return {
    id,
    name: dto.name,
    stocks: dto.tickers.map(transformStockTicker),
    createdAt: dto.createdAt,
  }
}

export const watchlistService = {
  async getWatchlists(): Promise<Watchlist[]> {
    const response = await apiClient.get<GetWatchlistsResponse | WatchlistDto[]>('/Watchlist')
    
    // Handle both response formats: object with Watchlists property or array directly
    const data = response.data
    const watchlistDtos = Array.isArray(data) ? data : data.watchlists
    
    return watchlistDtos.map(transformWatchlist)
  },

  async getWatchlistById(id: string): Promise<Watchlist> {
    const response = await apiClient.get<WatchlistDto>(`/Watchlist/${id}`)
    return transformWatchlist(response.data)
  },

  async createWatchlist(name: string): Promise<Watchlist> {
    const response = await apiClient.post<CreateWatchlistResponse>('/Watchlist', { name })
    // CreateWatchlistResponse doesn't include stocks, so we return a minimal watchlist
    const id = response.data.id ? String(response.data.id) : ''
    if (!id) {
      console.error('CreateWatchlist response missing id:', response.data)
    }
    return {
      id,
      name: response.data.name,
      stocks: [],
      createdAt: response.data.createdAt,
    }
  },

  async updateWatchlist(id: string, name: string): Promise<Watchlist> {
    // Note: Backend may not have update endpoint yet
    // This will throw an error if endpoint doesn't exist
    try {
      const response = await apiClient.put<WatchlistDto>(`/Watchlist/${id}`, { name })
      return transformWatchlist(response.data)
    } catch (error: unknown) {
      if (isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 405)) {
        throw new Error('Chức năng cập nhật watchlist chưa được hỗ trợ')
      }
      throw error
    }
  },

  async deleteWatchlist(id: string): Promise<void> {
    await apiClient.delete(`/Watchlist/${id}`)
  },

  async addStock(watchlistId: string, symbol: string): Promise<void> {
    const response = await apiClient.post<AddStockResponse>(`/Watchlist/${watchlistId}/stocks`, { symbol })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add stock')
    }
  },

  async removeStock(watchlistId: string, symbol: string): Promise<void> {
    const response = await apiClient.delete<RemoveStockResponse>(`/Watchlist/${watchlistId}/stocks/${symbol}`)
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || 'Failed to remove stock')
    }
  },
}

