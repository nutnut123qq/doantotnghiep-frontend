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

export const watchlistService = {
  async getWatchlists(): Promise<Watchlist[]> {
    const response = await apiClient.get<Watchlist[]>('/api/Watchlist')
    return response.data
  },

  async getWatchlistById(id: string): Promise<Watchlist> {
    const response = await apiClient.get<Watchlist>(`/api/Watchlist/${id}`)
    return response.data
  },

  async createWatchlist(name: string): Promise<Watchlist> {
    const response = await apiClient.post<Watchlist>('/api/Watchlist', { name })
    return response.data
  },

  async updateWatchlist(id: string, name: string): Promise<Watchlist> {
    const response = await apiClient.put<Watchlist>(`/api/Watchlist/${id}`, { name })
    return response.data
  },

  async deleteWatchlist(id: string): Promise<void> {
    await apiClient.delete(`/api/Watchlist/${id}`)
  },

  async addStock(watchlistId: string, symbol: string): Promise<Watchlist> {
    const response = await apiClient.post<Watchlist>(`/api/Watchlist/${watchlistId}/stocks`, { symbol })
    return response.data
  },

  async removeStock(watchlistId: string, symbol: string): Promise<void> {
    await apiClient.delete(`/api/Watchlist/${watchlistId}/stocks/${symbol}`)
  },
}

