export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  signalRUrl: import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5000/hubs',
}

// Dev-only: Warn if apiUrl looks incorrect
if (import.meta.env.DEV) {
  const url = config.apiUrl
  const trimmed = url.replace(/\/+$/, '') // remove trailing slashes
  if (trimmed.match(/:\d+$/) && !trimmed.endsWith('/api')) {
    console.warn(
      '[Config Warning] apiUrl ends with port but has no /api suffix.',
      '\nCurrent:', url,
      '\nExpected:', trimmed + '/api',
      '\nBackend routes are prefixed with /api. Requests may return 404.'
    )
  }
}

