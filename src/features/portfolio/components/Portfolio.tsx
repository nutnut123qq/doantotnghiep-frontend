export const Portfolio = () => {
  const holdings = [
    { symbol: 'VIC', name: 'VIC Corporation', shares: 1000, avgPrice: 30500, currentPrice: 32076, value: 32076000 },
    { symbol: 'VNM', name: 'VNM Corporation', shares: 500, avgPrice: 195000, currentPrice: 192471, value: 96235500 },
    { symbol: 'VCB', name: 'VCB Corporation', shares: 800, avgPrice: 185000, currentPrice: 190704, value: 152563200 },
    { symbol: 'VRE', name: 'VRE Corporation', shares: 1500, avgPrice: 125000, currentPrice: 127411, value: 191116500 },
  ]

  const calculateGainLoss = (shares: number, avgPrice: number, currentPrice: number) => {
    const totalCost = shares * avgPrice
    const currentValue = shares * currentPrice
    const gainLoss = currentValue - totalCost
    const percentage = (gainLoss / totalCost) * 100
    return { gainLoss, percentage }
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Portfolio
          </h1>
          <p className="text-slate-600">Manage and track your investment holdings</p>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">
                {holdings.reduce((sum, h) => sum + h.value, 0).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-slate-900">
                {holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Gain/Loss</p>
              <p className="text-2xl font-bold text-emerald-600">
                +{(holdings.reduce((sum, h) => sum + h.value, 0) - holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0)).toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Holdings</p>
              <p className="text-2xl font-bold text-slate-900">{holdings.length} stocks</p>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Symbol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Shares</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Avg Price</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Price</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Market Value</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Gain/Loss</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">%</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {holdings.map((holding) => {
                  const { gainLoss, percentage } = calculateGainLoss(holding.shares, holding.avgPrice, holding.currentPrice)
                  const isPositive = gainLoss >= 0
                  return (
                    <tr key={holding.symbol} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-900">{holding.symbol}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{holding.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-slate-900">{holding.shares.toLocaleString('vi-VN')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-slate-900">{holding.avgPrice.toLocaleString('vi-VN')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-slate-900">{holding.currentPrice.toLocaleString('vi-VN')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-slate-900">{holding.value.toLocaleString('vi-VN')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPositive ? '+' : ''}{gainLoss.toLocaleString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold ${
                          isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {isPositive ? '+' : ''}{percentage.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

