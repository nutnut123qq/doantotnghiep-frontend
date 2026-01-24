import { apiClient } from '@/infrastructure/api/apiClient'
import { isAxiosError } from 'axios'

export interface ChartSettings {
  id?: string
  symbol: string
  timeRange: '1M' | '3M' | '6M' | '1Y' | 'ALL'
  chartType: 'candlestick' | 'line' | 'area'
  indicators: string[]
  drawings: {
    trendlines?: Array<{
      id: string
      coord: [[string | number, number], [string | number, number]]
      lineStyle?: { color: string; width: number; type: string }
      label?: { show: boolean; formatter: string }
    }>
    zones?: Array<{
      id: string
      coord: Array<Array<{ name: string; yAxis: number }>>
      itemStyle?: { color: string; opacity?: number }
    }>
  }
  lastUpdated: string
}

interface BackendChartSettings {
  id: string
  userId: string
  symbol: string
  timeRange: string
  chartType: string
  indicators: string // JSON string
  drawings: string // JSON string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'chart_settings'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null

// Helper to parse JSON safely
const parseJSON = <T>(json: string | null | undefined, defaultValue: T): T => {
  if (!json) return defaultValue
  try {
    return JSON.parse(json) as T
  } catch {
    return defaultValue
  }
}

// Convert backend format to frontend format
const convertFromBackend = (backend: BackendChartSettings): ChartSettings => {
  return {
    id: backend.id,
    symbol: backend.symbol,
    timeRange: backend.timeRange as ChartSettings['timeRange'],
    chartType: backend.chartType as ChartSettings['chartType'],
    indicators: parseJSON<string[]>(backend.indicators, []),
    drawings: parseJSON<ChartSettings['drawings']>(backend.drawings, {}),
    lastUpdated: backend.updatedAt,
  }
}

// Convert frontend format to backend format
const convertToBackend = (settings: Partial<ChartSettings>): {
  symbol: string
  timeRange?: string
  chartType?: string
  indicators?: string
  drawings?: string
} => {
  return {
    symbol: settings.symbol!,
    timeRange: settings.timeRange,
    chartType: settings.chartType,
    indicators: settings.indicators ? JSON.stringify(settings.indicators) : undefined,
    drawings: settings.drawings ? JSON.stringify(settings.drawings) : undefined,
  }
}

export const chartSettingsService = {
  /**
   * Save chart settings to localStorage (immediate) and backend (debounced)
   */
  saveSettings(symbol: string, settings: Partial<ChartSettings>): void {
    try {
      // Save to localStorage immediately for instant UI update
      const allSettings = this.getAllSettings()
      allSettings[symbol] = {
        ...allSettings[symbol],
        symbol,
        ...settings,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))

      // Debounce backend save to avoid spam
      if (saveDebounceTimer) {
        clearTimeout(saveDebounceTimer)
      }
      saveDebounceTimer = setTimeout(() => {
        this.saveToBackend(symbol, settings).catch((err) => {
          console.error('Error saving to backend:', err)
        })
      }, 2000) // 2 second debounce
    } catch (error) {
      console.error('Error saving chart settings:', error)
    }
  },

  /**
   * Save settings to backend API
   */
  async saveToBackend(symbol: string, settings: Partial<ChartSettings>): Promise<ChartSettings | null> {
    try {
      const payload = convertToBackend({ symbol, ...settings })
      const response = await apiClient.post<BackendChartSettings>('/ChartSettings', payload)
      const converted = convertFromBackend(response.data)
      
      // Update cache with backend response
      const allSettings = this.getAllSettings()
      allSettings[symbol] = {
        ...allSettings[symbol],
        ...converted,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))
      
      return converted
    } catch (error) {
      console.error('Error saving to backend:', error)
      return null
    }
  },

  /**
   * Load chart settings from localStorage (cached) or backend
   */
  async loadSettings(symbol: string, forceRefresh = false): Promise<ChartSettings | null> {
    try {
      // Check cache first
      const cached = this.loadSettingsFromCache(symbol)
      const cacheAge = cached ? Date.now() - new Date(cached.lastUpdated).getTime() : Infinity

      // Use cache if fresh and not forcing refresh
      if (!forceRefresh && cached && cacheAge < CACHE_DURATION) {
        return cached
      }

      // Load from backend
      try {
        const backendSettings = await this.loadFromBackend(symbol)
        if (backendSettings) {
          return backendSettings
        }
      } catch (error) {
        console.warn('Failed to load from backend, using cache:', error)
      }

      // Fallback to cache if backend fails
      return cached
    } catch (error) {
      console.error('Error loading chart settings:', error)
      return null
    }
  },

  /**
   * Load settings from localStorage cache only
   */
  loadSettingsFromCache(symbol: string): ChartSettings | null {
    try {
      const allSettings = this.getAllSettings()
      return allSettings[symbol] || null
    } catch (error) {
      console.error('Error loading chart settings from cache:', error)
      return null
    }
  },

  /**
   * Load settings from backend API
   */
  async loadFromBackend(symbol: string): Promise<ChartSettings | null> {
    try {
      const response = await apiClient.get<BackendChartSettings>(`/ChartSettings/${symbol}`)
      const converted = convertFromBackend(response.data)
      
      // Update cache
      const allSettings = this.getAllSettings()
      allSettings[symbol] = converted
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))
      
      return converted
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 404) {
        // Settings don't exist yet, return null
        return null
      }
      throw error
    }
  },

  /**
   * Get all chart settings
   */
  getAllSettings(): Record<string, ChartSettings> {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Error getting all chart settings:', error)
      return {}
    }
  },

  /**
   * Delete chart settings for a symbol (both cache and backend)
   */
  async deleteSettings(symbol: string): Promise<void> {
    try {
      // Delete from cache
      const allSettings = this.getAllSettings()
      delete allSettings[symbol]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))

      // Delete from backend
      try {
        await apiClient.delete(`/ChartSettings/${symbol}`)
      } catch (error: unknown) {
        if (!isAxiosError(error) || error.response?.status !== 404) {
          // Ignore 404 (already deleted), but log other errors
          console.error('Error deleting from backend:', error)
        }
      }
    } catch (error) {
      console.error('Error deleting chart settings:', error)
    }
  },

  /**
   * Clear all chart settings
   */
  clearAllSettings(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing chart settings:', error)
    }
  },

  /**
   * Export settings to JSON file
   */
  async exportSettings(symbol: string): Promise<void> {
    try {
      // Try to load from backend first, fallback to cache
      const settings = await this.loadSettings(symbol) || this.loadSettingsFromCache(symbol)
      if (!settings) {
        console.warn('No settings found for symbol:', symbol)
        return
      }

      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `chart_settings_${symbol}_${new Date().getTime()}.json`
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting chart settings:', error)
    }
  },

  /**
   * Import settings from JSON file
   */
  async importSettings(file: File): Promise<ChartSettings | null> {
    try {
      const text = await file.text()
      const settings = JSON.parse(text) as ChartSettings
      
      if (settings.symbol) {
        this.saveSettings(settings.symbol, settings)
        return settings
      }
      
      return null
    } catch (error) {
      console.error('Error importing chart settings:', error)
      return null
    }
  },
}

