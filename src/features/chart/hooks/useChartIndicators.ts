import { useQuery } from '@tanstack/react-query'
import { technicalIndicatorService, type TechnicalIndicator } from '../services/technicalIndicatorService'

export interface ChartIndicators {
  ma20?: number
  ma50?: number
  rsi?: number
  macd?: {
    line: number
    signal: number
    histogram: number
  }
  isLoading: boolean
  error: Error | null
}

/**
 * Hook để fetch và transform technical indicators cho chart
 * Backend trả về current values, không phải time series
 * Để overlay lên chart, cần tính từ OHLCV data (sẽ implement sau)
 */
export const useChartIndicators = (symbol: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['technical-indicators', symbol],
    queryFn: () => technicalIndicatorService.getIndicators(symbol),
    enabled: !!symbol,
    staleTime: 60000, // Cache 1 phút
  })

  // Transform backend response sang format dễ sử dụng
  const indicators: ChartIndicators = {
    isLoading,
    error: error as Error | null,
  }

  if (data?.indicators) {
    // Group indicators by type
    const indicatorsByType = data.indicators.reduce((acc, ind) => {
      acc[ind.indicatorType] = ind
      return acc
    }, {} as Record<string, TechnicalIndicator>)

    // Extract values
    if (indicatorsByType['MA20']?.value !== undefined) {
      indicators.ma20 = Number(indicatorsByType['MA20'].value)
    }
    if (indicatorsByType['MA50']?.value !== undefined) {
      indicators.ma50 = Number(indicatorsByType['MA50'].value)
    }
    if (indicatorsByType['RSI']?.value !== undefined) {
      indicators.rsi = Number(indicatorsByType['RSI'].value)
    }
    if (indicatorsByType['MACD']?.value !== undefined) {
      // MACD từ backend chỉ có single value (MACD line)
      // Signal và Histogram cần tính từ MACDResult (sẽ cần API riêng hoặc tính từ OHLCV)
      indicators.macd = {
        line: Number(indicatorsByType['MACD'].value),
        signal: 0, // TODO: Fetch từ backend hoặc tính từ OHLCV
        histogram: 0, // TODO: Fetch từ backend hoặc tính từ OHLCV
      }
    }
  }

  return indicators
}
