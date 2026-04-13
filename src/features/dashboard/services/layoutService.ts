import { apiClient } from '@/infrastructure/api/apiClient'
import {
  LayoutConfig,
  LayoutTemplate,
  UserPreference,
  DEFAULT_LAYOUT,
  LAYOUT_TEMPLATES,
  ShareLayoutRequest,
  ShareLayoutResponse,
  SharedLayoutInfo,
} from '@/shared/types/layoutTypes'
import {
  DASHBOARD_LAYOUT_SCHEMA_VERSION,
  deserializeLayoutPayload,
  isLayoutConfig,
} from '../utils/layoutPersistence'
import { logger } from '@/shared/utils/logger'

const LAYOUT_PREFERENCE_KEY = 'dashboard_layout'
const LOCALSTORAGE_LAYOUT_KEY = 'dashboard_layout_config'

export const layoutService = {
  /**
   * Get user's saved layout from backend
   */
  async getLayout(): Promise<LayoutConfig> {
    try {
      const response = await apiClient.get<UserPreference>(
        `/UserPreference/${LAYOUT_PREFERENCE_KEY}`
      )
      
      if (response.data && response.data.preferenceValue) {
        const payload = deserializeLayoutPayload(response.data.preferenceValue)
        if (payload && payload.version === DASHBOARD_LAYOUT_SCHEMA_VERSION) {
          return payload.layout
        }
        if (payload && payload.version < DASHBOARD_LAYOUT_SCHEMA_VERSION) {
          logger.warn('Layout schema version mismatch from backend, falling back to default', {
            version: payload.version,
          })
        }
      }
    } catch (error) {
      logger.warn('No valid saved layout found in backend, using fallback', { error })
    }
    
    // Fallback to localStorage
    const localLayout = this.getLayoutFromLocalStorage()
    if (localLayout) {
      return localLayout
    }
    
    return DEFAULT_LAYOUT
  },

  /**
   * Save layout to backend
   */
  async saveLayout(layout: LayoutConfig): Promise<void> {
    try {
      await apiClient.post('/UserPreference', {
        preferenceKey: LAYOUT_PREFERENCE_KEY,
        preferenceValue: JSON.stringify({
          version: DASHBOARD_LAYOUT_SCHEMA_VERSION,
          layout,
        }),
      })
      
      // Also save to localStorage as backup
      this.saveLayoutToLocalStorage(layout)
    } catch (error) {
      logger.error('Error saving layout to backend', { error })
      // Save to localStorage if backend fails
      this.saveLayoutToLocalStorage(layout)
      throw error
    }
  },

  /**
   * Delete saved layout
   */
  async deleteLayout(): Promise<void> {
    try {
      await apiClient.delete(`/UserPreference/${LAYOUT_PREFERENCE_KEY}`)
      localStorage.removeItem(LOCALSTORAGE_LAYOUT_KEY)
    } catch (error) {
      logger.error('Error deleting layout', { error })
      throw error
    }
  },

  /**
   * Get layout from localStorage (backup)
   */
  getLayoutFromLocalStorage(): LayoutConfig | null {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_LAYOUT_KEY)
      if (saved) {
        const payload = deserializeLayoutPayload(saved)
        if (payload && payload.version === DASHBOARD_LAYOUT_SCHEMA_VERSION) {
          return payload.layout
        }
        if (payload && payload.version < DASHBOARD_LAYOUT_SCHEMA_VERSION) {
          logger.warn('Local layout schema is outdated, ignoring cached layout', {
            version: payload.version,
          })
        }
      }
    } catch (error) {
      logger.error('Error loading layout from localStorage', { error })
    }
    return null
  },

  /**
   * Save layout to localStorage (backup)
   */
  saveLayoutToLocalStorage(layout: LayoutConfig): void {
    try {
      localStorage.setItem(
        LOCALSTORAGE_LAYOUT_KEY,
        JSON.stringify({
          version: DASHBOARD_LAYOUT_SCHEMA_VERSION,
          layout,
        })
      )
    } catch (error) {
      logger.error('Error saving layout to localStorage', { error })
    }
  },

  /**
   * Export layout configuration as JSON file
   */
  exportLayout(layout: LayoutConfig): void {
    const dataStr = JSON.stringify(layout, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `dashboard-layout-${layout.id}-${Date.now()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  },

  /**
   * Import layout configuration from JSON file
   */
  async importLayout(file: File): Promise<LayoutConfig> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const layout = JSON.parse(e.target?.result as string) as LayoutConfig
          
          // Validate layout structure
          if (!layout.widgets || !Array.isArray(layout.widgets)) {
            throw new Error('Invalid layout configuration')
          }
          
          resolve(layout)
        } catch {
          reject(new Error('Failed to parse layout file'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsText(file)
    })
  },

  /**
   * Apply a layout template
   */
  async applyTemplate(templateId: string): Promise<LayoutConfig> {
    const template = LAYOUT_TEMPLATES.find(t => t.id === templateId)
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }
    
    await this.saveLayout(template.config)
    return template.config
  },

  /**
   * Reset to default layout
   */
  async resetToDefault(): Promise<LayoutConfig> {
    await this.deleteLayout()
    return DEFAULT_LAYOUT
  },

  /**
   * Share current layout by generating a share code
   */
  async shareLayout(
    layout: LayoutConfig,
    isPublic: boolean,
    expiresInDays: number
  ): Promise<ShareLayoutResponse> {
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    const payload: ShareLayoutRequest = {
      layoutJson: JSON.stringify(layout),
      isPublic,
      expiresAt,
    }

    const response = await apiClient.post<ShareLayoutResponse>('/layouts/share', payload)
    return response.data
  },

  /**
   * Import shared layout by code
   */
  async importLayoutByCode(code: string): Promise<LayoutConfig> {
    const response = await apiClient.get<{ layoutJson: string }>(`/layouts/shared/${code}`)
    return JSON.parse(response.data.layoutJson)
  },

  /**
   * Get current user's shared layouts
   */
  async getMySharedLayouts(): Promise<SharedLayoutInfo[]> {
    const response = await apiClient.get<SharedLayoutInfo[]>('/layouts/shared')
    return response.data
  },

  /**
   * Get all available templates
   */
  getTemplates(): LayoutTemplate[] {
    return LAYOUT_TEMPLATES
  },

  /**
   * Validate layout configuration
   */
  validateLayout(layout: LayoutConfig): boolean {
    return isLayoutConfig(layout)
  },
}
