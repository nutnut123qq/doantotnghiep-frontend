import { apiClient } from '@/infrastructure/api/apiClient'

export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
  owner?: {
    id: string
    email: string
  }
  members?: WorkspaceMember[]
  watchlists?: Array<{
    id: string
    watchlist: {
      id: string
      name: string
      tickers: Array<{ symbol: string; name: string }>
    }
  }>
  layouts?: Array<{
    id: string
    layout: {
      id: string
      name: string
      configuration: string
    }
  }>
  messages?: WorkspaceMessage[]
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'Owner' | 'Admin' | 'Member'
  joinedAt: string
  user?: {
    id: string
    email: string
  }
}

export interface WorkspaceMessage {
  id: string
  workspaceId: string
  userId: string
  content: string
  createdAt: string
  user?: {
    id: string
    email: string
  }
}

export interface CreateWorkspaceRequest {
  name: string
  description?: string
}

export interface UpdateWorkspaceRequest {
  name: string
  description?: string
}

export interface AddMemberRequest {
  userId: string
  role?: 'Owner' | 'Admin' | 'Member'
}

export interface UpdateMemberRoleRequest {
  role: 'Owner' | 'Admin' | 'Member'
}

export const workspaceService = {
  /**
   * Get all workspaces for current user
   */
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await apiClient.get<Workspace[]>('/api/Workspace')
    return response.data
  },

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(id: string): Promise<Workspace> {
    const response = await apiClient.get<Workspace>(`/api/Workspace/${id}`)
    return response.data
  },

  /**
   * Create a new workspace
   */
  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await apiClient.post<Workspace>('/api/Workspace', data)
    return response.data
  },

  /**
   * Update workspace
   */
  async updateWorkspace(id: string, data: UpdateWorkspaceRequest): Promise<Workspace> {
    const response = await apiClient.put<Workspace>(`/api/Workspace/${id}`, data)
    return response.data
  },

  /**
   * Delete workspace
   */
  async deleteWorkspace(id: string): Promise<void> {
    await apiClient.delete(`/api/Workspace/${id}`)
  },

  /**
   * Add member to workspace
   */
  async addMember(workspaceId: string, data: AddMemberRequest): Promise<WorkspaceMember> {
    const response = await apiClient.post<WorkspaceMember>(
      `/api/Workspace/${workspaceId}/members`,
      data
    )
    return response.data
  },

  /**
   * Remove member from workspace
   */
  async removeMember(workspaceId: string, memberUserId: string): Promise<void> {
    await apiClient.delete(`/api/Workspace/${workspaceId}/members/${memberUserId}`)
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    workspaceId: string,
    memberUserId: string,
    role: 'Owner' | 'Admin' | 'Member'
  ): Promise<void> {
    await apiClient.put(`/api/Workspace/${workspaceId}/members/${memberUserId}/role`, { role })
  },

  /**
   * Get shared watchlists in workspace
   */
  async getSharedWatchlists(workspaceId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/api/Workspace/${workspaceId}/watchlists`)
    return response.data
  },

  /**
   * Add watchlist to workspace
   */
  async addWatchlist(workspaceId: string, watchlistId: string): Promise<void> {
    await apiClient.post(`/api/Workspace/${workspaceId}/watchlists`, { watchlistId })
  },

  /**
   * Remove watchlist from workspace
   */
  async removeWatchlist(workspaceId: string, watchlistId: string): Promise<void> {
    await apiClient.delete(`/api/Workspace/${workspaceId}/watchlists/${watchlistId}`)
  },

  /**
   * Get shared layouts in workspace
   */
  async getSharedLayouts(workspaceId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/api/Workspace/${workspaceId}/layouts`)
    return response.data
  },

  /**
   * Add layout to workspace
   */
  async addLayout(workspaceId: string, layoutId: string): Promise<void> {
    await apiClient.post(`/api/Workspace/${workspaceId}/layouts`, { layoutId })
  },

  /**
   * Remove layout from workspace
   */
  async removeLayout(workspaceId: string, layoutId: string): Promise<void> {
    await apiClient.delete(`/api/Workspace/${workspaceId}/layouts/${layoutId}`)
  },

  /**
   * Get messages in workspace
   */
  async getMessages(workspaceId: string, limit: number = 50): Promise<WorkspaceMessage[]> {
    const response = await apiClient.get<WorkspaceMessage[]>(
      `/api/Workspace/${workspaceId}/messages?limit=${limit}`
    )
    return response.data
  },

  /**
   * Send message to workspace
   */
  async sendMessage(workspaceId: string, content: string): Promise<WorkspaceMessage> {
    const response = await apiClient.post<WorkspaceMessage>(
      `/api/Workspace/${workspaceId}/messages`,
      { content }
    )
    return response.data
  },
}
