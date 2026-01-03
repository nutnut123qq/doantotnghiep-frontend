import { useQuery } from '@tanstack/react-query'
import { stockDataService, StockSymbol } from '../services/stockDataService'

export const useSymbols = (exchange?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stock-symbols', exchange],
    queryFn: () => stockDataService.getSymbols(exchange),
    staleTime: 60 * 60 * 1000, // 1 hour - symbols don't change frequently
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
  })

  return {
    symbols: data || [],
    isLoading,
    error,
  }
}

