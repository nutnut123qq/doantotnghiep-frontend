import { useState, useEffect } from 'react'
import { aiModelConfigService } from '../services/aiModelConfigService'
import type { AIModelConfig, AIModelPerformanceResponse } from '@/shared/types/aiModelTypes'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export function AIModelConfiguration() {
  const [config, setConfig] = useState<AIModelConfig | null>(null)
  const [performance, setPerformance] = useState<AIModelPerformanceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    modelName: 'Gemini',
    version: 'gemini-pro-1.5',
    apiKey: '',
    updateFrequencyMinutes: 60,
    isActive: true,
  })

  useEffect(() => {
    loadConfig()
    loadPerformance()
  }, [])

  const loadConfig = async () => {
    try {
      setIsLoading(true)
      const loadedConfig = await aiModelConfigService.getConfig()
      if (loadedConfig) {
        setConfig(loadedConfig)
        setFormData({
          modelName: loadedConfig.modelName,
          version: loadedConfig.version,
          apiKey: loadedConfig.apiKey || '',
          updateFrequencyMinutes: loadedConfig.updateFrequencyMinutes,
          isActive: loadedConfig.isActive,
        })
      }
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPerformance = async () => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7) // Last 7 days
      const perf = await aiModelConfigService.getPerformance(startDate.toISOString())
      setPerformance(perf)
    } catch (error) {
      console.error('Error loading performance:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      const updated = await aiModelConfigService.updateConfig({
        ...formData,
        id: config?.id,
      })
      setConfig(updated)
      alert('Configuration saved successfully')
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  const chartData = performance?.metrics.map((m) => ({
    date: new Date(m.recordedAt).toLocaleDateString(),
    accuracy: m.accuracy,
    responseTime: m.averageResponseTimeMs,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">AI Model Configuration</h2>
        <p className="text-sm text-slate-600 mt-1">Configure AI model settings and monitor performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Model Settings</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Model Name</label>
              <input
                type="text"
                required
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Version</label>
              <select
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gemini-pro">Gemini Pro</option>
                <option value="gemini-pro-1.5">Gemini Pro 1.5</option>
                <option value="gemini-ultra">Gemini Ultra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder={config?.apiKey ? '••••••••' : 'Enter API key'}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Update Frequency: {formData.updateFrequencyMinutes} minutes
              </label>
              <input
                type="range"
                min="15"
                max="1440"
                step="15"
                value={formData.updateFrequencyMinutes}
                onChange={(e) => setFormData({ ...formData, updateFrequencyMinutes: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>15 min</span>
                <span>24 hours</span>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        {/* Performance Dashboard */}
        <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Metrics</h3>
          
          {performance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Overall Accuracy</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {performance.summary.overallAccuracy.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {performance.summary.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {performance.summary.overallAverageResponseTimeMs.toFixed(0)}ms
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600">Total Requests</p>
                  <p className="text-2xl font-bold text-slate-600">
                    {performance.summary.totalSuccessCount + performance.summary.totalFailureCount}
                  </p>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Accuracy Trend (Last 7 Days)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" name="Accuracy %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No performance data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

