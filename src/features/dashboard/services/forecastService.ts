import { apiClient } from '@/infrastructure/api/apiClient'

export interface ForecastResult {
  symbol: string
  trend: 'Up' | 'Down' | 'Sideways'
  confidence: 'High' | 'Medium' | 'Low'
  confidenceScore: number
  timeHorizon: 'short' | 'medium' | 'long'
  recommendation: 'Buy' | 'Hold' | 'Sell'
  keyDrivers?: string[] | null
  risks?: string[] | null
  analysis: string
  generatedAt: string
}

export interface AllForecasts {
  symbol: string
  forecasts: {
    shortTerm: ForecastResult
    mediumTerm: ForecastResult
    longTerm: ForecastResult
  }
}

export interface BatchForecastItem {
  symbol: string
  trend?: string
  confidence?: string
  recommendation?: string
  error?: string
}

export const forecastService = {
  async getForecast(symbol: string, timeHorizon: 'short' | 'medium' | 'long' = 'short'): Promise<ForecastResult> {
    try {
      const response = await apiClient.get<ForecastResult>(`/api/Forecast/${symbol}?timeHorizon=${timeHorizon}`)
      // Normalize data to ensure arrays are never null
      const data = response.data
      return {
        ...data,
        keyDrivers: data.keyDrivers || [],
        risks: data.risks || [],
      }
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Không thể tải dự báo'
      throw new Error(errorMessage)
    }
  },

  async getAllForecasts(symbol: string): Promise<AllForecasts> {
    const response = await apiClient.get<AllForecasts>(`/api/Forecast/${symbol}/all`)
    return response.data
  },

  async getBatchForecasts(symbols: string[], timeHorizon: 'short' | 'medium' | 'long' = 'short'): Promise<{ forecasts: BatchForecastItem[] }> {
    const response = await apiClient.post<{ forecasts: BatchForecastItem[] }>('/api/Forecast/batch', {
      symbols,
      timeHorizon,
    })
    return response.data
  },

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'Up':
        return 'text-green-600'
      case 'Down':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  },

  getTrendBgColor(trend: string): string {
    switch (trend) {
      case 'Up':
        return 'bg-green-50 border-green-200'
      case 'Down':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  },

  getConfidenceColor(confidence: string): string {
    switch (confidence) {
      case 'High':
        return 'text-green-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'Low':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  },

  getRecommendationColor(recommendation: string): string {
    switch (recommendation) {
      case 'Buy':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Sell':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  },

  getTimeHorizonLabel(timeHorizon: string): string {
    switch (timeHorizon) {
      case 'short':
        return '1-5 ngày'
      case 'medium':
        return '1-4 tuần'
      case 'long':
        return '1-3 tháng'
      default:
        return timeHorizon
    }
  },
}

