export interface NotificationChannelConfig {
  hasSlackWebhook: boolean;
  slackWebhookMasked?: string;
  enabledSlack: boolean;
  telegramChatId?: string;
  enabledTelegram: boolean;
}

export interface UpdateNotificationChannelRequest {
  slackWebhookUrl?: string;  // Null = không update
  enabledSlack: boolean;
  telegramChatId?: string;
  enabledTelegram: boolean;
}

export interface TestNotificationRequest {
  channel: 'Slack' | 'Telegram';
}

export interface TestNotificationResponse {
  success: boolean;
  message: string;
}

// camelCase payload từ SignalR
export interface AlertNotification {
  alertId: string;
  symbol: string;
  tickerName: string;
  type: string;
  threshold: number;
  currentValue: number;
  triggeredAt: string;
}
