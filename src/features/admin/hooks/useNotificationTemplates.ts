import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { notificationTemplateService } from '../services/notificationTemplateService'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import type { NotificationTemplate } from '@/shared/types/notificationTemplateTypes'
import { NotificationEventType } from '@/shared/types/notificationTemplateTypes'

export const useNotificationTemplates = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const loadedTemplates = await notificationTemplateService.getAll()
      setTemplates(loadedTemplates)
    } catch (error: unknown) {
      toast.error(getAxiosErrorMessage(error) || 'Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  const removeTemplate = async (id: string) => {
    await notificationTemplateService.delete(id)
    toast.success('Template deleted successfully')
    await loadTemplates()
  }

  const previewTemplate = async (templateId: string) => {
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

    return notificationTemplateService.previewTemplate(templateId, sampleData)
  }

  const groupedTemplates = useMemo(() => {
    return templates.reduce(
      (acc, template) => {
        const group = acc[template.eventType] ?? []
        group.push(template)
        acc[template.eventType] = group
        return acc
      },
      {} as Partial<Record<NotificationEventType, NotificationTemplate[]>>
    )
  }, [templates])

  return {
    templates,
    groupedTemplates,
    isLoading,
    loadTemplates,
    removeTemplate,
    previewTemplate,
  }
}
