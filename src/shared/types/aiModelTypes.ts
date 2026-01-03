export interface AIModelConfig {
  id: string
  modelName: string
  version: string
  apiKey?: string
  settings?: string
  updateFrequencyMinutes: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AIModelPerformance {
  id: string
  featureType: string
  accuracy: number
  averageResponseTimeMs: number
  successCount: number
  failureCount: number
  recordedAt: string
}

export interface PerformanceSummary {
  overallAccuracy: number
  overallAverageResponseTimeMs: number
  totalSuccessCount: number
  totalFailureCount: number
  successRate: number
}

export interface AIModelPerformanceResponse {
  metrics: AIModelPerformance[]
  summary: PerformanceSummary
}

