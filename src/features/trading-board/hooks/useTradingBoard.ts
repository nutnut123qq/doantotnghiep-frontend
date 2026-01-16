import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tradingBoardService, type TradingBoardFilters } from '../services/tradingBoardService'
import { useSignalR } from '@/shared/hooks/useSignalR'
import type { StockTicker } from '@/domain/entities/StockTicker'

export const useTradingBoard = (filters?: TradingBoardFilters) => {
  const [tickers, setTickers] = useState<StockTicker[]>([])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trading-board', filters],
    queryFn: () => tradingBoardService.getTickers(filters),
  })

  const { on, invoke, isConnected } = useSignalR('stock-price')

  useEffect(() => {
    if (data) {
      setTickers(data)
    }
  }, [data])

  // Join ticker groups when connection is established and tickers are loaded
  useEffect(() => {
    if (isConnected && tickers.length > 0) {
      tickers.forEach((ticker) => {
        invoke('JoinTickerGroup', ticker.symbol)
      })
    }
  }, [isConnected, tickers, invoke])

  useEffect(() => {
    // Listen for price updates
    const handlePriceUpdate = (updatedTicker: StockTicker) => {
      setTickers((prev) =>
        prev.map((ticker) => (ticker.id === updatedTicker.id ? updatedTicker : ticker))
      )
    }

    on('PriceUpdated', handlePriceUpdate)

    return () => {
      // Cleanup when component unmounts
    }
  }, [on])

  return {
    tickers,
    isLoading,
    error,
    refetch,
  }
}

