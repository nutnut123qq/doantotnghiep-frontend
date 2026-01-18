import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { technicalIndicatorService } from '@/features/chart/services/technicalIndicatorService'
import type { StockTicker } from '@/domain/entities/StockTicker'

export interface StockTickerWithIndicators extends StockTicker {
  rsi?: number
  ma20?: number
  ma50?: number
}

/**
 * Hook để extend Trading Board tickers với technical indicators
 * Batch fetch indicators cho tất cả tickers
 */
export const useTradingBoardWithIndicators = (tickers: StockTicker[]) => {
  // Fetch indicators cho tất cả tickers
  const indicatorQueries = useQueries({
    queries: tickers.map((ticker) => ({
      queryKey: ['technical-indicators', ticker.symbol],
      queryFn: () => technicalIndicatorService.getIndicators(ticker.symbol),
      enabled: !!ticker.symbol,
      staleTime: 60000, // Cache 1 phút
      retry: 1, // Chỉ retry 1 lần để tránh spam
    })),
  })

  // Merge indicators vào tickers
  const tickersWithIndicators = useMemo<StockTickerWithIndicators[]>(() => {
    return tickers.map((ticker, index) => {
      const indicatorQuery = indicatorQueries[index]
      const tickerWithIndicators: StockTickerWithIndicators = { ...ticker }

      if (indicatorQuery.data?.indicators) {
        // Group indicators by type
        const indicatorsByType = indicatorQuery.data.indicators.reduce((acc, ind) => {
          acc[ind.indicatorType] = ind
          return acc
        }, {} as Record<string, typeof indicatorQuery.data.indicators[0]>)

        // Extract values
        if (indicatorsByType['RSI']?.value !== undefined) {
          tickerWithIndicators.rsi = Number(indicatorsByType['RSI'].value)
        }
        if (indicatorsByType['MA20']?.value !== undefined) {
          tickerWithIndicators.ma20 = Number(indicatorsByType['MA20'].value)
        }
        if (indicatorsByType['MA50']?.value !== undefined) {
          tickerWithIndicators.ma50 = Number(indicatorsByType['MA50'].value)
        }
      }

      return tickerWithIndicators
    })
  }, [tickers, indicatorQueries])

  const isLoadingIndicators = indicatorQueries.some((q) => q.isLoading)

  return {
    tickers: tickersWithIndicators,
    isLoadingIndicators,
  }
}
