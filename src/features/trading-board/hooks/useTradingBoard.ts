import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tradingBoardService, type TradingBoardFilters } from '../services/tradingBoardService'
import { useSignalR } from '@/shared/hooks/useSignalR'
import type { StockTicker } from '@/domain/entities/StockTicker'
import { normalizeStockTicker } from '@/lib/stockTickerNormalize'

/**
 * Stable key: only changes when the set of symbols changes (e.g. filters/refetch),
 * NOT when ticker prices update. Used for join/leave effect deps to avoid churn.
 */
function useSymbolsKey(data: StockTicker[] | undefined) {
  return useMemo(() => {
    const symbols = (data ?? []).map((t) => t.symbol.toUpperCase())
    return [...new Set(symbols)].sort().join(',')
  }, [data])
}

export const useTradingBoard = (filters?: TradingBoardFilters) => {
  const [tickers, setTickers] = useState<StockTicker[]>([])
  const joinedGroupsRef = useRef<Set<string>>(new Set())

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trading-board', filters],
    queryFn: () => tradingBoardService.getTickers(filters),
    staleTime: 120000,
    gcTime: 300000,
  })

  const { on, invoke, isConnected } = useSignalR('stock-price')
  const symbolsKey = useSymbolsKey(data)

  useEffect(() => {
    if (data) setTickers(data.map((row) => normalizeStockTicker(row)))
  }, [data])

  const handlePriceUpdate = useCallback((updatedTicker: Partial<StockTicker> & { symbol?: string }) => {
    setTickers((prev) =>
      prev.map((t) => {
        const symbolMatch = t.symbol.toLowerCase() === (updatedTicker.symbol ?? '').toLowerCase()
        if (!symbolMatch) return t

        const merged = {
          ...t,
          ...updatedTicker,
          symbol: updatedTicker.symbol || t.symbol,
        }
        return normalizeStockTicker(merged)
      })
    )
  }, [])

  useEffect(() => {
    const unsub = on('PriceUpdated', handlePriceUpdate as (...args: unknown[]) => void)
    return unsub
  }, [on, handlePriceUpdate])

  useEffect(() => {
    if (!isConnected) {
      joinedGroupsRef.current.clear()
      return
    }

    const wanted = new Set(symbolsKey ? symbolsKey.split(',') : [])
    const joined = joinedGroupsRef.current

    for (const symbol of wanted) {
      if (!joined.has(symbol)) {
        joined.add(symbol)
        invoke('JoinTickerGroup', symbol).catch((err) => {
          console.error('JoinTickerGroup failed:', symbol, err)
          joined.delete(symbol)
        })
      }
    }

    const toLeave: string[] = []
    for (const s of joined) {
      if (!wanted.has(s)) toLeave.push(s)
    }
    for (const symbol of toLeave) {
      joined.delete(symbol)
      invoke('LeaveTickerGroup', symbol).catch(() => {})
    }
  }, [isConnected, symbolsKey, invoke])

  useEffect(() => {
    return () => {
      for (const symbol of joinedGroupsRef.current) {
        invoke('LeaveTickerGroup', symbol).catch(() => {})
      }
      joinedGroupsRef.current.clear()
    }
  }, [invoke])

  return {
    tickers,
    isLoading,
    error,
    refetch,
  }
}

