import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { useWatchlists } from '../hooks/useWatchlists'
import { CreateWatchlistModal } from './CreateWatchlistModal'
import { EditWatchlistModal } from './EditWatchlistModal'
import { AddStockModal } from './AddStockModal'
import { formatNumber, formatPercentage } from '@/lib/table-utils'

export const Watchlist = () => {
  const {
    watchlists,
    isLoading,
    error,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addStock,
    removeStock,
    isCreating,
    isUpdating,
    isDeleting,
    isAddingStock,
    isRemovingStock,
  } = useWatchlists()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingWatchlist, setEditingWatchlist] = useState<{ id: string; name: string } | null>(null)
  const [addingToWatchlist, setAddingToWatchlist] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa watchlist "${name}"?`)) {
      try {
        await deleteWatchlist(id)
      } catch (err) {
        // Error is handled by the mutation
      }
    }
  }

  const handleRemoveStock = async (watchlistId: string, symbol: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${symbol} khỏi watchlist?`)) {
      try {
        await removeStock({ watchlistId, symbol })
      } catch (err) {
        // Error is handled by the mutation
      }
    }
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Watchlist
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Theo dõi các cổ phiếu yêu thích và xu hướng thị trường</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            disabled={isCreating}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{isCreating ? 'Đang tạo...' : 'Tạo Watchlist'}</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400">
              Lỗi khi tải watchlists: {error instanceof Error ? error.message : 'Đã xảy ra lỗi'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
                <div className="bg-slate-100 dark:bg-slate-700 h-20"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Watchlists Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {watchlists.map((watchlist) => (
              <div key={watchlist.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Watchlist Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StarIcon className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{watchlist.name}</h3>
                      <span className="text-sm text-slate-500 dark:text-slate-400">({watchlist.stocks.length} cổ phiếu)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingWatchlist({ id: watchlist.id, name: watchlist.name })}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                        disabled={isUpdating}
                        title="Chỉnh sửa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(watchlist.id, watchlist.name)}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors hover:text-rose-600 dark:hover:text-rose-400"
                        disabled={isDeleting}
                        title="Xóa"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stocks List */}
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {watchlist.stocks.length === 0 ? (
                    <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      <p>Chưa có cổ phiếu nào trong watchlist này</p>
                    </div>
                  ) : (
                    watchlist.stocks.map((stock) => (
                      <div key={stock.symbol} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {stock.symbol}
                              </span>
                              <span className="text-sm text-slate-600 dark:text-slate-300">{stock.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {formatNumber(stock.price)}
                              </p>
                              <p className={`text-sm font-semibold ${stock.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {formatPercentage(stock.changePercent)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveStock(watchlist.id, stock.symbol)}
                              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                              disabled={isRemovingStock}
                              title="Xóa cổ phiếu"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Stock Button */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      if (watchlist.id) {
                        setAddingToWatchlist(String(watchlist.id))
                      } else {
                        console.error('Watchlist ID is undefined:', watchlist)
                      }
                    }}
                    className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center justify-center space-x-2"
                    disabled={isAddingStock || !watchlist.id}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{isAddingStock ? 'Đang thêm...' : 'Thêm Cổ Phiếu'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for New Users */}
        {!isLoading && watchlists.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center border border-slate-200 dark:border-slate-700">
            <div className="flex justify-center mb-4">
              <StarIcon className="w-16 h-16 text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Chưa có Watchlist nào</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Tạo watchlist đầu tiên để bắt đầu theo dõi cổ phiếu</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              disabled={isCreating}
            >
              {isCreating ? 'Đang tạo...' : 'Tạo Watchlist Đầu Tiên'}
            </button>
          </div>
        )}

        {/* Modals */}
        <CreateWatchlistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={createWatchlist}
          isCreating={isCreating}
        />

        {editingWatchlist && (
          <EditWatchlistModal
            isOpen={!!editingWatchlist}
            onClose={() => setEditingWatchlist(null)}
            onUpdate={updateWatchlist}
            watchlistId={editingWatchlist.id}
            currentName={editingWatchlist.name}
            isUpdating={isUpdating}
          />
        )}

        {addingToWatchlist && (
          <AddStockModal
            isOpen={!!addingToWatchlist}
            onClose={() => setAddingToWatchlist(null)}
            onAdd={(params) => addStock(params)}
            watchlistId={addingToWatchlist}
            existingStocks={watchlists.find((w) => w.id === addingToWatchlist)?.stocks || []}
            isAdding={isAddingStock}
          />
        )}
      </div>
    </div>
  )
}

