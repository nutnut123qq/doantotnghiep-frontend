import type { LayoutConfig } from '@/shared/types/layoutTypes'

export const DASHBOARD_LAYOUT_SCHEMA_VERSION = 1

export interface PersistedLayoutPayload {
  version: number
  layout: LayoutConfig
}

export const isLayoutConfig = (layout: unknown): layout is LayoutConfig => {
  const value = layout as LayoutConfig | null
  if (!value || typeof value !== 'object') return false
  if (!value.widgets || !Array.isArray(value.widgets)) return false
  if (typeof value.cols !== 'number' || value.cols <= 0) return false
  if (typeof value.rowHeight !== 'number' || value.rowHeight <= 0) return false

  for (const widget of value.widgets) {
    if (!widget.id || !widget.type) return false
    if (typeof widget.x !== 'number' || typeof widget.y !== 'number') return false
    if (typeof widget.w !== 'number' || typeof widget.h !== 'number') return false
    if (widget.w <= 0 || widget.h <= 0) return false
  }

  return true
}

export const deserializeLayoutPayload = (raw: string): PersistedLayoutPayload | null => {
  const parsed = JSON.parse(raw) as unknown
  if (!parsed || typeof parsed !== 'object') return null

  const payload = parsed as Partial<PersistedLayoutPayload>
  if (typeof payload.version === 'number' && isLayoutConfig(payload.layout)) {
    return {
      version: payload.version,
      layout: payload.layout,
    }
  }

  if (isLayoutConfig(parsed)) {
    return {
      version: 0,
      layout: parsed,
    }
  }

  return null
}
