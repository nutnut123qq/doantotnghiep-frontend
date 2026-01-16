import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline'
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      await notificationTemplateService.delete(id)
      await loadTemplates()
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
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
      alert('Failed to preview template')
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notification Template Management</h2>
          <p className="text-sm text-slate-600 mt-1">Manage notification templates and push notification settings</p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null)
            setIsModalOpen(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Template</span>
        </button>
      </div>

      {/* Templates by Event Type */}
      {Object.entries(groupedTemplates).map(([eventType, eventTemplates]) => (
        <div key={eventType} className="bg-white rounded-lg shadow border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">
              {NOTIFICATION_EVENT_TYPE_LABELS[Number(eventType) as NotificationEventType]} Templates
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {eventTemplates.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500">
                No templates configured
              </div>
            ) : (
              eventTemplates.map((template) => (
                <div key={template.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-semibold text-slate-900">{template.name}</h4>
                        {template.isActive && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        <strong>Subject:</strong> {template.subject}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        <strong>Body:</strong> {template.body}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreview(template)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingTemplate(template)
                          setIsModalOpen(true)
                        }}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {/* Push Notification Configuration */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Push Notification Configuration</h3>
        <PushNotificationConfigSection
          config={pushConfig}
          onSave={async () => {
            await loadPushConfig()
          }}
        />
      </div>

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
      alert('Push notification configuration saved successfully')
      onSave()
    } catch (error) {
      console.error('Error saving push config:', error)
      alert('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testDeviceToken.trim()) {
      alert('Please enter a device token')
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
        alert('Test notification sent successfully!')
      } else {
        alert(`Failed to send test notification: ${result.errorMessage || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error testing push notification:', error)
      alert('Failed to send test notification')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Service</label>
        <select
          value={formData.serviceName}
          onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Firebase">Firebase Cloud Messaging (FCM)</option>
          <option value="OneSignal">OneSignal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Server Key</label>
        <input
          type="password"
          value={formData.serverKey}
          onChange={(e) => setFormData({ ...formData, serverKey: e.target.value })}
          placeholder={config?.serverKey ? '••••••••' : 'Enter server key'}
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">App ID</label>
        <input
          type="text"
          value={formData.appId}
          onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
          placeholder="Enter app ID"
          className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isEnabled}
            onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-700">Enable Push Notifications</span>
        </label>
      </div>

      <div className="flex items-center space-x-3 pt-4 border-t border-slate-200">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Test Device Token</label>
          <input
            type="text"
            value={testDeviceToken}
            onChange={(e) => setTestDeviceToken(e.target.value)}
            placeholder="Enter device token to test"
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting || !formData.isEnabled}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 mt-6"
        >
          {isTesting ? 'Testing...' : 'Test'}
        </button>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </button>
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
      onSave()
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            {template ? 'Edit Template' : 'Add Template'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Event Type</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: Number(e.target.value) })}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(NOTIFICATION_EVENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Alert: {stockSymbol} reached {price}"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Body</label>
              <textarea
                required
                rows={6}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="e.g., Your alert has been triggered! Stock: {stockSymbol} ({companyName}) Current Price: {price}"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                Available variables: {Object.keys(TEMPLATE_VARIABLES).join(', ')}
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface PreviewModalProps {
  subject: string
  body: string
  onClose: () => void
}

function PreviewModal({ subject, body, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Template Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900">
                {subject}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Body</label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 whitespace-pre-wrap">
                {body}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

