import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { watchlistService } from '../services/watchlistService'
import { notify } from '@/shared/utils/notify'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'

export const useWatchlists = () => {
  const queryClient = useQueryClient()

  const {
    data: watchlists = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistService.getWatchlists(),
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => watchlistService.createWatchlist(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Watchlist created successfully!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Failed to create watchlist')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      watchlistService.updateWatchlist(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Watchlist updated successfully!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Failed to update watchlist')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => watchlistService.deleteWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Watchlist deleted successfully!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Failed to delete watchlist')
    },
  })

  const addStockMutation = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      watchlistService.addStock(watchlistId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Stock added to watchlist!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Failed to add stock')
    },
  })

  const removeStockMutation = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      watchlistService.removeStock(watchlistId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Stock removed from watchlist!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Failed to remove stock')
    },
  })

  return {
    watchlists,
    isLoading,
    error,
    refetch,
    createWatchlist: createMutation.mutateAsync,
    updateWatchlist: updateMutation.mutateAsync,
    deleteWatchlist: deleteMutation.mutateAsync,
    addStock: addStockMutation.mutateAsync,
    removeStock: removeStockMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAddingStock: addStockMutation.isPending,
    isRemovingStock: removeStockMutation.isPending,
  }
}
