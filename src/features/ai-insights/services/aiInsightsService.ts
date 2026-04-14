import { apiClient } from '@/infrastructure/api/apiClient'
import { isAxiosError } from 'axios'

export interface AIInsight {
  id: string
  symbol: string
  name?: string
  type: 'buy' | 'sell' | 'hold' | 'Buy' | 'Sell' | 'Hold'
  title: string
  description: string
  confidence: number
  timestamp: string
  generatedAt?: string
  isDeleted?: boolean
  reasoning: string[]
  targetPrice?: number
  stopLoss?: number
  qualityStatus?: 'approved' | 'needs_review' | 'rejected'
  qualityScore?: number
  evidence?: string[]
  qualityMetadata?: Record<string, string>
}

export interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral' | 'Bullish' | 'Bearish' | 'Neutral'
  score: number
  buySignalsCount: number
  sellSignalsCount: number
  holdSignalsCount: number
  opportunitiesCount: number
  riskLevel: 'low' | 'moderate' | 'high' | 'Low' | 'Moderate' | 'High'
  volatilityIndex: number
  indicators?: {
    name: string
    value: number
    signal: 'positive' | 'negative' | 'neutral'
  }[]
}

export interface AccuracyMetrics {
  evaluatedAt: string
  totalInsightsConsidered: number
  confidenceCalibrationError: number
  tPlus1: { eligibleInsights: number; correctPredictions: number; falseSignals: number; hitRate: number }
  tPlus5: { eligibleInsights: number; correctPredictions: number; falseSignals: number; hitRate: number }
  tPlus20: { eligibleInsights: number; correctPredictions: number; falseSignals: number; hitRate: number }
}

export const shouldRetryAIInsightsRequest = (failureCount: number, error: unknown): boolean => {
  if (isAxiosError(error)) {
    const status = error.response?.status

    // Avoid retry storms when backend is already rate-limiting.
    if (status === 429) return false

    // 4xx requests are usually not transient for these endpoints.
    if (typeof status === 'number' && status >= 400 && status < 500) return false
  }

  return failureCount < 1
}

export const aiInsightsService = {
  async getInsights(filters?: { type?: string; symbol?: string }): Promise<AIInsight[]> {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.symbol) params.append('symbol', filters.symbol)
    
    const response = await apiClient.get<AIInsight[]>(`/AIInsights?${params.toString()}`)
    return response.data
  },

  async getInsightById(id: string): Promise<AIInsight> {
    const response = await apiClient.get<AIInsight>(`/AIInsights/${id}`)
    return response.data
  },

  async getMarketSentiment(): Promise<MarketSentiment> {
    const response = await apiClient.get<MarketSentiment>('/AIInsights/sentiment')
    return response.data
  },

  async getAccuracyMetrics(maxInsights = 500): Promise<AccuracyMetrics> {
    const response = await apiClient.get<AccuracyMetrics>(`/AIInsights/metrics/accuracy?maxInsights=${maxInsights}`)
    return response.data
  },
}

