import { useEffect, useRef, useCallback } from 'react'
import { useSignalR } from '@/shared/hooks/useSignalR'

export interface WorkspaceMessage {
  id: string
  userId: string
  userName: string
  content: string
  timestamp: string
}

export interface WorkspaceMemberDto {
  userId?: string
  userName?: string
  email?: string
  [key: string]: unknown
}

export const useWorkspaceRealtime = (
  workspaceId: string | null,
  onMessage?: (message: WorkspaceMessage) => void,
  onWatchlistUpdate?: (watchlistId: string) => void,
  onLayoutUpdate?: (layoutId: string) => void,
  onMemberJoined?: (member: WorkspaceMemberDto) => void
) => {
  const { invoke, on, isConnected } = useSignalR('workspace')
  const hasJoinedRef = useRef(false)
  const lastWorkspaceIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isConnected || !workspaceId) {
      if (!isConnected) {
        hasJoinedRef.current = false
        lastWorkspaceIdRef.current = null
      }
      return
    }

    if (hasJoinedRef.current && lastWorkspaceIdRef.current === workspaceId) return
    if (hasJoinedRef.current && lastWorkspaceIdRef.current !== workspaceId) {
      invoke('LeaveWorkspace', lastWorkspaceIdRef.current!).catch(console.error)
      hasJoinedRef.current = false
    }

    lastWorkspaceIdRef.current = workspaceId
    invoke('JoinWorkspace', workspaceId)
      .then(() => {
        hasJoinedRef.current = true
      })
      .catch((err) => {
        console.error('Error joining workspace:', err)
        lastWorkspaceIdRef.current = null
      })

    return () => {
      if (hasJoinedRef.current && lastWorkspaceIdRef.current) {
        invoke('LeaveWorkspace', lastWorkspaceIdRef.current).catch(console.error)
        hasJoinedRef.current = false
        lastWorkspaceIdRef.current = null
      }
    }
  }, [isConnected, workspaceId, invoke])

  const handleMessage = useCallback(
    (message: WorkspaceMessage) => onMessage?.(message),
    [onMessage]
  )
  const handleWatchlist = useCallback(
    (data: { watchlistId: string }) => onWatchlistUpdate?.(data.watchlistId),
    [onWatchlistUpdate]
  )
  const handleLayout = useCallback(
    (data: { layoutId: string }) => onLayoutUpdate?.(data.layoutId),
    [onLayoutUpdate]
  )
  const handleMember = useCallback(
    (member: WorkspaceMemberDto) => onMemberJoined?.(member),
    [onMemberJoined]
  )

  useEffect(() => {
    if (!onMessage) return
    const unsub = on('ReceiveMessage', handleMessage as (...args: unknown[]) => void)
    return unsub
  }, [on, onMessage, handleMessage])

  useEffect(() => {
    if (!onWatchlistUpdate) return
    const unsub = on('WatchlistUpdated', handleWatchlist as (...args: unknown[]) => void)
    return unsub
  }, [on, onWatchlistUpdate, handleWatchlist])

  useEffect(() => {
    if (!onLayoutUpdate) return
    const unsub = on('LayoutUpdated', handleLayout as (...args: unknown[]) => void)
    return unsub
  }, [on, onLayoutUpdate, handleLayout])

  useEffect(() => {
    if (!onMemberJoined) return
    const unsub = on('MemberJoined', handleMember as (...args: unknown[]) => void)
    return unsub
  }, [on, onMemberJoined, handleMember])

  const sendMessage = async (content: string) => {
    if (!workspaceId) throw new Error('Workspace ID is required')
    await invoke('SendMessage', workspaceId, content)
  }

  return {
    sendMessage,
    isConnected,
  }
}
