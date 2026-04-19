export type ColumnId = 'symbol' | 'name' | 'exchange' | 'price' | 'change' | 'changePercent' | 'volume' | 'value'

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
