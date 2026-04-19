import { useEffect, useState } from 'react'

/**
 * Return ``value`` after it has been stable for ``delayMs``. Useful to avoid
 * firing heavy queries while the user is rapidly switching a filter / symbol.
 */
export function useDebouncedValue<T>(value: T, delayMs = 500): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(handle)
  }, [value, delayMs])

  return debounced
}
