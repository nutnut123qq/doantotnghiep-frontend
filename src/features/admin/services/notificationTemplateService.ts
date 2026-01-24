import { apiClient } from '@/infrastructure/api/apiClient'
import { isAxiosError } from 'axios'
import type { NotificationTemplate, PushNotificationConfig } from '@/shared/types/notificationTemplateTypes'
import { NotificationEventType } from '@/shared/types/notificationTemplateTypes'

// Response DTOs
interface GetNotificationTemplatesResponse {
  templates: NotificationTemplate[]
}

interface PreviewTemplateResponse {
  renderedSubject: string
  renderedBody: string
}

interface TestPushNotificationResponse {
  success: boolean
  errorMessage?: string
}

export const notificationTemplateService = {
  async getAll(eventType?: NotificationEventType): Promise<NotificationTemplate[]> {
    const params = new URLSearchParams()
    if (eventType) params.append('eventType', eventType.toString())
    
    const response = await apiClient.get<GetNotificationTemplatesResponse>(
      `/NotificationTemplate?${params.toString()}`
    )
    return response.data.templates || []
  },

  async create(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const response = await apiClient.post<NotificationTemplate>('/NotificationTemplate', template)
    return response.data
  },

  async update(id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await apiClient.put<NotificationTemplate>(`/NotificationTemplate/${id}`, template)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/NotificationTemplate/${id}`)
  },

  async previewTemplate(id: string, sampleData: Record<string, string>): Promise<PreviewTemplateResponse> {
    const response = await apiClient.post<PreviewTemplateResponse>(
      `/NotificationTemplate/${id}/preview`,
      sampleData
    )
    return response.data
  },

  async getPushConfig(): Promise<PushNotificationConfig | null> {
    try {
      const response = await apiClient.get<PushNotificationConfig>('/NotificationTemplate/push-notification/config')
      return response.data
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async updatePushConfig(config: Partial<PushNotificationConfig>): Promise<PushNotificationConfig> {
    const response = await apiClient.put<PushNotificationConfig>(
      '/NotificationTemplate/push-notification/config',
      config
    )
    return response.data
  },

  async testPushNotification(deviceToken: string, title: string, body: string): Promise<TestPushNotificationResponse> {
    const response = await apiClient.post<TestPushNotificationResponse>(
      '/NotificationTemplate/push-notification/test',
      { deviceToken, title, body }
    )
    return response.data
  },
}

