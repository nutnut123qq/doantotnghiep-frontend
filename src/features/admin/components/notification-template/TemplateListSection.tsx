import { Eye, Pencil, Trash2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/shared/components/EmptyState'
import type { NotificationTemplate } from '@/shared/types/notificationTemplateTypes'
import {
  NotificationEventType,
  NOTIFICATION_EVENT_TYPE_LABELS,
} from '@/shared/types/notificationTemplateTypes'

interface TemplateListSectionProps {
  groupedTemplates: Partial<Record<NotificationEventType, NotificationTemplate[]>>
  onPreview: (template: NotificationTemplate) => void
  onEdit: (template: NotificationTemplate) => void
  onDelete: (templateId: string) => void
}

export function TemplateListSection({
  groupedTemplates,
  onPreview,
  onEdit,
  onDelete,
}: TemplateListSectionProps) {
  return (
    <>
      {Object.entries(groupedTemplates).map(([eventType, eventTemplates]) => {
        const templates = eventTemplates ?? []
        return (
          <Card key={eventType} className="bg-[hsl(var(--surface-1))]">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">
                {NOTIFICATION_EVENT_TYPE_LABELS[Number(eventType) as NotificationEventType]} Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No templates configured"
                  description="Create a template to get started"
                />
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
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
                            onClick={() => onPreview(template)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(template)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(template.id)}
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
        )
      })}
    </>
  )
}
