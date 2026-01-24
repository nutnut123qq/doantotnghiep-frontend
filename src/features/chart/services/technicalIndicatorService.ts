import { apiClient } from '@/infrastructure/api/apiClient'

export interface TechnicalIndicator {
  id: string
  tickerId: string
  indicatorType: string // MA, RSI, MACD, EMA
  value?: number
  trendAssessment?: string // Bullish, Bearish, Neutral, Overbought, Oversold
  calculatedAt: string
}

export interface IndicatorsResponse {
  symbol: string
  indicators: TechnicalIndicator[]
}

export const technicalIndicatorService = {
  /**
   * Get all technical indicators for a symbol
   */
  async getIndicators(symbol: string): Promise<IndicatorsResponse> {
    const response = await apiClient.get<IndicatorsResponse>(
      `/TechnicalIndicator/${symbol}`
    )
    return response.data
  }
}
