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
      notify.success('Đã tạo watchlist thành công!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Không thể tạo watchlist')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      watchlistService.updateWatchlist(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Đã cập nhật watchlist thành công!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Không thể cập nhật watchlist')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => watchlistService.deleteWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Đã xóa watchlist thành công!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Không thể xóa watchlist')
    },
  })

  const addStockMutation = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      watchlistService.addStock(watchlistId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Đã thêm cổ phiếu vào watchlist!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Không thể thêm cổ phiếu')
    },
  })

  const removeStockMutation = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      watchlistService.removeStock(watchlistId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      notify.success('Đã xóa cổ phiếu khỏi watchlist!')
    },
    onError: (error: unknown) => {
      notify.error(getAxiosErrorMessage(error) || 'Không thể xóa cổ phiếu')
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
