import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { notificationTemplateService } from '../../services/notificationTemplateService'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import type { PushNotificationConfig } from '@/shared/types/notificationTemplateTypes'

interface PushConfigSectionProps {
  config: PushNotificationConfig | null
  onSaved: () => Promise<void> | void
}

export function PushConfigSection({ config, onSaved }: PushConfigSectionProps) {
  const [formData, setFormData] = useState({
    serviceName: config?.serviceName || 'Firebase',
    serverKey: config?.serverKey || '',
    appId: config?.appId || '',
    isEnabled: config?.isEnabled ?? false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [testDeviceToken, setTestDeviceToken] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    setFormData({
      serviceName: config?.serviceName || 'Firebase',
      serverKey: config?.serverKey || '',
      appId: config?.appId || '',
      isEnabled: config?.isEnabled ?? false,
    })
  }, [config])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await notificationTemplateService.updatePushConfig({
        ...formData,
        id: config?.id,
      })
      toast.success('Push notification configuration saved successfully')
      await onSaved()
    } catch (error: unknown) {
      toast.error(getAxiosErrorMessage(error) || 'Failed to save configuration')
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
    } catch (error: unknown) {
      toast.error(getAxiosErrorMessage(error) || 'Failed to send test notification')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">Push Notification Configuration</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
