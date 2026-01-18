import { useState, useEffect } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface EditWatchlistModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, name: string) => Promise<void>
  watchlistId: string
  currentName: string
  isUpdating?: boolean
}

export const EditWatchlistModal = ({
  isOpen,
  onClose,
  onUpdate,
  watchlistId,
  currentName,
  isUpdating = false,
}: EditWatchlistModalProps) => {
  const [name, setName] = useState(currentName)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(currentName)
      setError('')
    }
  }, [isOpen, currentName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Tên watchlist không được để trống')
      return
    }

    if (name.trim() === currentName) {
      onClose()
      return
    }

    try {
      await onUpdate(watchlistId, name.trim())
      onClose()
    } catch {
      // Error is handled by the mutation in useWatchlists hook
    }
  }

  const handleClose = () => {
    setName(currentName)
    setError('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chỉnh sửa Watchlist"
      description="Cập nhật tên cho watchlist của bạn"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="watchlist-name" className="block text-sm font-medium text-slate-700 mb-2">
            Tên Watchlist
          </label>
          <Input
            id="watchlist-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="Ví dụ: Tech Stocks, Banking..."
            disabled={isUpdating}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isUpdating || !name.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
