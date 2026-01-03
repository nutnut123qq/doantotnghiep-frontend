export interface ChartSettings {
  symbol: string
  timeRange: '1M' | '3M' | '6M' | '1Y' | 'ALL'
  chartType: 'candlestick' | 'line' | 'area'
  indicators: string[]
  drawings: any[]
  lastUpdated: string
}

const STORAGE_KEY = 'chart_settings'

export const chartSettingsService = {
  /**
   * Save chart settings to localStorage
   */
  saveSettings(symbol: string, settings: Partial<ChartSettings>): void {
    try {
      const allSettings = this.getAllSettings()
      allSettings[symbol] = {
        ...allSettings[symbol],
        symbol,
        ...settings,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))
    } catch (error) {
      console.error('Error saving chart settings:', error)
    }
  },

  /**
   * Load chart settings from localStorage
   */
  loadSettings(symbol: string): ChartSettings | null {
    try {
      const allSettings = this.getAllSettings()
      return allSettings[symbol] || null
    } catch (error) {
      console.error('Error loading chart settings:', error)
      return null
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
   * Delete chart settings for a symbol
   */
  deleteSettings(symbol: string): void {
    try {
      const allSettings = this.getAllSettings()
      delete allSettings[symbol]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings))
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
  exportSettings(symbol: string): void {
    try {
      const settings = this.loadSettings(symbol)
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

