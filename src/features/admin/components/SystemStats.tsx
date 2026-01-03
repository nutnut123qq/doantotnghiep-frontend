import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { SystemStats as SystemStatsType } from '../../../shared/types/adminTypes';

export function SystemStats() {
  const [stats, setStats] = useState<SystemStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSystemStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load system statistics');
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading statistics...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || 'No data available'}</p>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
    { label: 'Active Users', value: stats.activeUsers, icon: '✅', color: 'green' },
    { label: 'Admin Users', value: stats.adminUsers, icon: '👑', color: 'purple' },
    { label: 'Total Stocks', value: stats.totalStocks, icon: '📈', color: 'indigo' },
    { label: 'Watchlists', value: stats.totalWatchlists, icon: '⭐', color: 'yellow' },
    { label: 'Active Alerts', value: stats.totalAlerts, icon: '🔔', color: 'red' },
    { label: 'Corporate Events', value: stats.totalEvents, icon: '📅', color: 'pink' },
    { label: 'News Articles', value: stats.totalNews, icon: '📰', color: 'cyan' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </span>
          <button
            onClick={loadStats}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
