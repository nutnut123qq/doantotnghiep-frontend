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
 * Optimized: Limit concurrent requests and only fetch for visible tickers
 */
export const useTradingBoardWithIndicators = (tickers: StockTicker[], maxConcurrent = 10) => {
  // Limit the number of tickers to fetch indicators for (to avoid N+1 overload)
  // Only fetch for first N tickers or all if less than maxConcurrent
  const tickersToProcess = useMemo(() => {
    return tickers.slice(0, Math.min(tickers.length, maxConcurrent))
  }, [tickers, maxConcurrent])

  // Fetch indicators cho limited tickers
  const indicatorQueries = useQueries({
    queries: tickersToProcess.map((ticker) => ({
      queryKey: ['technical-indicators', ticker.symbol],
      queryFn: () => technicalIndicatorService.getIndicators(ticker.symbol),
      enabled: !!ticker.symbol,
      staleTime: 60000, // Cache 1 phút
      retry: 1, // Chỉ retry 1 lần để tránh spam
    })),
  })

  // Merge indicators vào tickers
  const tickersWithIndicators = useMemo<StockTickerWithIndicators[]>(() => {
    // Create a map of symbol to indicators for quick lookup
    const indicatorsMap = new Map<string, typeof indicatorQueries[0]['data']>()
    tickersToProcess.forEach((ticker, index) => {
      if (indicatorQueries[index]?.data) {
        indicatorsMap.set(ticker.symbol.toUpperCase(), indicatorQueries[index].data)
      }
    })

    return tickers.map((ticker) => {
      const tickerWithIndicators: StockTickerWithIndicators = { ...ticker }
      const indicatorData = indicatorsMap.get(ticker.symbol.toUpperCase())

      if (indicatorData?.indicators) {
        // Group indicators by type
        const indicatorsByType = indicatorData.indicators.reduce((acc, ind) => {
          acc[ind.indicatorType] = ind
          return acc
        }, {} as Record<string, typeof indicatorData.indicators[0]>)

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
  }, [tickers, tickersToProcess, indicatorQueries])

  const isLoadingIndicators = indicatorQueries.some((q) => q.isLoading)

  return {
    tickers: tickersWithIndicators,
    isLoadingIndicators,
  }
}
