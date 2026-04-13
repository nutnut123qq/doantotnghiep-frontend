import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertService } from '../services/alertService'
import { useToast } from '@/shared/hooks/useToast'
import type { CreateAlertRequest } from '../types/alert.types'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'

export const useAlerts = (isActive?: boolean) => {
  const queryClient = useQueryClient()
  const toast = useToast()

  const {
    data: alerts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['alerts', isActive],
    queryFn: () => alertService.getAlerts(isActive),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateAlertRequest) => alertService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert created successfully!')
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error) || 'Failed to create alert')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAlertRequest> }) =>
      alertService.updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert updated successfully!')
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error) || 'Failed to update alert')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alertService.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alert deleted successfully!')
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error) || 'Failed to delete alert')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      alertService.toggleAlert(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: (error: unknown) => {
      toast.error(getAxiosErrorMessage(error) || 'Failed to toggle alert')
    },
  })

  return {
    alerts,
    isLoading,
    error,
    refetch,
    createAlert: createMutation.mutateAsync,
    updateAlert: updateMutation.mutateAsync,
    deleteAlert: deleteMutation.mutateAsync,
    toggleAlert: toggleMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
