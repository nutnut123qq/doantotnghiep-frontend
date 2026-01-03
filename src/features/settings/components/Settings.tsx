import { useState } from 'react'
import { Switch } from '@headlessui/react'
import {
  UserIcon,
  BellIcon,
  ChartBarIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'

export const Settings = () => {
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    aiRecommendations: true,
    portfolioUpdates: false,
    marketNews: true,
  })

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600">Manage your account and application preferences</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-slate-700" />
                <span>Profile Settings</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+84 123 456 789"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <BellIcon className="h-5 w-5 text-slate-700" />
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
                {
                  key: 'aiRecommendations' as const,
                  label: 'AI Recommendations',
                  description: 'Receive AI-powered trading insights'
                },
                {
                  key: 'portfolioUpdates' as const,
                  label: 'Portfolio Updates',
                  description: 'Daily summary of your portfolio performance'
                },
                {
                  key: 'marketNews' as const,
                  label: 'Market News',
                  description: 'Breaking news and market updates'
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  <Switch
                    checked={notifications[item.key]}
                    onChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                    className={`${
                      notifications[item.key] ? 'bg-blue-600' : 'bg-slate-300'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Preferences */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-slate-700" />
                <span>Trading Preferences</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Default Exchange</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>HOSE</option>
                  <option>HNX</option>
                  <option>UPCOM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Risk Tolerance</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Conservative</option>
                  <option>Moderate</option>
                  <option>Aggressive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Investment Horizon</label>
                <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Short-term (0-1 year)</option>
                  <option>Medium-term (1-5 years)</option>
                  <option>Long-term (5+ years)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <LockClosedIcon className="h-5 w-5 text-slate-700" />
                <span>Security</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-left">
                Change Password
              </button>
              <button className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-left">
                Enable Two-Factor Authentication
              </button>
              <button className="w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-left">
                Manage Connected Devices
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
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

