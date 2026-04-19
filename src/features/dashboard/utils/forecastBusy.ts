/**
 * Tiny in-memory signal that indicates when an AIForecast poll is running for
 * a given symbol. Other widgets (e.g. AIInsights) can subscribe and defer
 * their own LLM calls while the forecast is busy.
 *
 * Deliberately framework-free: no React state involved. Consumers use a
 * subscribe/unsubscribe loop and the latest value.
 */

type Listener = (symbol: string, busy: boolean) => void

const busySymbols = new Set<string>()
const listeners = new Set<Listener>()

function notify(symbol: string, busy: boolean) {
  listeners.forEach((cb) => {
    try {
      cb(symbol, busy)
    } catch {
      /* listeners must never throw back into the emitter */
    }
  })
}

export const forecastBusy = {
  /** Mark a symbol as "forecast running" (reference-counted per symbol). */
  acquire(symbol: string) {
    const key = (symbol || '').toUpperCase()
    if (!key) return
    if (!busySymbols.has(key)) {
      busySymbols.add(key)
      notify(key, true)
    }
  },

  /** Clear the busy flag for a symbol. Safe to call multiple times. */
  release(symbol: string) {
    const key = (symbol || '').toUpperCase()
    if (!key) return
    if (busySymbols.delete(key)) {
      notify(key, false)
    }
  },

  /** True when the given symbol currently has a forecast job in flight. */
  isBusy(symbol: string) {
    return busySymbols.has((symbol || '').toUpperCase())
  },

  /** Subscribe to busy-state changes. Returns an unsubscribe function. */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
