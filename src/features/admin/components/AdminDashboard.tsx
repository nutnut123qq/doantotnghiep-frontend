import { useState } from 'react';
import { SystemStats } from './SystemStats';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { UserManagement } from './UserManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { DataSourceManagement } from './DataSourceManagement';
import { AIModelConfiguration } from './AIModelConfiguration';
import { NotificationTemplateManagement } from './NotificationTemplateManagement';

type TabType = 'stats' | 'health' | 'analytics' | 'users' | 'content' | 'ai-config' | 'notifications';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  const tabs = [
    { id: 'stats' as TabType, label: 'System Stats', icon: '📊' },
    { id: 'health' as TabType, label: 'System Health', icon: '💚' },
    { id: 'analytics' as TabType, label: 'Analytics', icon: '📈' },
    { id: 'users' as TabType, label: 'User Management', icon: '👥' },
    { id: 'content' as TabType, label: 'Content Configuration', icon: '⚙️' },
    { id: 'ai-config' as TabType, label: 'AI Configuration', icon: '🤖' },
    { id: 'notifications' as TabType, label: 'Notification Templates', icon: '🔔' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          System monitoring and management
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'stats' && <SystemStats />}
        {activeTab === 'health' && <SystemHealthMonitor />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'content' && <DataSourceManagement />}
        {activeTab === 'ai-config' && <AIModelConfiguration />}
        {activeTab === 'notifications' && <NotificationTemplateManagement />}
      </div>
    </div>
  );
}
