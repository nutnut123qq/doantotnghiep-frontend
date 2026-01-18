import { useState, useEffect } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/components/ui/button'
import { SymbolSelector } from '@/features/dashboard/components/SymbolSelector'
import type { WatchlistStock } from '../services/watchlistService'

interface AddStockModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (params: { watchlistId: string; symbol: string }) => Promise<void>
  watchlistId: string
  existingStocks: WatchlistStock[]
  isAdding?: boolean
}

export const AddStockModal = ({
  isOpen,
  onClose,
  onAdd,
  watchlistId,
  existingStocks,
  isAdding = false,
}: AddStockModalProps) => {
  const [symbol, setSymbol] = useState('')
  const [error, setError] = useState('')

  // Debug: Log watchlistId when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!watchlistId) {
        console.error('AddStockModal: watchlistId is undefined or empty')
      } else {
        console.log('AddStockModal: watchlistId =', watchlistId)
      }
    }
  }, [isOpen, watchlistId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!watchlistId) {
      setError('Lỗi: Không tìm thấy watchlist')
      return
    }

    if (!symbol.trim()) {
      setError('Vui lòng chọn mã chứng khoán')
      return
    }

    // Check if stock already exists in watchlist
    const symbolUpper = symbol.trim().toUpperCase()
    const exists = existingStocks.some(
      (stock) => stock.symbol.toUpperCase() === symbolUpper
    )

    if (exists) {
      setError(`Mã ${symbolUpper} đã có trong watchlist này`)
      return
    }

    try {
      await onAdd({ watchlistId, symbol: symbolUpper })
      setSymbol('')
      onClose()
    } catch {
      // Error is handled by the mutation in useWatchlists hook
    }
  }

  const handleClose = () => {
    setSymbol('')
    setError('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm Cổ Phiếu"
      description="Chọn mã chứng khoán để thêm vào watchlist"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="stock-symbol" className="block text-sm font-medium text-slate-700 mb-2">
            Mã Chứng Khoán
          </label>
          <SymbolSelector
            value={symbol}
            onChange={setSymbol}
            placeholder="Tìm mã chứng khoán..."
            className="w-full"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isAdding}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isAdding || !symbol.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isAdding ? 'Đang thêm...' : 'Thêm Cổ Phiếu'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
