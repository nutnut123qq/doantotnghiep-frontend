import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertForm } from './AlertForm'
import type { CreateAlertRequest } from '../types/alert.types'

interface CreateAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateAlertRequest) => void
  isLoading?: boolean
}

export const CreateAlertModal = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateAlertModalProps) => {
  const handleSubmit = (data: CreateAlertRequest) => {
    onCreate(data)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Alert</DialogTitle>
          <DialogDescription>Fill out the form to create a new alert</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <AlertForm onSubmit={handleSubmit} onCancel={onClose} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
