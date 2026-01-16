import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertForm } from './AlertForm'
import { NLPChatInput } from './NLPChatInput'
import { SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
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
  const [activeTab, setActiveTab] = useState<'nlp' | 'form'>('nlp')

  const handleSubmit = (data: CreateAlertRequest) => {
    onCreate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Alert</DialogTitle>
          <DialogDescription>
            Create an alert using natural language or fill out the form manually
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'nlp' | 'form')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nlp" className="flex items-center space-x-2">
              <SparklesIcon className="h-4 w-4" />
              <span>Natural Language</span>
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center space-x-2">
              <DocumentTextIcon className="h-4 w-4" />
              <span>Form</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nlp" className="mt-4 flex-1 overflow-hidden">
            <NLPChatInput
              onSubmit={handleSubmit}
              onCancel={onClose}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="form" className="mt-4">
            <AlertForm
              onSubmit={handleSubmit}
              onCancel={onClose}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
