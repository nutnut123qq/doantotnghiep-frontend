import { useEffect, useState } from 'react'
import { forecastBusy } from './forecastBusy'

/**
 * Reactive readout of {@link forecastBusy} for a single symbol.
 *
 * Returns ``true`` while an AIForecast poll is in flight for ``symbol``, so
 * neighbour widgets (AI Insights panel, batch forecasts, ...) can defer their
 * own LLM calls and avoid piling on the shared HTTP timeout budget.
 */
export function useForecastBusy(symbol: string): boolean {
  const [busy, setBusy] = useState<boolean>(() => forecastBusy.isBusy(symbol))

  useEffect(() => {
    setBusy(forecastBusy.isBusy(symbol))
    const unsubscribe = forecastBusy.subscribe((changedSymbol) => {
      if (changedSymbol === (symbol || '').toUpperCase()) {
        setBusy(forecastBusy.isBusy(symbol))
      }
    })
    return unsubscribe
  }, [symbol])

  return busy
}
