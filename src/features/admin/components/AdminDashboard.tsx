import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/shared/components/PageHeader'
import { SystemStats } from './SystemStats'
import { SystemHealthMonitor } from './SystemHealthMonitor'
import { UserManagement } from './UserManagement'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import { DataSourceManagement } from './DataSourceManagement'
import { AIModelConfiguration } from './AIModelConfiguration'
import { NotificationTemplateManagement } from './NotificationTemplateManagement'
import { BarChart3, Heart, TrendingUp, Users, Settings, Cpu, Bell } from 'lucide-react'

type TabType = 'stats' | 'health' | 'analytics' | 'users' | 'content' | 'ai-config' | 'notifications'

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('stats')

  const tabs = [
    { id: 'stats' as TabType, label: 'System Stats', icon: BarChart3 },
    { id: 'health' as TabType, label: 'System Health', icon: Heart },
    { id: 'analytics' as TabType, label: 'Analytics', icon: TrendingUp },
    { id: 'users' as TabType, label: 'User Management', icon: Users },
    { id: 'content' as TabType, label: 'Content Configuration', icon: Settings },
    { id: 'ai-config' as TabType, label: 'AI Configuration', icon: Cpu },
    { id: 'notifications' as TabType, label: 'Notification Templates', icon: Bell },
  ]

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Admin Dashboard"
          description="System monitoring and management"
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="stats" className="mt-6">
            <SystemStats />
          </TabsContent>
          <TabsContent value="health" className="mt-6">
            <SystemHealthMonitor />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          <TabsContent value="content" className="mt-6">
            <DataSourceManagement />
          </TabsContent>
          <TabsContent value="ai-config" className="mt-6">
            <AIModelConfiguration />
          </TabsContent>
          <TabsContent value="notifications" className="mt-6">
            <NotificationTemplateManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
