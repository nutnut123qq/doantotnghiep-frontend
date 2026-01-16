import { apiClient } from '@/infrastructure/api/apiClient'
import type {
  Alert,
  CreateAlertRequest,
  CreateAlertResponse,
  GetAlertsResponse,
  ParsedAlert,
} from '../types/alert.types'

export const alertService = {
  /**
   * Get all alerts for current user
   */
  async getAlerts(isActive?: boolean): Promise<Alert[]> {
    const params = new URLSearchParams()
    if (isActive !== undefined) {
      params.append('isActive', isActive.toString())
    }

    const response = await apiClient.get<GetAlertsResponse>(
      `/api/Alert?${params.toString()}`
    )
    return response.data.alerts || []
  },

  /**
   * Parse natural language alert input without creating the alert
   */
  async parseAlert(naturalLanguageInput: string): Promise<ParsedAlert> {
    const response = await apiClient.post<ParsedAlert>('/api/Alert/parse', {
      naturalLanguageInput,
    })
    return response.data
  },

  /**
   * Create a new alert (with NLP support)
   */
  async createAlert(data: CreateAlertRequest): Promise<CreateAlertResponse> {
    const response = await apiClient.post<CreateAlertResponse>('/api/Alert', {
      symbol: data.symbol,
      naturalLanguageInput: data.naturalLanguageInput,
      type: data.type,
      condition: data.condition,
      threshold: data.threshold,
      timeframe: data.timeframe,
    })
    return response.data
  },

  /**
   * Update an alert
   */
  async updateAlert(
    id: string,
    data: Partial<CreateAlertRequest>
  ): Promise<Alert> {
    const response = await apiClient.put<Alert>(`/api/Alert/${id}`, data)
    return response.data
  },

  /**
   * Delete an alert
   */
  async deleteAlert(id: string): Promise<void> {
    await apiClient.delete(`/api/Alert/${id}`)
  },

  /**
   * Toggle alert active status
   */
  async toggleAlert(id: string, isActive: boolean): Promise<Alert> {
    const response = await apiClient.patch<Alert>(`/api/Alert/${id}`, {
      isActive,
    })
    return response.data
  },
}
