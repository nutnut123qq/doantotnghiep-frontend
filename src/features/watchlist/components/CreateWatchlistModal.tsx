import { useState } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CreateWatchlistModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => Promise<void>
  isCreating?: boolean
}

export const CreateWatchlistModal = ({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
}: CreateWatchlistModalProps) => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Tên watchlist không được để trống')
      return
    }

    try {
      await onCreate(name.trim())
      setName('')
      onClose()
    } catch (err) {
      // Error is handled by the mutation in useWatchlists hook
    }
  }

  const handleClose = () => {
    setName('')
    setError('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tạo Watchlist Mới"
      description="Nhập tên cho watchlist mới của bạn"
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
            disabled={isCreating}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isCreating || !name.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isCreating ? 'Đang tạo...' : 'Tạo Watchlist'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
