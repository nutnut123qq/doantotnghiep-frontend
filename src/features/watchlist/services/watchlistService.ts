import { apiClient } from '@/infrastructure/api/apiClient'

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
    const response = await apiClient.get<GetWatchlistsResponse | WatchlistDto[]>('/api/Watchlist')
    
    // Handle both response formats: object with Watchlists property or array directly
    let watchlistDtos: WatchlistDto[]
    if (Array.isArray(response.data)) {
      // If response is array, use it directly
      watchlistDtos = response.data as any[]
    } else if ('watchlists' in response.data) {
      // If response has Watchlists property
      watchlistDtos = (response.data as GetWatchlistsResponse).watchlists
    } else {
      // Fallback: try to use response.data as array
      watchlistDtos = response.data as any[]
    }
    
    return watchlistDtos.map(transformWatchlist)
  },

  async getWatchlistById(id: string): Promise<Watchlist> {
    const response = await apiClient.get<WatchlistDto>(`/api/Watchlist/${id}`)
    return transformWatchlist(response.data)
  },

  async createWatchlist(name: string): Promise<Watchlist> {
    interface CreateWatchlistResponse {
      id: string
      name: string
      createdAt: string
    }
    const response = await apiClient.post<CreateWatchlistResponse>('/api/Watchlist', { name })
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
      const response = await apiClient.put<WatchlistDto>(`/api/Watchlist/${id}`, { name })
      return transformWatchlist(response.data)
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        throw new Error('Chức năng cập nhật watchlist chưa được hỗ trợ')
      }
      throw error
    }
  },

  async deleteWatchlist(id: string): Promise<void> {
    await apiClient.delete(`/api/Watchlist/${id}`)
  },

  async addStock(watchlistId: string, symbol: string): Promise<void> {
    interface AddStockResponse {
      success: boolean
      message: string
    }
    const response = await apiClient.post<AddStockResponse>(`/api/Watchlist/${watchlistId}/stocks`, { symbol })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add stock')
    }
  },

  async removeStock(watchlistId: string, symbol: string): Promise<void> {
    interface RemoveStockResponse {
      success: boolean
      message: string
    }
    const response = await apiClient.delete<RemoveStockResponse>(`/api/Watchlist/${watchlistId}/stocks/${symbol}`)
    if (response.data && !response.data.success) {
      throw new Error(response.data.message || 'Failed to remove stock')
    }
  },
}

