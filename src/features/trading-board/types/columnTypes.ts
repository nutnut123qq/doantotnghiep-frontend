export type ColumnId = 'symbol' | 'name' | 'exchange' | 'price' | 'change' | 'changePercent' | 'volume' | 'value'

export interface ColumnConfig {
  id: ColumnId
  label: string
  visible: boolean
  order: number
  width?: number
}

export interface TradingBoardColumnPreferences {
  visibleColumns: ColumnId[]
  columnOrder: ColumnId[]
  columnWidths?: Record<ColumnId, number>
}

export const COLUMN_DEFINITIONS: Record<ColumnId, { label: string; defaultWidth?: number }> = {
  symbol: { label: 'Symbol', defaultWidth: 120 },
  name: { label: 'Name', defaultWidth: 200 },
  exchange: { label: 'Exchange', defaultWidth: 100 },
  price: { label: 'Price', defaultWidth: 120 },
  change: { label: 'Change', defaultWidth: 120 },
  changePercent: { label: 'Change %', defaultWidth: 100 },
  volume: { label: 'Volume', defaultWidth: 150 },
  value: { label: 'Value', defaultWidth: 150 },
}

export const DEFAULT_COLUMN_ORDER: ColumnId[] = [
  'symbol',
  'name',
  'exchange',
  'price',
  'change',
  'changePercent',
  'volume',
  'value',
]

export const DEFAULT_VISIBLE_COLUMNS: ColumnId[] = [
  'symbol',
  'name',
  'exchange',
  'price',
  'change',
  'changePercent',
  'volume',
  'value',
]

/** Customizable columns (ColumnId). Indicators rsi, ma20, ma50 are fixed and always visible. */
export const ALL_CUSTOMIZABLE_COLUMN_IDS: ColumnId[] = Object.keys(
  COLUMN_DEFINITIONS
) as ColumnId[]

export const INDICATOR_COLUMN_IDS = ['rsi', 'ma20', 'ma50'] as const

