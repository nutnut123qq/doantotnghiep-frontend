// Layout configuration types for customizable dashboard

export interface WidgetConfig {
  id: string
  type: 'news' | 'financialReports' | 'chart' | 'forecast' | 'watchlist' | 'alerts' | 'portfolio' | 'events'
  x: number
  y: number
  w: number // width in grid units
  h: number // height in grid units
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  visible: boolean
  props?: Record<string, any> // widget-specific props
}

export interface LayoutConfig {
  id: string
  name: string
  widgets: WidgetConfig[]
  cols: number // number of columns in grid
  rowHeight: number
  breakpoints?: { lg: number; md: number; sm: number; xs: number; xxs: number }
  isDraggable: boolean
  isResizable: boolean
}

export interface LayoutTemplate {
  id: string
  name: string
  description: string
  thumbnail?: string
  config: LayoutConfig
}

export interface ShareLayoutRequest {
  layoutJson: string
  isPublic?: boolean
  expiresAt?: string
}

export interface ShareLayoutResponse {
  code: string
  expiresAt: string
}

export interface SharedLayoutInfo {
  id: string
  code: string
  createdAt: string
  expiresAt: string
  isPublic: boolean
}

export interface AdminSharedLayoutInfo extends SharedLayoutInfo {
  ownerId: string
  isExpired: boolean
}

// Predefined widget defaults
export const DEFAULT_WIDGET_CONFIGS: Record<string, Partial<WidgetConfig>> = {
  news: {
    type: 'news',
    w: 4,
    h: 4,
    minW: 3,
    minH: 3,
    visible: true,
  },
  financialReports: {
    type: 'financialReports',
    w: 4,
    h: 5,
    minW: 3,
    minH: 4,
    visible: true,
  },
  chart: {
    type: 'chart',
    w: 8,
    h: 6,
    minW: 6,
    minH: 4,
    visible: true,
  },
  forecast: {
    type: 'forecast',
    w: 4,
    h: 6,
    minW: 3,
    minH: 4,
    visible: true,
  },
  watchlist: {
    type: 'watchlist',
    w: 4,
    h: 4,
    minW: 3,
    minH: 3,
    visible: true,
  },
  alerts: {
    type: 'alerts',
    w: 4,
    h: 4,
    minW: 3,
    minH: 3,
    visible: true,
  },
  portfolio: {
    type: 'portfolio',
    w: 4,
    h: 3,
    minW: 3,
    minH: 2,
    visible: true,
  },
  events: {
    type: 'events',
    w: 4,
    h: 4,
    minW: 3,
    minH: 3,
    visible: true,
  },
}

// Default layouts (templates)
export const DEFAULT_LAYOUT: LayoutConfig = {
  id: 'default',
  name: 'Default Layout',
  cols: 12,
  rowHeight: 80,
  isDraggable: true,
  isResizable: true,
  widgets: [
    { id: 'chart-1', type: 'chart', x: 0, y: 0, w: 8, h: 6, minW: 6, minH: 4, visible: true },
    { id: 'forecast-1', type: 'forecast', x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4, visible: true },
    { id: 'news-1', type: 'news', x: 0, y: 6, w: 4, h: 4, minW: 3, minH: 3, visible: true },
    { id: 'financialReports-1', type: 'financialReports', x: 4, y: 6, w: 8, h: 5, minW: 3, minH: 4, visible: true },
  ],
}

export const COMPACT_LAYOUT: LayoutConfig = {
  id: 'compact',
  name: 'Compact Layout',
  cols: 12,
  rowHeight: 60,
  isDraggable: true,
  isResizable: true,
  widgets: [
    { id: 'chart-1', type: 'chart', x: 0, y: 0, w: 6, h: 5, minW: 4, minH: 3, visible: true },
    { id: 'forecast-1', type: 'forecast', x: 6, y: 0, w: 6, h: 5, minW: 3, minH: 3, visible: true },
    { id: 'watchlist-1', type: 'watchlist', x: 0, y: 5, w: 3, h: 3, minW: 2, minH: 2, visible: true },
    { id: 'alerts-1', type: 'alerts', x: 3, y: 5, w: 3, h: 3, minW: 2, minH: 2, visible: true },
    { id: 'news-1', type: 'news', x: 6, y: 5, w: 6, h: 3, minW: 3, minH: 2, visible: true },
  ],
}

export const ADVANCED_LAYOUT: LayoutConfig = {
  id: 'advanced',
  name: 'Advanced Layout',
  cols: 12,
  rowHeight: 80,
  isDraggable: true,
  isResizable: true,
  widgets: [
    { id: 'chart-1', type: 'chart', x: 0, y: 0, w: 8, h: 6, minW: 6, minH: 4, visible: true },
    { id: 'forecast-1', type: 'forecast', x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4, visible: true },
    { id: 'watchlist-1', type: 'watchlist', x: 0, y: 6, w: 3, h: 4, minW: 2, minH: 3, visible: true },
    { id: 'portfolio-1', type: 'portfolio', x: 3, y: 6, w: 3, h: 3, minW: 2, minH: 2, visible: true },
    { id: 'alerts-1', type: 'alerts', x: 6, y: 6, w: 3, h: 4, minW: 2, minH: 3, visible: true },
    { id: 'news-1', type: 'news', x: 9, y: 6, w: 3, h: 4, minW: 2, minH: 3, visible: true },
    { id: 'financialReports-1', type: 'financialReports', x: 0, y: 10, w: 6, h: 5, minW: 4, minH: 4, visible: true },
    { id: 'events-1', type: 'events', x: 6, y: 10, w: 6, h: 5, minW: 4, minH: 4, visible: true },
  ],
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Balanced layout with all essential widgets',
    config: DEFAULT_LAYOUT,
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Minimalist layout for quick overview',
    config: COMPACT_LAYOUT,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Comprehensive layout with all available widgets',
    config: ADVANCED_LAYOUT,
  },
]

// UserPreference type from backend
export interface UserPreference {
  id: string
  userId: string
  preferenceKey: string
  preferenceValue: string
  createdAt: string
  updatedAt: string
}
