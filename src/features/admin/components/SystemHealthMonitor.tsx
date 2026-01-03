import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import type { SystemHealthStatus } from '../../../shared/types/adminTypes';

export function SystemHealthMonitor() {
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSystemHealth();
      setHealth(data);
    } catch (err) {
      setError('Failed to load system health');
      console.error('Error loading health:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Checking system health...</div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || 'No data available'}</p>
          <button
            onClick={loadHealth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Overall Health */}
      <div className={`rounded-lg shadow p-6 border ${
        health.isHealthy 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{health.isHealthy ? '✅' : '❌'}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                System Status: {health.isHealthy ? 'Healthy' : 'Unhealthy'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Last checked: {new Date(health.checkedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={loadHealth}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">🗄️</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Database</h3>
            <span className={`ml-auto text-sm px-2 py-1 rounded ${
              health.database.isConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {health.database.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Response Time:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.database.responseTimeMs}ms
              </span>
            </div>
          </div>
        </div>

        {/* Cache */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">⚡</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Redis Cache</h3>
            <span className={`ml-auto text-sm px-2 py-1 rounded ${
              health.cache.isConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {health.cache.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Response Time:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {health.cache.responseTimeMs}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">CPU Usage</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {health.performance.cpuUsagePercent.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Memory</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {health.performance.memoryUsageMB} MB
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Connections</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {health.performance.activeConnections}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatUptime(health.performance.uptimeSeconds)}
            </p>
          </div>
        </div>
      </div>

      {/* Background Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">⚙️</span>
          Background Jobs
        </h3>
        <div className="space-y-3">
          {health.backgroundJobs.jobs.map((job) => (
            <div key={job.jobName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${
                  job.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{job.jobName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{job.status}</p>
                </div>
              </div>
              {job.lastRunTime && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Last run: {new Date(job.lastRunTime).toLocaleTimeString()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
