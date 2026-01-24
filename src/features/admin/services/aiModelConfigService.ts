import { apiClient } from '@/infrastructure/api/apiClient'
import { isAxiosError } from 'axios'
import type { AIModelConfig, AIModelPerformanceResponse } from '@/shared/types/aiModelTypes'

export const aiModelConfigService = {
  async getConfig(): Promise<AIModelConfig | null> {
    try {
      const response = await apiClient.get<AIModelConfig>('/AIModelConfig/config')
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async updateConfig(config: Partial<AIModelConfig>): Promise<AIModelConfig> {
    const response = await apiClient.put<AIModelConfig>('/AIModelConfig/config', config)
    return response.data
  },

  async getPerformance(startDate?: string): Promise<AIModelPerformanceResponse> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    
    const response = await apiClient.get<AIModelPerformanceResponse>(
      `/AIModelConfig/performance?${params.toString()}`
    )
    return response.data
  },
}

