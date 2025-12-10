import type { StockTicker } from '@/domain/entities/StockTicker'

interface TickerRowProps {
  ticker: StockTicker
}

export const TickerRow = ({ ticker }: TickerRowProps) => {
  const isPositive = ticker.change && ticker.change >= 0
  const changeColor = isPositive ? 'text-emerald-600' : 'text-rose-600'
  const changeBgColor = isPositive ? 'bg-emerald-50' : 'bg-rose-50'
  const changePercentColor = ticker.changePercent && ticker.changePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'

  return (
    <tr className="hover:bg-slate-50 transition-colors duration-150 group">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {ticker.symbol}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-slate-600">{ticker.name}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {ticker.exchange}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className="text-sm font-semibold text-slate-900">
          {ticker.currentPrice.toLocaleString('vi-VN')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${changeBgColor} ${changeColor}`}>
          {ticker.change ? (ticker.change >= 0 ? '+' : '') + ticker.change.toLocaleString('vi-VN') : '-'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className={`text-sm font-bold ${changePercentColor}`}>
          {ticker.changePercent
            ? (ticker.changePercent >= 0 ? '+' : '') + ticker.changePercent.toFixed(2) + '%'
            : '-'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <span className="text-sm text-slate-600">
          {ticker.volume ? ticker.volume.toLocaleString('vi-VN') : '-'}
        </span>
      </td>
    </tr>
  )
}

