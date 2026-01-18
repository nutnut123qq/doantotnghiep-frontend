import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/shared/components/PageHeader'
import { WorkspaceChat } from './WorkspaceChat'
import { SharedWatchlists } from './SharedWatchlists'
import { SharedLayouts } from './SharedLayouts'
import { MemberManagement } from './MemberManagement'
import { Users, MessageSquare, Star, Layout } from 'lucide-react'
import { useAuthContext } from '@/shared/contexts/useAuthContext'

export const WorkspacePage = () => {
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState('chat')

  // Mock workspace data
  const userEmail = user?.email || ''
  const workspace = {
    id: '1',
    name: 'Investment Team Alpha',
    owner: userEmail,
    members: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner' as const },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'admin' as const },
      { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'member' as const },
    ],
  }

  const isOwner = workspace.owner === userEmail
  const isAdmin = workspace.members.find((m) => m.email === userEmail)?.role === 'admin' || isOwner

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title={workspace.name}
          description="Collaborative workspace for team investment decisions"
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="watchlists" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Watchlists</span>
            </TabsTrigger>
            <TabsTrigger value="layouts" className="flex items-center space-x-2">
              <Layout className="h-4 w-4" />
              <span>Layouts</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <WorkspaceChat workspaceId={workspace.id} />
          </TabsContent>

          <TabsContent value="watchlists" className="mt-6">
            <SharedWatchlists workspaceId={workspace.id} canEdit={isAdmin} />
          </TabsContent>

          <TabsContent value="layouts" className="mt-6">
            <SharedLayouts workspaceId={workspace.id} canEdit={isAdmin} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MemberManagement
              workspace={workspace}
              canManage={isAdmin}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
