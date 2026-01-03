import { apiClient } from '@/infrastructure/api/apiClient'
import type { AIModelConfig, AIModelPerformanceResponse } from '@/shared/types/aiModelTypes'

export const aiModelConfigService = {
  async getConfig(): Promise<AIModelConfig | null> {
    try {
      const response = await apiClient.get<AIModelConfig>('/api/AIModelConfig/config')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async updateConfig(config: Partial<AIModelConfig>): Promise<AIModelConfig> {
    const response = await apiClient.put<AIModelConfig>('/api/AIModelConfig/config', config)
    return response.data
  },

  async getPerformance(startDate?: string): Promise<AIModelPerformanceResponse> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    
    const response = await apiClient.get<AIModelPerformanceResponse>(
      `/api/AIModelConfig/performance?${params.toString()}`
    )
    return response.data
  },
}

