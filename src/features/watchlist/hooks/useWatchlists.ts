import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { watchlistService } from '../services/watchlistService'
import { useToast } from '@/shared/hooks/useToast'

export const useWatchlists = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

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
      toast.success('Đã tạo watchlist thành công!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Không thể tạo watchlist')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      watchlistService.updateWatchlist(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      toast.success('Đã cập nhật watchlist thành công!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Không thể cập nhật watchlist')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => watchlistService.deleteWatchlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      toast.success('Đã xóa watchlist thành công!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Không thể xóa watchlist')
    },
  })

  const addStockMutation = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      watchlistService.addStock(watchlistId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      toast.success('Đã thêm cổ phiếu vào watchlist!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Không thể thêm cổ phiếu')
    },
  })

  const removeStockMutation = useMutation({
    mutationFn: ({ watchlistId, symbol }: { watchlistId: string; symbol: string }) =>
      watchlistService.removeStock(watchlistId, symbol),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      toast.success('Đã xóa cổ phiếu khỏi watchlist!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Không thể xóa cổ phiếu')
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
