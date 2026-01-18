import { useEffect, useRef } from 'react'
import { useSignalR } from '@/shared/hooks/useSignalR'

export interface WorkspaceMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
}

export const useWorkspaceRealtime = (
  workspaceId: string | null,
  onMessage?: (message: WorkspaceMessage) => void,
  onWatchlistUpdate?: (watchlistId: string) => void,
  onLayoutUpdate?: (layoutId: string) => void,
  onMemberJoined?: (member: any) => void
) => {
  // Use 'workspace' hub name - backend maps to /hubs/workspace
  const { invoke, on, isConnected } = useSignalR('workspace')
  const hasJoinedRef = useRef(false)

  // Join workspace group when connected
  useEffect(() => {
    if (isConnected && workspaceId && !hasJoinedRef.current) {
      invoke('JoinWorkspace', workspaceId)
        .then(() => {
          hasJoinedRef.current = true
        })
        .catch((err) => {
          console.error('Error joining workspace:', err)
        })
    }

    return () => {
      if (hasJoinedRef.current && workspaceId) {
        invoke('LeaveWorkspace', workspaceId).catch(console.error)
        hasJoinedRef.current = false
      }
    }
  }, [isConnected, workspaceId, invoke])

  // Listen for messages
  useEffect(() => {
    if (!onMessage) return

    const handleMessage = (message: WorkspaceMessage) => {
      onMessage(message)
    }

    on('ReceiveMessage', handleMessage)

    return () => {
      // Cleanup handled by useSignalR
    }
  }, [on, onMessage])

  // Listen for watchlist updates
  useEffect(() => {
    if (!onWatchlistUpdate) return

    const handleWatchlistUpdate = (data: { watchlistId: string }) => {
      onWatchlistUpdate(data.watchlistId)
    }

    on('WatchlistUpdated', handleWatchlistUpdate)

    return () => {
      // Cleanup handled by useSignalR
    }
  }, [on, onWatchlistUpdate])

  // Listen for layout updates
  useEffect(() => {
    if (!onLayoutUpdate) return

    const handleLayoutUpdate = (data: { layoutId: string }) => {
      onLayoutUpdate(data.layoutId)
    }

    on('LayoutUpdated', handleLayoutUpdate)

    return () => {
      // Cleanup handled by useSignalR
    }
  }, [on, onLayoutUpdate])

  // Listen for member joined
  useEffect(() => {
    if (!onMemberJoined) return

    const handleMemberJoined = (member: any) => {
      onMemberJoined(member)
    }

    on('MemberJoined', handleMemberJoined)

    return () => {
      // Cleanup handled by useSignalR
    }
  }, [on, onMemberJoined])

  const sendMessage = async (content: string) => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    await invoke('SendMessage', workspaceId, content)
  }

  return {
    sendMessage,
    isConnected,
  }
}
