import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { notificationTemplateService } from '../services/notificationTemplateService'
import type { NotificationTemplate, PushNotificationConfig } from '@/shared/types/notificationTemplateTypes'
import {
  NotificationEventType,
  NOTIFICATION_EVENT_TYPE_LABELS,
  TEMPLATE_VARIABLES,
} from '@/shared/types/notificationTemplateTypes'

export function NotificationTemplateManagement() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [pushConfig, setPushConfig] = useState<PushNotificationConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)
  const [previewData, setPreviewData] = useState<{ renderedSubject: string; renderedBody: string } | null>(null)

  useEffect(() => {
    loadTemplates()
    loadPushConfig()
  }, [])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const loadedTemplates = await notificationTemplateService.getAll()
      setTemplates(loadedTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPushConfig = async () => {
    try {
      const config = await notificationTemplateService.getPushConfig()
      setPushConfig(config)
    } catch (error) {
      console.error('Error loading push config:', error)
    }
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setTemplateToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!templateToDelete) return
    try {
      await notificationTemplateService.delete(templateToDelete)
      toast.success('Template deleted successfully')
      await loadTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    } finally {
      setDeleteConfirmOpen(false)
      setTemplateToDelete(null)
    }
  }

  const handlePreview = async (template: NotificationTemplate) => {
    try {
      const sampleData: Record<string, string> = {
        stockSymbol: 'VIC',
        companyName: 'Vingroup',
        price: '100,000',
        change: '+5,000',
        changePercent: '+5.26%',
        volume: '1,000,000',
        condition: 'Price >= 100,000',
        timestamp: new Date().toLocaleString('vi-VN'),
        eventTitle: 'Q4 2024 Earnings',
        eventDate: '2024-12-31',
      }

      const preview = await notificationTemplateService.previewTemplate(template.id, sampleData)
      setPreviewData(preview)
      setIsPreviewOpen(true)
    } catch (error) {
      console.error('Error previewing template:', error)
      toast.error('Failed to preview template')
    }
  }

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.eventType]) {
      acc[template.eventType] = []
    }
    acc[template.eventType].push(template)
    return acc
  }, {} as Record<NotificationEventType, NotificationTemplate[]>)

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

      {/* Templates by Event Type */}
      {Object.entries(groupedTemplates).map(([eventType, eventTemplates]) => (
        <Card key={eventType} className="bg-[hsl(var(--surface-1))]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">
              {NOTIFICATION_EVENT_TYPE_LABELS[Number(eventType) as NotificationEventType]} Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventTemplates.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No templates configured"
                description="Create a template to get started"
              />
            ) : (
              <div className="space-y-3">
                {eventTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-semibold text-[hsl(var(--text))]">{template.name}</h4>
                          {template.isActive && (
                            <Badge className="bg-[hsl(var(--positive))] text-[hsl(var(--positive-foreground))]">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[hsl(var(--muted))]">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted))] mt-1 line-clamp-2">
                          <strong>Body:</strong> {template.body}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(template)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTemplate(template)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
      />

      {/* Push Notification Configuration */}
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">Push Notification Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <PushNotificationConfigSection
            config={pushConfig}
            onSave={async () => {
              await loadPushConfig()
            }}
          />
        </CardContent>
      </Card>

      {/* Template Modal */}
      {isModalOpen && (
        <NotificationTemplateModal
          template={editingTemplate}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTemplate(null)
          }}
          onSave={async () => {
            await loadTemplates()
            setIsModalOpen(false)
            setEditingTemplate(null)
          }}
        />
      )}

      {/* Preview Modal */}
      {isPreviewOpen && previewData && (
        <PreviewModal
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

interface PushNotificationConfigSectionProps {
  config: PushNotificationConfig | null
  onSave: () => void
}

function PushNotificationConfigSection({ config, onSave }: PushNotificationConfigSectionProps) {
  const [formData, setFormData] = useState({
    serviceName: config?.serviceName || 'Firebase',
    serverKey: config?.serverKey || '',
    appId: config?.appId || '',
    isEnabled: config?.isEnabled ?? false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [testDeviceToken, setTestDeviceToken] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await notificationTemplateService.updatePushConfig({
        ...formData,
        id: config?.id,
      })
      toast.success('Push notification configuration saved successfully')
      onSave()
    } catch (error) {
      console.error('Error saving push config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testDeviceToken.trim()) {
      toast.error('Please enter a device token')
      return
    }

    try {
      setIsTesting(true)
      const result = await notificationTemplateService.testPushNotification(
        testDeviceToken,
        'Test Notification',
        'This is a test push notification from Stock Investment Platform'
      )
      if (result.success) {
        toast.success('Test notification sent successfully!')
      } else {
        toast.error(`Failed to send test notification: ${result.errorMessage || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error testing push notification:', error)
      toast.error('Failed to send test notification')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <Label htmlFor="serviceName">Service</Label>
        <Select
          value={formData.serviceName}
          onValueChange={(value) => setFormData({ ...formData, serviceName: value })}
        >
          <SelectTrigger id="serviceName">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Firebase">Firebase Cloud Messaging (FCM)</SelectItem>
            <SelectItem value="OneSignal">OneSignal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="serverKey">Server Key</Label>
        <Input
          id="serverKey"
          type="password"
          value={formData.serverKey}
          onChange={(e) => setFormData({ ...formData, serverKey: e.target.value })}
          placeholder={config?.serverKey ? '••••••••' : 'Enter server key'}
        />
      </div>

      <div>
        <Label htmlFor="appId">App ID</Label>
        <Input
          id="appId"
          type="text"
          value={formData.appId}
          onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
          placeholder="Enter app ID"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isEnabled"
          checked={formData.isEnabled}
          onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
        />
        <Label htmlFor="isEnabled">Enable Push Notifications</Label>
      </div>

      <div className="flex items-center space-x-3 pt-4 border-t border-[hsl(var(--border))]">
        <div className="flex-1">
          <Label htmlFor="testDeviceToken">Test Device Token</Label>
          <Input
            id="testDeviceToken"
            type="text"
            value={testDeviceToken}
            onChange={(e) => setTestDeviceToken(e.target.value)}
            placeholder="Enter device token to test"
          />
        </div>
        <Button
          type="button"
          onClick={handleTest}
          disabled={isTesting || !formData.isEnabled}
          variant="outline"
          className="mt-6"
        >
          {isTesting ? 'Testing...' : 'Test'}
        </Button>
      </div>

      <Button type="submit" disabled={isSaving} className="w-full">
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </form>
  )
}

interface NotificationTemplateModalProps {
  template: NotificationTemplate | null
  onClose: () => void
  onSave: () => void
}

function NotificationTemplateModal({ template, onSave, onClose }: NotificationTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    eventType: template?.eventType || NotificationEventType.PriceAlert,
    subject: template?.subject || '',
    body: template?.body || '',
    isActive: template?.isActive ?? true,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      if (template) {
        await notificationTemplateService.update(template.id, formData)
      } else {
        await notificationTemplateService.create(formData)
      }
      toast.success('Template saved successfully')
      onSave()
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Add Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="templateName">Name</Label>
            <Input
              id="templateName"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              value={formData.eventType.toString()}
              onValueChange={(value) => setFormData({ ...formData, eventType: Number(value) })}
            >
              <SelectTrigger id="eventType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTIFICATION_EVENT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Alert: {stockSymbol} reached {price}"
            />
          </div>

          <div>
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              required
              rows={6}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="e.g., Your alert has been triggered! Stock: {stockSymbol} ({companyName}) Current Price: {price}"
            />
            <p className="text-xs text-[hsl(var(--muted))] mt-1">
              Available variables: {Object.keys(TEMPLATE_VARIABLES).join(', ')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="templateIsActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="templateIsActive">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface PreviewModalProps {
  subject: string
  body: string
  onClose: () => void
}

function PreviewModal({ subject, body, onClose }: PreviewModalProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Subject</Label>
            <div className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-sm text-[hsl(var(--text))] mt-2">
              {subject}
            </div>
          </div>

          <div>
            <Label>Body</Label>
            <div className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-lg px-4 py-3 text-sm text-[hsl(var(--text))] whitespace-pre-wrap mt-2">
              {body}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

