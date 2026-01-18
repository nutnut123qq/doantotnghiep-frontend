import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceService, type AddMemberRequest } from '../services/workspaceService'

export const useAddMember = (workspaceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddMemberRequest) => workspaceService.addMember(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    },
  })
}

export const useRemoveMember = (workspaceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberUserId: string) => workspaceService.removeMember(workspaceId, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    },
  })
}

export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberUserId, role }: { memberUserId: string; role: 'Owner' | 'Admin' | 'Member' }) =>
      workspaceService.updateMemberRole(workspaceId, memberUserId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    },
  })
}
