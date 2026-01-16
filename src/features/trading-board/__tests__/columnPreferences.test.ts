import { describe, it, expect, beforeEach, vi } from 'vitest'
import { columnPreferencesService } from '../services/columnPreferencesService'
import { apiClient } from '@/infrastructure/api/apiClient'

vi.mock('@/infrastructure/api/apiClient')

describe('columnPreferencesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('getColumnPreferences', () => {
    it('should return preferences from backend', async () => {
      const mockPreferences = {
        visibleColumns: ['symbol', 'name', 'price'],
        columnOrder: ['symbol', 'name', 'price'],
      }

      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          preferenceKey: 'trading_board_columns',
          preferenceValue: JSON.stringify(mockPreferences),
        },
      } as any)

      const result = await columnPreferencesService.getColumnPreferences()

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/UserPreference/trading_board_columns'
      )
      expect(result).toEqual(mockPreferences)
    })

    it('should fallback to localStorage if backend fails', async () => {
      const mockPreferences = {
        visibleColumns: ['symbol', 'name'],
        columnOrder: ['symbol', 'name'],
      }

      vi.mocked(apiClient.get).mockRejectedValue(new Error('Not found'))
      localStorage.setItem(
        'trading_board_columns_config',
        JSON.stringify(mockPreferences)
      )

      const result = await columnPreferencesService.getColumnPreferences()

      expect(result).toEqual(mockPreferences)
    })
  })

  describe('saveColumnPreferences', () => {
    it('should save preferences to backend and localStorage', async () => {
      const preferences = {
        visibleColumns: ['symbol', 'name'],
        columnOrder: ['symbol', 'name'],
      }

      vi.mocked(apiClient.post).mockResolvedValue({} as any)

      await columnPreferencesService.saveColumnPreferences(preferences)

      expect(apiClient.post).toHaveBeenCalledWith('/api/UserPreference', {
        preferenceKey: 'trading_board_columns',
        preferenceValue: JSON.stringify(preferences),
      })
      expect(localStorage.getItem('trading_board_columns_config')).toBe(
        JSON.stringify(preferences)
      )
    })
  })
})
