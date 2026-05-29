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
      setError('Error: Watchlist not found')
      return
    }

    if (!symbol.trim()) {
      setError('Please select a stock symbol')
      return
    }

    // Check if stock already exists in watchlist
    const symbolUpper = symbol.trim().toUpperCase()
    const exists = existingStocks.some(
      (stock) => stock.symbol.toUpperCase() === symbolUpper
    )

    if (exists) {
      setError(`${symbolUpper} is already in this watchlist`)
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
      title="Add Stock"
      description="Select a stock symbol to add to the watchlist"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="stock-symbol" className="block text-sm font-medium text-slate-700 mb-2">
            Stock Symbol
          </label>
          <SymbolSelector
            value={symbol}
            onChange={setSymbol}
            placeholder="Search stock symbol..."
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
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isAdding || !symbol.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isAdding ? 'Adding...' : 'Add Stock'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
