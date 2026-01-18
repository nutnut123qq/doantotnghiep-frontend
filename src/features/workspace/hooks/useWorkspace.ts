import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceService, type Workspace, type CreateWorkspaceRequest, type UpdateWorkspaceRequest } from '../services/workspaceService'

/**
 * Hook to get all workspaces for current user
 */
export const useWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceService.getWorkspaces(),
  })
}

/**
 * Hook to get workspace by ID
 */
export const useWorkspace = (id: string | null) => {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => workspaceService.getWorkspaceById(id!),
    enabled: !!id,
  })
}

/**
 * Hook to create workspace
 */
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => workspaceService.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}

/**
 * Hook to update workspace
 */
export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceRequest }) =>
      workspaceService.updateWorkspace(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['workspace', variables.id] })
    },
  })
}

/**
 * Hook to delete workspace
 */
export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => workspaceService.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}
