import { apiClient } from '@/infrastructure/api/apiClient'
import { authService } from '@/features/auth/services/authService'
import { isAxiosError } from 'axios'
import type { TradingBoardColumnPreferences } from '../types/columnTypes'
import { DEFAULT_COLUMN_ORDER, DEFAULT_VISIBLE_COLUMNS } from '../types/columnTypes'

const COLUMN_PREFERENCE_KEY = 'trading_board_columns'
const LOCALSTORAGE_COLUMN_KEY = 'trading_board_columns_config'

interface UserPreference {
  preferenceKey: string
  preferenceValue: string
}

export const columnPreferencesService = {
  /**
   * Get column preferences from backend
   */
  async getColumnPreferences(): Promise<TradingBoardColumnPreferences> {
    // Chỉ gọi API nếu user đã đăng nhập để tránh lỗi 404 không cần thiết
    if (authService.isAuthenticated()) {
      try {
        const response = await apiClient.get<UserPreference>(
          `/UserPreference/${COLUMN_PREFERENCE_KEY}`,
          {
            // Suppress 404 errors in console
            validateStatus: (status) => status < 500, // Don't throw for 4xx errors
          }
        )
        
        if (response.status === 200 && response.data && response.data.preferenceValue) {
          return JSON.parse(response.data.preferenceValue)
        }
      } catch (error: unknown) {
        // 404 is expected when preference doesn't exist yet - don't log it
        if (!isAxiosError(error) || error.response?.status !== 404) {
          console.error('Error getting column preferences:', error)
        }
      }
    }
    
    // Fallback to localStorage
    const localPrefs = this.getColumnPreferencesFromLocalStorage()
    if (localPrefs) {
      return localPrefs
    }
    
    return this.getDefaultColumns()
  },

  /**
   * Save column preferences to backend
   */
  async saveColumnPreferences(preferences: TradingBoardColumnPreferences): Promise<void> {
    try {
      await apiClient.post('/UserPreference', {
        preferenceKey: COLUMN_PREFERENCE_KEY,
        preferenceValue: JSON.stringify(preferences),
      })
      
      // Also save to localStorage as backup
      this.saveColumnPreferencesToLocalStorage(preferences)
    } catch (error) {
      console.error('Error saving column preferences:', error)
      // Save to localStorage if backend fails
      this.saveColumnPreferencesToLocalStorage(preferences)
      throw error
    }
  },

  /**
   * Get default column configuration
   */
  getDefaultColumns(): TradingBoardColumnPreferences {
    return {
      visibleColumns: [...DEFAULT_VISIBLE_COLUMNS],
      columnOrder: [...DEFAULT_COLUMN_ORDER],
    }
  },

  /**
   * Get column preferences from localStorage (backup)
   */
  getColumnPreferencesFromLocalStorage(): TradingBoardColumnPreferences | null {
    try {
      const saved = localStorage.getItem(LOCALSTORAGE_COLUMN_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading column preferences from localStorage:', error)
    }
    return null
  },

  /**
   * Save column preferences to localStorage (backup)
   */
  saveColumnPreferencesToLocalStorage(preferences: TradingBoardColumnPreferences): void {
    try {
      localStorage.setItem(LOCALSTORAGE_COLUMN_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving column preferences to localStorage:', error)
    }
  },
}

