import { apiClient } from '@/infrastructure/api/apiClient'
import type { NotificationTemplate, PushNotificationConfig } from '@/shared/types/notificationTemplateTypes'
import { NotificationEventType } from '@/shared/types/notificationTemplateTypes'

export const notificationTemplateService = {
  async getAll(eventType?: NotificationEventType): Promise<NotificationTemplate[]> {
    const params = new URLSearchParams()
    if (eventType) params.append('eventType', eventType.toString())
    
    const response = await apiClient.get<{ templates: NotificationTemplate[] }>(
      `/api/NotificationTemplate?${params.toString()}`
    )
    return (response.data as any).templates || []
  },

  async create(template: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const response = await apiClient.post<NotificationTemplate>('/api/NotificationTemplate', template)
    return response.data
  },

  async update(id: string, template: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    const response = await apiClient.put<NotificationTemplate>(`/api/NotificationTemplate/${id}`, template)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/NotificationTemplate/${id}`)
  },

  async previewTemplate(id: string, sampleData: Record<string, string>): Promise<{ renderedSubject: string; renderedBody: string }> {
    const response = await apiClient.post<{ renderedSubject: string; renderedBody: string }>(
      `/api/NotificationTemplate/${id}/preview`,
      sampleData
    )
    return response.data
  },

  async getPushConfig(): Promise<PushNotificationConfig | null> {
    try {
      const response = await apiClient.get<PushNotificationConfig>('/api/NotificationTemplate/push-notification/config')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async updatePushConfig(config: Partial<PushNotificationConfig>): Promise<PushNotificationConfig> {
    const response = await apiClient.put<PushNotificationConfig>(
      '/api/NotificationTemplate/push-notification/config',
      config
    )
    return response.data
  },

  async testPushNotification(deviceToken: string, title: string, body: string): Promise<{ success: boolean; errorMessage?: string }> {
    const response = await apiClient.post<{ success: boolean; errorMessage?: string }>(
      '/api/NotificationTemplate/push-notification/test',
      { deviceToken, title, body }
    )
    return response.data
  },
}

