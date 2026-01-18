import { useState, useEffect } from 'react'
import { aiModelConfigService } from '../services/aiModelConfigService'
import type { AIModelConfig, AIModelPerformanceResponse } from '@/shared/types/aiModelTypes'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { toast } from 'sonner'
import { Cpu } from 'lucide-react'

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
      toast.success('Configuration saved successfully')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const chartData = performance?.metrics.map((m) => ({
    date: new Date(m.recordedAt).toLocaleDateString(),
    accuracy: m.accuracy,
    responseTime: m.averageResponseTimeMs,
  })) || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Model Configuration"
        description="Configure AI model settings and monitor performance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">Model Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="modelName">Model Name</Label>
                <Input
                  id="modelName"
                  type="text"
                  required
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="version">Version</Label>
                <Select
                  value={formData.version}
                  onValueChange={(value) => setFormData({ ...formData, version: value })}
                >
                  <SelectTrigger id="version">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="gemini-pro-1.5">Gemini Pro 1.5</SelectItem>
                    <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder={config?.apiKey ? '••••••••' : 'Enter API key'}
                />
              </div>

              <div>
                <Label>
                  Update Frequency: {formData.updateFrequencyMinutes} minutes
                </Label>
                <input
                  type="range"
                  min="15"
                  max="1440"
                  step="15"
                  value={formData.updateFrequencyMinutes}
                  onChange={(e) => setFormData({ ...formData, updateFrequencyMinutes: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[hsl(var(--muted))] mt-1">
                  <span>15 min</span>
                  <span>24 hours</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Performance Dashboard */}
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
          
          {performance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-[hsl(var(--surface-2))]">
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted))]">Overall Accuracy</p>
                    <p className="text-2xl font-bold text-[hsl(var(--text))] tabular-nums">
                      {performance.summary.overallAccuracy.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-[hsl(var(--surface-2))]">
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted))]">Success Rate</p>
                    <p className="text-2xl font-bold text-[hsl(var(--positive))] tabular-nums">
                      {performance.summary.successRate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-[hsl(var(--surface-2))]">
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted))]">Avg Response Time</p>
                    <p className="text-2xl font-bold text-[hsl(var(--text))] tabular-nums">
                      {performance.summary.overallAverageResponseTimeMs.toFixed(0)}ms
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-[hsl(var(--surface-2))]">
                  <CardContent className="pt-6">
                    <p className="text-sm text-[hsl(var(--muted))]">Total Requests</p>
                    <p className="text-2xl font-bold text-[hsl(var(--text))] tabular-nums">
                      {performance.summary.totalSuccessCount + performance.summary.totalFailureCount}
                    </p>
                  </CardContent>
                </Card>
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
            <EmptyState
              icon={Cpu}
              title="No performance data available"
              description="Performance metrics will appear here once data is collected"
            />
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

