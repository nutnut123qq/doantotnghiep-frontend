import type { StockTicker } from '@/domain/entities/StockTicker'
import type { ColumnId } from '../types/columnTypes'

interface TickerRowProps {
  ticker: StockTicker
  visibleColumns: ColumnId[]
  columnOrder: ColumnId[]
  columnWidths?: Record<ColumnId, number>
}

export const TickerRow = ({ ticker, visibleColumns, columnOrder, columnWidths }: TickerRowProps) => {
  const isPositive = ticker.change && ticker.change >= 0
  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600'
  const changeBgColor = isPositive ? 'bg-emerald-50' : 'bg-rose-50'
  const changePercentColor = ticker.changePercent && ticker.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'

  const renderCell = (columnId: ColumnId) => {
    const isRightAlign = ['price', 'change', 'changePercent', 'volume', 'value'].includes(columnId)
    const widthStyle = columnWidths?.[columnId] ? { '--cell-width': `${columnWidths[columnId]}px` } as React.CSSProperties : undefined

    switch (columnId) {
      case 'symbol':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap" style={widthStyle}>
            <div className="flex items-center">
              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {ticker.symbol}
              </span>
            </div>
          </td>
        )
      case 'name':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap" style={widthStyle}>
            <span className="text-sm text-slate-600">{ticker.name}</span>
          </td>
        )
      case 'exchange':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap" style={widthStyle}>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {ticker.exchange}
            </span>
          </td>
        )
      case 'price':
        return (
          <td key={columnId} className={`px-6 py-4 whitespace-nowrap ${isRightAlign ? 'text-right' : ''}`} style={widthStyle}>
            <span className="text-sm font-semibold text-slate-900">
              {ticker.currentPrice.toLocaleString('vi-VN')}
            </span>
          </td>
        )
      case 'change':
        return (
          <td key={columnId} className={`px-6 py-4 whitespace-nowrap ${isRightAlign ? 'text-right' : ''}`} style={widthStyle}>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${changeBgColor} ${changeColor}`}>
              {ticker.change ? (ticker.change >= 0 ? '+' : '') + ticker.change.toLocaleString('vi-VN') : '-'}
            </span>
          </td>
        )
      case 'changePercent':
        return (
          <td key={columnId} className={`px-6 py-4 whitespace-nowrap ${isRightAlign ? 'text-right' : ''}`} style={widthStyle}>
            <span className={`text-sm font-bold ${changePercentColor}`}>
              {ticker.changePercent
                ? (ticker.changePercent >= 0 ? '+' : '') + ticker.changePercent.toFixed(2) + '%'
                : '-'}
            </span>
          </td>
        )
      case 'volume':
        return (
          <td key={columnId} className={`px-6 py-4 whitespace-nowrap ${isRightAlign ? 'text-right' : ''}`} style={widthStyle}>
            <span className="text-sm text-slate-600">
              {ticker.volume ? ticker.volume.toLocaleString('vi-VN') : '-'}
            </span>
          </td>
        )
      case 'value':
        return (
          <td key={columnId} className={`px-6 py-4 whitespace-nowrap ${isRightAlign ? 'text-right' : ''}`} style={widthStyle}>
            <span className="text-sm text-slate-600">
              {ticker.value ? ticker.value.toLocaleString('vi-VN') : '-'}
            </span>
          </td>
        )
      default:
        return null
    }
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors duration-150 group">
      {columnOrder
        .filter((colId) => visibleColumns.includes(colId))
        .map((colId) => renderCell(colId))}
    </tr>
  )
}

