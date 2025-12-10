import { apiClient } from '@/infrastructure/api/apiClient'

export interface AIInsight {
  id: string
  symbol: string
  type: 'buy' | 'sell' | 'hold'
  title: string
  description: string
  confidence: number
  timestamp: string
  reasoning: string[]
  targetPrice?: number
  stopLoss?: number
}

export interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral'
  score: number
  indicators: {
    name: string
    value: number
    signal: 'positive' | 'negative' | 'neutral'
  }[]
}

export const aiInsightsService = {
  async getInsights(filters?: { type?: string; symbol?: string }): Promise<AIInsight[]> {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.symbol) params.append('symbol', filters.symbol)
    
    const response = await apiClient.get<AIInsight[]>(`/api/AIInsights?${params.toString()}`)
    return response.data
  },

  async getInsightById(id: string): Promise<AIInsight> {
    const response = await apiClient.get<AIInsight>(`/api/AIInsights/${id}`)
    return response.data
  },

  async getMarketSentiment(): Promise<MarketSentiment> {
    const response = await apiClient.get<MarketSentiment>('/api/AIInsights/sentiment')
    return response.data
  },

  async dismissInsight(id: string): Promise<void> {
    await apiClient.post(`/api/AIInsights/${id}/dismiss`)
  },
}

