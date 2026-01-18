import { useState } from 'react'
import { Star, Plus, Pencil, Trash2, X } from 'lucide-react'
import { useWatchlists } from '../hooks/useWatchlists'
import { CreateWatchlistModal } from './CreateWatchlistModal'
import { EditWatchlistModal } from './EditWatchlistModal'
import { AddStockModal } from './AddStockModal'
import { formatNumber, formatPercentage } from '@/lib/table-utils'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [removeStockConfirmOpen, setRemoveStockConfirmOpen] = useState(false)
  const [watchlistToDelete, setWatchlistToDelete] = useState<{ id: string; name: string } | null>(null)
  const [stockToRemove, setStockToRemove] = useState<{ watchlistId: string; symbol: string } | null>(null)

  const handleDeleteClick = (id: string, name: string) => {
    setWatchlistToDelete({ id, name })
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!watchlistToDelete) return
    try {
      await deleteWatchlist(watchlistToDelete.id)
      toast.success(`Watchlist "${watchlistToDelete.name}" đã được xóa`)
      setWatchlistToDelete(null)
    } catch {
      toast.error('Không thể xóa watchlist')
    }
  }

  const handleRemoveStockClick = (watchlistId: string, symbol: string) => {
    setStockToRemove({ watchlistId, symbol })
    setRemoveStockConfirmOpen(true)
  }

  const handleRemoveStockConfirm = async () => {
    if (!stockToRemove) return
    try {
      await removeStock(stockToRemove)
      toast.success(`${stockToRemove.symbol} đã được xóa khỏi watchlist`)
      setStockToRemove(null)
    } catch {
      toast.error('Không thể xóa cổ phiếu')
    }
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Watchlist"
          description="Theo dõi các cổ phiếu yêu thích và xu hướng thị trường"
          actions={
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isCreating}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>{isCreating ? 'Đang tạo...' : 'Tạo Watchlist'}</span>
            </Button>
          }
        />

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
                      <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                      <h3 className="text-lg font-semibold text-[hsl(var(--text))]">{watchlist.name}</h3>
                      <span className="text-sm text-[hsl(var(--muted))]">({watchlist.stocks.length} cổ phiếu)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingWatchlist({ id: watchlist.id, name: watchlist.name })}
                        disabled={isUpdating}
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(watchlist.id, watchlist.name)}
                        disabled={isDeleting}
                        title="Xóa"
                        className="hover:text-[hsl(var(--negative))]"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveStockClick(watchlist.id, stock.symbol)}
                              disabled={isRemovingStock}
                              title="Xóa cổ phiếu"
                              className="text-[hsl(var(--muted))] hover:text-[hsl(var(--negative))]"
                            >
                              <X className="w-5 h-5" />
                            </Button>
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
                    <Plus className="w-4 h-4" />
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
              <Star className="w-16 h-16 text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-[hsl(var(--text))] mb-2">Chưa có Watchlist nào</h3>
            <p className="text-[hsl(var(--muted))] mb-6">Tạo watchlist đầu tiên để bắt đầu theo dõi cổ phiếu</p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isCreating}
            >
              {isCreating ? 'Đang tạo...' : 'Tạo Watchlist Đầu Tiên'}
            </Button>
          </div>
        )}

        {/* Modals */}
        <CreateWatchlistModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={async (name: string) => {
            await createWatchlist(name)
          }}
          isCreating={isCreating}
        />

        {editingWatchlist && (
          <EditWatchlistModal
            isOpen={!!editingWatchlist}
            onClose={() => setEditingWatchlist(null)}
            onUpdate={async (id: string, name: string) => {
              await updateWatchlist({ id, name })
            }}
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

        {/* Delete Watchlist Confirm Dialog */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Xóa Watchlist"
          description={watchlistToDelete ? `Bạn có chắc chắn muốn xóa watchlist "${watchlistToDelete.name}"?` : ''}
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />

        {/* Remove Stock Confirm Dialog */}
        <ConfirmDialog
          open={removeStockConfirmOpen}
          onOpenChange={setRemoveStockConfirmOpen}
          title="Xóa Cổ Phiếu"
          description={stockToRemove ? `Bạn có chắc chắn muốn xóa ${stockToRemove.symbol} khỏi watchlist?` : ''}
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={handleRemoveStockConfirm}
          variant="destructive"
        />
      </div>
    </div>
  )
}

