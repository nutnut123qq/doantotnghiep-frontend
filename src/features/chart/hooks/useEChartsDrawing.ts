import { useState, useCallback } from 'react'
import { chartSettingsService, type ChartSettings } from '@/features/dashboard/services/chartSettingsService'

export interface Trendline {
  id: string
  coord: [[string | number, number], [string | number, number]]
  lineStyle?: { color: string; width: number; type: string }
  label?: { show: boolean; formatter: string }
}

export interface Zone {
  id: string
  coord: Array<Array<{ name: string; yAxis: number }>>
  itemStyle?: { color: string; opacity?: number }
}

export interface Drawings {
  trendlines?: Trendline[]
  zones?: Zone[]
}

export const useEChartsDrawing = (symbol: string) => {
  const [drawings, setDrawings] = useState<Drawings>({})

  // Load drawings from settings
  const loadDrawings = useCallback(async () => {
    try {
      const settings = await chartSettingsService.loadSettings(symbol)
      if (settings?.drawings) {
        setDrawings(settings.drawings)
        return settings.drawings
      }
    } catch (error) {
      // Silent error - drawings are optional
    }
    return {}
  }, [symbol])

  // Add trendline
  const addTrendline = useCallback(async (
    coord: [[string | number, number], [string | number, number]],
    options?: { color?: string; width?: number; label?: string }
  ) => {
    const newTrendline: Trendline = {
      id: `trendline_${Date.now()}`,
      coord,
      lineStyle: {
        color: options?.color || '#ff6b6b',
        width: options?.width || 2,
        type: 'solid',
      },
      label: options?.label ? {
        show: true,
        formatter: options.label,
      } : undefined,
    }

    const updatedDrawings: Drawings = {
      ...drawings,
      trendlines: [...(drawings.trendlines || []), newTrendline],
    }

    setDrawings(updatedDrawings)
    
    // Save to backend (debounced by chartSettingsService)
    await chartSettingsService.saveSettings(symbol, {
      drawings: updatedDrawings,
    })

    return newTrendline
  }, [symbol, drawings])

  // Add zone
  const addZone = useCallback(async (
    coord: Array<Array<{ name: string; yAxis: number }>>,
    options?: { color?: string; opacity?: number }
  ) => {
    const newZone: Zone = {
      id: `zone_${Date.now()}`,
      coord,
      itemStyle: {
        color: options?.color || 'rgba(255, 107, 107, 0.2)',
        opacity: options?.opacity || 0.2,
      },
    }

    const updatedDrawings: Drawings = {
      ...drawings,
      zones: [...(drawings.zones || []), newZone],
    }

    setDrawings(updatedDrawings)
    
    // Save to backend (debounced by chartSettingsService)
    await chartSettingsService.saveSettings(symbol, {
      drawings: updatedDrawings,
    })

    return newZone
  }, [symbol, drawings])

  // Remove drawing by ID
  const removeDrawing = useCallback(async (id: string, type: 'trendline' | 'zone') => {
    const updatedDrawings: Drawings = { ...drawings }

    if (type === 'trendline') {
      updatedDrawings.trendlines = (drawings.trendlines || []).filter(t => t.id !== id)
    } else {
      updatedDrawings.zones = (drawings.zones || []).filter(z => z.id !== id)
    }

    setDrawings(updatedDrawings)
    
    // Save to backend
    await chartSettingsService.saveSettings(symbol, {
      drawings: updatedDrawings,
    })
  }, [symbol, drawings])

  // Clear all drawings
  const clearDrawings = useCallback(async () => {
    setDrawings({})
    await chartSettingsService.saveSettings(symbol, {
      drawings: {},
    })
  }, [symbol])

  return {
    drawings,
    loadDrawings,
    addTrendline,
    addZone,
    removeDrawing,
    clearDrawings,
  }
}
