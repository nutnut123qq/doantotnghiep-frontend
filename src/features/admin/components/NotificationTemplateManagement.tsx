import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/shared/components/PageHeader'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { toast } from 'sonner'
import type { NotificationTemplate } from '@/shared/types/notificationTemplateTypes'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import { useNotificationTemplates } from '../hooks/useNotificationTemplates'
import { usePushConfig } from '../hooks/usePushConfig'
import { TemplateListSection } from './notification-template/TemplateListSection'
import { PushConfigSection } from './notification-template/PushConfigSection'
import { TemplateModal } from './notification-template/TemplateModal'
import { TemplatePreviewModal } from './notification-template/TemplatePreviewModal'

export function NotificationTemplateManagement() {
  const {
    groupedTemplates,
    isLoading,
    loadTemplates,
    removeTemplate,
    previewTemplate,
  } = useNotificationTemplates()
  const { pushConfig, loadPushConfig } = usePushConfig()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [previewData, setPreviewData] = useState<{ renderedSubject: string; renderedBody: string } | null>(null)

  useEffect(() => {
    void loadTemplates()
    void loadPushConfig()
  }, [])

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setTemplateToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return
    try {
      await removeTemplate(templateToDelete)
    } catch (error: unknown) {
      toast.error(getAxiosErrorMessage(error) || 'Failed to delete template')
    } finally {
      setDeleteConfirmOpen(false)
      setTemplateToDelete(null)
    }
  }

  const handlePreview = async (template: NotificationTemplate) => {
    try {
      const preview = await previewTemplate(template.id)
      setPreviewData(preview)
      setIsPreviewOpen(true)
    } catch (error: unknown) {
      toast.error(getAxiosErrorMessage(error) || 'Failed to preview template')
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Template Management"
        description="Manage notification templates and push notification settings"
        actions={
          <Button
            onClick={() => {
              setEditingTemplate(null)
              setIsModalOpen(true)
            }}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Template</span>
          </Button>
        }
      />

      <TemplateListSection
        groupedTemplates={groupedTemplates}
        onPreview={handlePreview}
        onEdit={(template) => {
          setEditingTemplate(template)
          setIsModalOpen(true)
        }}
        onDelete={handleDelete}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
      />

      <PushConfigSection
        config={pushConfig}
        onSaved={async () => {
          await loadPushConfig()
        }}
      />

      {/* Template Modal */}
      {isModalOpen && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTemplate(null)
          }}
          onSaved={async () => {
            await loadTemplates()
            setIsModalOpen(false)
            setEditingTemplate(null)
          }}
        />
      )}

      {/* Preview Modal */}
      {isPreviewOpen && previewData && (
        <TemplatePreviewModal
          subject={previewData.renderedSubject}
          body={previewData.renderedBody}
          onClose={() => {
            setIsPreviewOpen(false)
            setPreviewData(null)
          }}
        />
      )}
    </div>
  )
}

