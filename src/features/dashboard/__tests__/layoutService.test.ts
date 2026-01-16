import { describe, it, expect, beforeEach, vi } from 'vitest'
import { layoutService } from '../services/layoutService'
import { apiClient } from '@/infrastructure/api/apiClient'

vi.mock('@/infrastructure/api/apiClient')

describe('layoutService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('validateLayout', () => {
    it('should validate correct layout', () => {
      const validLayout = {
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

      expect(layoutService.validateLayout(validLayout as any)).toBe(true)
    })

    it('should reject invalid layout without widgets', () => {
      const invalidLayout = {
        id: 'layout-1',
        cols: 12,
        rowHeight: 30,
      }

      expect(layoutService.validateLayout(invalidLayout as any)).toBe(false)
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

      expect(layoutService.validateLayout(invalidLayout as any)).toBe(false)
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
