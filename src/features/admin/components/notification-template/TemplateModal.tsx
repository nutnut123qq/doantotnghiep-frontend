import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { notificationTemplateService } from '../../services/notificationTemplateService'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import type { NotificationTemplate } from '@/shared/types/notificationTemplateTypes'
import {
  NotificationEventType,
  NOTIFICATION_EVENT_TYPE_LABELS,
  TEMPLATE_VARIABLES,
} from '@/shared/types/notificationTemplateTypes'
import { useState } from 'react'

interface TemplateModalProps {
  template: NotificationTemplate | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export function TemplateModal({ template, onSaved, onClose }: TemplateModalProps) {
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
      await onSaved()
    } catch (error: unknown) {
      toast.error(getAxiosErrorMessage(error) || 'Failed to save template')
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
