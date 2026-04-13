import { describe, it, expect, beforeEach, vi } from 'vitest'
import { layoutService } from '../services/layoutService'
import { apiClient } from '@/infrastructure/api/apiClient'
import type { LayoutConfig } from '@/shared/types/layoutTypes'

vi.mock('@/infrastructure/api/apiClient')

describe('layoutService', () => {
  const validLayout: LayoutConfig = {
    id: 'layout-1',
    name: 'Test Layout',
    cols: 12,
    rowHeight: 30,
    isDraggable: true,
    isResizable: true,
    widgets: [
      {
        id: 'widget-1',
        type: 'chart',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        visible: true,
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(localStorage.getItem).mockReset()
    vi.mocked(localStorage.setItem).mockReset()
    vi.mocked(localStorage.removeItem).mockReset()
    vi.mocked(localStorage.clear).mockReset()
  })

  describe('validateLayout', () => {
    it('should validate correct layout', () => {
      expect(layoutService.validateLayout(validLayout)).toBe(true)
    })

    it('should reject invalid layout without widgets', () => {
      const invalidLayout = {
        id: 'layout-1',
        cols: 12,
        rowHeight: 30,
      }

      expect(layoutService.validateLayout(invalidLayout as LayoutConfig)).toBe(false)
    })

    it('should reject layout with invalid widget', () => {
      const invalidLayout = {
        id: 'layout-1',
        cols: 12,
        rowHeight: 30,
        widgets: [
          {
            id: 'widget-1',
            // missing required fields
          },
        ],
      }

      expect(layoutService.validateLayout(invalidLayout as LayoutConfig)).toBe(false)
    })
  })

  describe('schema versioning and fallback', () => {
    it('should read localStorage payload with current schema version', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({ version: 1, layout: validLayout })
      )

      const result = layoutService.getLayoutFromLocalStorage()
      expect(result).toEqual(validLayout)
    })

    it('should ignore outdated localStorage payload', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({ version: 0, layout: validLayout })
      )

      const result = layoutService.getLayoutFromLocalStorage()
      expect(result).toBeNull()
    })

    it('should fallback to localStorage when backend payload is outdated', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          preferenceValue: JSON.stringify({ version: 0, layout: validLayout }),
        },
      } as never)
      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({ version: 1, layout: validLayout })
      )

      const result = await layoutService.getLayout()
      expect(result).toEqual(validLayout)
    })
  })

  describe('importLayout', () => {
    it('should import layout from file', async () => {
      const layoutData = {
        id: 'layout-1',
        name: 'Imported Layout',
        cols: 12,
        rowHeight: 30,
        isDraggable: true,
        isResizable: true,
        widgets: [
          {
            id: 'widget-1',
            type: 'chart',
            x: 0,
            y: 0,
            w: 6,
            h: 4,
            visible: true,
          },
        ],
      }

      const file = new File([JSON.stringify(layoutData)], 'layout.json', {
        type: 'application/json',
      })

      const result = await layoutService.importLayout(file)

      expect(result).toEqual(layoutData)
    })

    it('should reject invalid layout file', async () => {
      const invalidFile = new File(['invalid json'], 'layout.json', {
        type: 'application/json',
      })

      await expect(layoutService.importLayout(invalidFile)).rejects.toThrow()
    })
  })
})
