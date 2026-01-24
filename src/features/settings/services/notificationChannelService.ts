import { apiClient } from '@/infrastructure/api/apiClient';
import type {
  NotificationChannelConfig,
  UpdateNotificationChannelRequest,
  TestNotificationResponse
} from '../types/notificationChannel.types';

export const notificationChannelService = {
  getMyConfig: async (): Promise<NotificationChannelConfig> => {
    const response = await apiClient.get('/notification-channels/me');
    return response.data;
  },

  updateConfig: async (config: UpdateNotificationChannelRequest): Promise<NotificationChannelConfig> => {
    const response = await apiClient.put('/notification-channels/me', config);
    return response.data;
  },

  testChannel: async (channel: 'Slack' | 'Telegram'): Promise<TestNotificationResponse> => {
    const response = await apiClient.post('/notification-channels/me/test', { channel });
    return response.data;
  }
};
