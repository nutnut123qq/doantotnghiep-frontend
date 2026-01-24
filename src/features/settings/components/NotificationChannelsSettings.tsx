import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { ChatBubbleLeftRightIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { notificationChannelService } from '../services/notificationChannelService';
import { notify } from '@/shared/utils/notify';
import type { NotificationChannelConfig } from '../types/notificationChannel.types';
import { getAxiosErrorMessage } from '@/shared/utils/axiosError';

export const NotificationChannelsSettings = () => {
  const [config, setConfig] = useState<NotificationChannelConfig>({
    hasSlackWebhook: false,
    enabledSlack: false,
    telegramChatId: '',
    enabledTelegram: false
  });

  // Local state cho input (không sync với masked value từ server)
  const [slackWebhookInput, setSlackWebhookInput] = useState('');
  const [telegramChatIdInput, setTelegramChatIdInput] = useState('');
  const [showSlackWebhook, setShowSlackWebhook] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await notificationChannelService.getMyConfig();
      setConfig(data);

      // Chỉ set chat ID, không set webhook (vì đã masked)
      if (data.telegramChatId) {
        setTelegramChatIdInput(data.telegramChatId);
      }
    } catch (error) {
      notify.error('Failed to load configuration');
    }
  };

  const handleSave = async () => {
    // FE Validation: Check "effective value" (input mới OR webhook đã có)
    // Slack: Pass nếu có webhook đã lưu HOẶC có input mới
    if (config.enabledSlack && !slackWebhookInput && !config.hasSlackWebhook) {
      notify.error('Please enter Slack webhook URL to enable Slack notifications');
      return;
    }

    // Telegram: Phải có chat ID (không có "đã lưu" vì chat ID không mask)
    if (config.enabledTelegram && !telegramChatIdInput) {
      notify.error('Please enter Telegram chat ID to enable Telegram notifications');
      return;
    }

    setLoading(true);
    try {
      // Chỉ gửi webhook nếu có giá trị mới
      const result = await notificationChannelService.updateConfig({
        slackWebhookUrl: slackWebhookInput || undefined,  // undefined = không update
        enabledSlack: config.enabledSlack,
        telegramChatId: telegramChatIdInput || undefined,
        enabledTelegram: config.enabledTelegram
      });

      // Update config state with result from server
      setConfig(result);
      notify.success('Notification channels updated successfully');
      setSlackWebhookInput('');  // Clear input sau khi save
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error);
      notify.error(errorMessage === 'Unknown error' ? 'Failed to update configuration' : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSlack = async () => {
    // API test lấy từ DB, phải Save trước khi Test
    if (!config.hasSlackWebhook) {
      notify.error('Please save Slack webhook configuration before testing');
      return;
    }

    // Warn nếu có unsaved changes (user vừa nhập webhook mới)
    if (slackWebhookInput) {
      toast('You have unsaved changes. Test will use the previously saved webhook URL.', {
        icon: '⚠️',
        duration: 5000,
        style: {
          background: '#f59e0b',
          color: '#fff'
        }
      });
    }

    setTestingSlack(true);
    try {
      const result = await notificationChannelService.testChannel('Slack');
      if (result.success) {
        notify.success('Test notification sent to Slack!');
      } else {
        notify.error('Failed to send test notification');
      }
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error);
      notify.error(errorMessage === 'Unknown error' ? 'Failed to test Slack' : errorMessage);
    } finally {
      setTestingSlack(false);
    }
  };

  const handleTestTelegram = async () => {
    // API test lấy từ DB, phải Save trước khi Test
    if (!config.telegramChatId) {
      notify.error('Please save Telegram chat ID configuration before testing');
      return;
    }

    // Warn nếu có unsaved changes
    if (telegramChatIdInput && telegramChatIdInput !== config.telegramChatId) {
      notify.warning('You have unsaved changes. Test will use the previously saved chat ID.', {
        duration: 5000,
      });
    }

    setTestingTelegram(true);
    try {
      const result = await notificationChannelService.testChannel('Telegram');
      if (result.success) {
        notify.success('Test notification sent to Telegram!');
      } else {
        notify.error('Failed to send test notification');
      }
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error);
      notify.error(errorMessage === 'Unknown error' ? 'Failed to test Telegram' : errorMessage);
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-700" />
          <span>Notification Channels</span>
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Slack Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Slack</p>
              <p className="text-sm text-slate-600">Get alerts in your Slack workspace</p>
            </div>
            <Switch
              checked={config.enabledSlack}
              onChange={(checked) => setConfig({ ...config, enabledSlack: checked })}
              className={`${
                config.enabledSlack ? 'bg-blue-600' : 'bg-slate-300'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`${
                  config.enabledSlack ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Webhook URL
              {config.hasSlackWebhook && (
                <span className="ml-2 text-xs text-green-600">✓ Configured</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showSlackWebhook ? 'text' : 'password'}
                value={slackWebhookInput}
                onChange={(e) => setSlackWebhookInput(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 pr-10 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
                placeholder={config.hasSlackWebhook ? 'Enter new webhook to update' : 'https://hooks.slack.com/services/...'}
              />
              <button
                type="button"
                onClick={() => setShowSlackWebhook(!showSlackWebhook)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showSlackWebhook ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                How to create Slack webhook →
              </a>
              <button
                type="button"
                onClick={handleTestSlack}
                disabled={testingSlack || !config.hasSlackWebhook}
                className="text-xs text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                {testingSlack ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>
        </div>

        {/* Telegram Settings */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Telegram</p>
              <p className="text-sm text-slate-600">Receive alerts via Telegram bot</p>
            </div>
            <Switch
              checked={config.enabledTelegram}
              onChange={(checked) => setConfig({ ...config, enabledTelegram: checked })}
              className={`${
                config.enabledTelegram ? 'bg-blue-600' : 'bg-slate-300'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
              <span
                className={`${
                  config.enabledTelegram ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Chat ID
            </label>
            <input
              type="text"
              value={telegramChatIdInput}
              onChange={(e) => setTelegramChatIdInput(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500"
              placeholder="123456789 or -100123456789"
            />
            <div className="mt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowTelegramGuide(!showTelegramGuide)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showTelegramGuide ? 'Hide' : 'Show'} how to get Chat ID →
              </button>
              <button
                type="button"
                onClick={handleTestTelegram}
                disabled={testingTelegram || !config.telegramChatId}
                className="text-xs text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                {testingTelegram ? 'Testing...' : 'Test'}
              </button>
            </div>

            {/* Hướng dẫn chi tiết */}
            {showTelegramGuide && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-2">
                <p className="font-medium text-blue-900">How to get your Telegram Chat ID:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Open Telegram and search for your bot</li>
                  <li>Send <code className="px-1 py-0.5 bg-blue-100 rounded">/start</code> to the bot</li>
                  <li>Use <code className="px-1 py-0.5 bg-blue-100 rounded">@userinfobot</code> or <code className="px-1 py-0.5 bg-blue-100 rounded">@RawDataBot</code> to get your Chat ID</li>
                  <li>
                    Alternatively, send any message to your bot, then check:<br />
                    <code className="text-xs px-1 py-0.5 bg-blue-100 rounded break-all">
                      https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates
                    </code>
                    <br />
                    Look for <code className="px-1 py-0.5 bg-blue-100 rounded">"chat":&#123;"id": YOUR_CHAT_ID&#125;</code>
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
