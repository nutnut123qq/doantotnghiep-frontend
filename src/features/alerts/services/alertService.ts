import { apiClient } from '@/infrastructure/api/apiClient'
import {
  AlertType,
  coerceAlertType,
  priceThresholdApiToUser,
  priceThresholdUserToApi,
  type Alert,
  type CreateAlertRequest,
  type CreateAlertResponse,
  type GetAlertsResponse,
  type ParsedAlert,
} from '../types/alert.types'

function mapAlertFromApi(a: Alert): Alert {
  const type = coerceAlertType(a.type)
  const threshold = priceThresholdApiToUser(type, a.threshold)
  return {
    ...a,
    type,
    threshold: threshold === null || threshold === undefined ? undefined : threshold,
  }
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
    return list.map((a) => mapAlertFromApi(a))
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
    const type = data.type ?? AlertType.Price
    const threshold =
      data.threshold === undefined || data.threshold === null
        ? data.threshold
        : priceThresholdUserToApi(type, data.threshold)
    const response = await apiClient.post<CreateAlertResponse>('/Alert', {
      symbol: data.symbol,
      naturalLanguageInput: data.naturalLanguageInput,
      type: data.type,
      condition: data.condition,
      threshold,
      timeframe: data.timeframe,
    })
    const r = response.data
    const rt = coerceAlertType(r.type)
    return {
      ...r,
      type: rt,
      threshold:
        r.threshold === undefined || r.threshold === null
          ? r.threshold
          : (priceThresholdApiToUser(rt, r.threshold) ?? undefined),
    }
  },

  /**
   * Update an alert
   */
  async updateAlert(
    id: string,
    data: Partial<CreateAlertRequest>
  ): Promise<Alert> {
    const body: Partial<CreateAlertRequest> = { ...data }
    if (body.threshold !== undefined && body.threshold !== null && body.type === AlertType.Price) {
      body.threshold = priceThresholdUserToApi(AlertType.Price, body.threshold)
    }
    const response = await apiClient.put<Alert>(`/Alert/${id}`, body)
    return mapAlertFromApi(response.data)
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
    return mapAlertFromApi(response.data)
  },
}
