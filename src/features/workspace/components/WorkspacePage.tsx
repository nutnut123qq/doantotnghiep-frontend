import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/shared/components/PageHeader'
import { WorkspaceChat } from './WorkspaceChat'
import { SharedWatchlists } from './SharedWatchlists'
import { SharedLayouts } from './SharedLayouts'
import { MemberManagement } from './MemberManagement'
import { Users, MessageSquare, Star, Layout } from 'lucide-react'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { useWorkspaces, useWorkspace } from '../hooks/useWorkspace'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { EmptyState } from '@/shared/components/EmptyState'

export const WorkspacePage = () => {
  const { user } = useAuthContext()
  const [searchParams] = useSearchParams()
  const workspaceIdParam = searchParams.get('id')
  const [activeTab, setActiveTab] = useState('chat')

  // Load workspaces
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces()
  
  // Determine which workspace to show
  const selectedWorkspaceId = useMemo(() => {
    if (workspaceIdParam) return workspaceIdParam
    if (workspaces && workspaces.length > 0) return workspaces[0].id
    return null
  }, [workspaceIdParam, workspaces])

  // Load selected workspace details
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspace(selectedWorkspaceId)

  const userEmail = user?.email || ''
  const isOwner = workspace?.owner?.email === userEmail
  const isAdmin = useMemo(() => {
    if (isOwner) return true
    if (!workspace?.members) return false
    const member = workspace.members.find((m) => m.user?.email === userEmail)
    return member?.role === 'Admin' || member?.role === 'Owner'
  }, [workspace, userEmail, isOwner])

  if (isLoadingWorkspaces || isLoadingWorkspace) {
    return (
      <div className="p-8">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Users}
          title="No workspace found"
          description={workspaces && workspaces.length === 0 
            ? "You don't have any workspaces yet. Create one to get started!"
            : "Workspace not found or you don't have access to it."}
        />
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title={workspace.name}
          description={workspace.description || "Collaborative workspace for team investment decisions"}
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
              workspace={{
                id: workspace.id,
                name: workspace.name,
                owner: workspace.ownerId,
                members: workspace.members?.map(m => ({
                  id: m.id,
                  name: m.user?.email || 'Unknown',
                  email: m.user?.email || '',
                  role: m.role.toLowerCase() as 'owner' | 'admin' | 'member',
                })) || [],
              }}
              canManage={isAdmin}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
