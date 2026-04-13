import { apiClient } from '@/infrastructure/api/apiClient'
import {
  AlertType,
  type Alert,
  type CreateAlertRequest,
  type CreateAlertResponse,
  type GetAlertsResponse,
  type ParsedAlert,
} from '../types/alert.types'

function normalizeAlertType(type: unknown): AlertType {
  if (typeof type === 'number' && type >= 1 && type <= 5) {
    return type as AlertType
  }
  if (typeof type === 'string') {
    const byName: Record<string, AlertType> = {
      Price: AlertType.Price,
      Volume: AlertType.Volume,
      TechnicalIndicator: AlertType.TechnicalIndicator,
      Sentiment: AlertType.Sentiment,
      Volatility: AlertType.Volatility,
    }
    if (byName[type] !== undefined) return byName[type]
    const n = parseInt(type, 10)
    if (!Number.isNaN(n) && n >= 1 && n <= 5) return n as AlertType
  }
  return AlertType.Price
}

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
      `/Alert?${params.toString()}`
    )
    const list = response.data.alerts || []
    return list.map((a) => ({
      ...a,
      type: normalizeAlertType(a.type),
    }))
  },

  /**
   * Parse natural language alert input without creating the alert
   */
  async parseAlert(naturalLanguageInput: string): Promise<ParsedAlert> {
    const response = await apiClient.post<ParsedAlert>('/Alert/parse', {
      naturalLanguageInput,
    })
    return response.data
  },

  /**
   * Create a new alert (with NLP support)
   */
  async createAlert(data: CreateAlertRequest): Promise<CreateAlertResponse> {
    const response = await apiClient.post<CreateAlertResponse>('/Alert', {
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
    const response = await apiClient.put<Alert>(`/Alert/${id}`, data)
    return response.data
  },

  /**
   * Delete an alert
   */
  async deleteAlert(id: string): Promise<void> {
    await apiClient.delete(`/Alert/${id}`)
  },

  /**
   * Toggle alert active status
   */
  async toggleAlert(id: string, isActive: boolean): Promise<Alert> {
    const response = await apiClient.patch<Alert>(`/Alert/${id}`, {
      isActive,
    })
    return response.data
  },
}
