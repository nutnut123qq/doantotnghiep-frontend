import { useEffect, useState } from 'react'
import { Switch } from '@headlessui/react'
import { BellIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { NotificationChannelsSettings } from './NotificationChannelsSettings'
import { ChangePasswordForm } from './ChangePasswordForm'
import { apiClient } from '@/infrastructure/api/apiClient'
import { notify } from '@/shared/utils/notify'

export const Settings = () => {
  const PRICE_ALERTS_PREFERENCE_KEY = 'price_alerts_enabled'
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true)
  const [isSavingPriceAlerts, setIsSavingPriceAlerts] = useState(false)

  useEffect(() => {
    const loadPriceAlertsPreference = async () => {
      try {
        const response = await apiClient.get<{ preferenceValue: string }>(
          `/UserPreference/${PRICE_ALERTS_PREFERENCE_KEY}`,
          {
            validateStatus: (status) => status < 500,
          }
        )

        if (response.status === 200 && response.data?.preferenceValue) {
          setPriceAlertsEnabled(response.data.preferenceValue === 'true')
        }
      } catch {
        // Keep default true when preference is unavailable
      }
    }

    void loadPriceAlertsPreference()
  }, [])

  const handleTogglePriceAlerts = async (checked: boolean) => {
    const previous = priceAlertsEnabled
    setPriceAlertsEnabled(checked)
    setIsSavingPriceAlerts(true)

    try {
      await apiClient.post('/UserPreference', {
        preferenceKey: PRICE_ALERTS_PREFERENCE_KEY,
        preferenceValue: String(checked),
      })
      notify.success('Price alert preference updated')
    } catch {
      setPriceAlertsEnabled(previous)
      notify.error('Failed to update price alert preference')
    } finally {
      setIsSavingPriceAlerts(false)
    }
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account and application preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <span>Notifications</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  key: 'priceAlerts' as const,
                  label: 'Price Alerts',
                  description: 'Get notified when stock prices hit your targets'
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                  <Switch
                    checked={priceAlertsEnabled}
                    onChange={(checked) => void handleTogglePriceAlerts(checked)}
                    disabled={isSavingPriceAlerts}
                    className={`${
                      priceAlertsEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        priceAlertsEnabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Channels */}
          <NotificationChannelsSettings />

          {/* Security */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <LockClosedIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <span>Security</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => setShowChangePassword((prev) => !prev)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                Change Password
              </button>
              {showChangePassword && (
                <ChangePasswordForm onCancel={() => setShowChangePassword(false)} />
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

