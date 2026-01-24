import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { notify } from '@/shared/utils/notify';
import type { AlertNotification } from '@/features/settings/types/notificationChannel.types';

export const useAlertNotifications = () => {
  useEffect(() => {
    // Use existing auth token
    const token = localStorage.getItem('accessToken');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/trading', {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log('Connected to TradingHub for alerts'))
      .catch(err => console.error('SignalR connection error:', err));

    // Event name: "AlertTriggered"
    // Payload: camelCase
    connection.on('AlertTriggered', (notification: AlertNotification) => {
      const message = `
🔔 Alert: ${notification.symbol} ${notification.type}
Threshold: ${notification.threshold.toLocaleString()}
Current: ${notification.currentValue.toLocaleString()}
${notification.aiExplanation ? `\n💡 ${notification.aiExplanation}` : ''}
      `.trim();

      notify.success(message, {
        duration: 8000,
      });
    });

    return () => {
      connection.stop();
    };
  }, []);
};
