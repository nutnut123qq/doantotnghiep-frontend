import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { SystemStats as SystemStatsType } from '../../../shared/types/adminTypes';
import { logger } from '@/shared/utils/logger';
import {
  Users,
  UserCheck,
  Shield,
  TrendingUp,
  Star,
  Bell,
  CalendarDays,
  Newspaper,
  RefreshCw,
} from 'lucide-react';

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
      logger.error('Error loading stats', { error: err });
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
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck },
    { label: 'Admin Users', value: stats.adminUsers, icon: Shield },
    { label: 'Total Stocks', value: stats.totalStocks, icon: TrendingUp },
    { label: 'Watchlists', value: stats.totalWatchlists, icon: Star },
    { label: 'Active Alerts', value: stats.totalAlerts, icon: Bell },
    { label: 'Corporate Events', value: stats.totalEvents, icon: CalendarDays },
    { label: 'News Articles', value: stats.totalNews, icon: Newspaper },
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
              <div className="text-blue-600 dark:text-blue-400">
                <stat.icon className="h-9 w-9" />
              </div>
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
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
