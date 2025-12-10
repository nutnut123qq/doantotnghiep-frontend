import { useState, useMemo } from 'react'
import { useTradingBoard } from '../hooks/useTradingBoard'
import { TickerRow } from './TickerRow'
import { SearchInput } from '@/shared/components/SearchInput'
import type { TradingBoardFilters } from '../services/tradingBoardService'

export const TradingBoard = () => {
  const [filters, setFilters] = useState<TradingBoardFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const { tickers, isLoading, error } = useTradingBoard(filters)

  // Filter tickers based on search query
  const filteredTickers = useMemo(() => {
    if (!searchQuery) return tickers
    const query = searchQuery.toLowerCase()
    return tickers.filter(
      (ticker) =>
        ticker.symbol.toLowerCase().includes(query) ||
        ticker.companyName?.toLowerCase().includes(query)
    )
  }, [tickers, searchQuery])

  const handleFilterChange = (key: keyof TradingBoardFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading trading data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md border border-red-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Data</h3>
            <p className="text-slate-600">Unable to load trading board. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Trading Board
          </h1>
          <p className="text-slate-600">Real-time stock market data and analytics</p>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by symbol or company name..."
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Exchange</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-400 cursor-pointer"
                onChange={(e) => handleFilterChange('exchange', e.target.value)}
                value={filters.exchange || ''}
              >
                <option value="">All Exchanges</option>
                <option value="HOSE">HOSE</option>
                <option value="HNX">HNX</option>
                <option value="UPCOM">UPCOM</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
              <input
                type="text"
                placeholder="Filter by industry"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-slate-400"
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                value={filters.industry || ''}
              />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Exchange
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Change %
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Volume
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredTickers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-slate-400">
                        <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium">No tickers found</p>
                        <p className="text-sm mt-1">{searchQuery ? 'No results match your search' : 'Try adjusting your filters'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickers.map((ticker) => (
                    <TickerRow key={ticker.id} ticker={ticker} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

