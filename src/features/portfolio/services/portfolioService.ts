import { apiClient } from '@/infrastructure/api/apiClient'

export interface Holding {
  id: string
  symbol: string
  name: string
  shares: number
  avgPrice: number
  currentPrice: number
  value: number
  gainLoss: number
  gainLossPercentage: number
}

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercentage: number
  holdingsCount: number
}

export const portfolioService = {
  async getHoldings(): Promise<Holding[]> {
    const response = await apiClient.get<Holding[]>('/api/Portfolio/holdings')
    return response.data
  },

  async getSummary(): Promise<PortfolioSummary> {
    const response = await apiClient.get<PortfolioSummary>('/api/Portfolio/summary')
    return response.data
  },

  async addHolding(data: { symbol: string; shares: number; avgPrice: number }): Promise<Holding> {
    const response = await apiClient.post<Holding>('/api/Portfolio/holdings', data)
    return response.data
  },

  async updateHolding(id: string, data: { shares: number; avgPrice: number }): Promise<Holding> {
    const response = await apiClient.put<Holding>(`/api/Portfolio/holdings/${id}`, data)
    return response.data
  },

  async deleteHolding(id: string): Promise<void> {
    await apiClient.delete(`/api/Portfolio/holdings/${id}`)
  },
}

