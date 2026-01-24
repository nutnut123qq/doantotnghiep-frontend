import { apiClient } from '@/infrastructure/api/apiClient'

export interface DashboardStats {
  portfolioValue: number
  totalGainLoss: number
  totalGainLossPercentage: number
  todayChange: number
  todayChangePercentage: number
  activePositions: number
}

export interface PerformanceData {
  date: string
  value: number
}

export interface TopPerformer {
  symbol: string
  name: string
  change: number
  changePercentage: number
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/Dashboard/stats')
    return response.data
  },

  async getPerformanceData(period: '1W' | '1M' | '3M' | '6M' | '1Y' = '1M'): Promise<PerformanceData[]> {
    const response = await apiClient.get<PerformanceData[]>(`/Dashboard/performance?period=${period}`)
    return response.data
  },

  async getTopPerformers(limit = 5): Promise<TopPerformer[]> {
    const response = await apiClient.get<TopPerformer[]>(`/Dashboard/top-performers?limit=${limit}`)
    return response.data
  },
}

