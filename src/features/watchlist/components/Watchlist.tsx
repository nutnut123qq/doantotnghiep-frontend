import { useState } from 'react'

export const Watchlist = () => {
  const [watchlists] = useState([
    {
      id: '1',
      name: 'Tech Stocks',
      stocks: [
        { symbol: 'FPT', name: 'FPT Corporation', price: 85000, change: 2.5 },
        { symbol: 'CMG', name: 'CMC Corporation', price: 45000, change: -1.2 },
      ],
    },
    {
      id: '2',
      name: 'Banking',
      stocks: [
        { symbol: 'VCB', name: 'Vietcombank', price: 190704, change: 1.8 },
        { symbol: 'TCB', name: 'Techcombank', price: 52000, change: 0.5 },
      ],
    },
  ])

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Watchlist
            </h1>
            <p className="text-slate-600">Track your favorite stocks and market trends</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Watchlist</span>
          </button>
        </div>

        {/* Watchlists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {watchlists.map((watchlist) => (
            <div key={watchlist.id} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Watchlist Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-lg font-semibold text-slate-900">{watchlist.name}</h3>
                    <span className="text-sm text-slate-500">({watchlist.stocks.length} stocks)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-slate-600 hover:bg-white rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button className="p-2 text-slate-600 hover:bg-white rounded-lg transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stocks List */}
              <div className="divide-y divide-slate-100">
                {watchlist.stocks.map((stock) => (
                  <div key={stock.symbol} className="px-6 py-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-sm text-slate-600">{stock.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {stock.price.toLocaleString('vi-VN')}
                          </p>
                          <p className={`text-sm font-semibold ${stock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Stock Button */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <button className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Stock</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State for New Users */}
        {watchlists.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Watchlists Yet</h3>
            <p className="text-slate-600 mb-6">Create your first watchlist to start tracking stocks</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200">
              Create Your First Watchlist
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

