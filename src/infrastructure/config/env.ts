const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const viteApiUrl = import.meta.env.VITE_API_URL
const viteSignalRUrl = import.meta.env.VITE_SIGNALR_URL
const nextPublicApiBaseUrl = import.meta.env.NEXT_PUBLIC_API_BASE_URL

const apiBaseUrlFromNextPublic = nextPublicApiBaseUrl
  ? `${trimTrailingSlash(nextPublicApiBaseUrl)}/api`
  : undefined

const signalRUrlFromNextPublic = nextPublicApiBaseUrl
  ? `${trimTrailingSlash(nextPublicApiBaseUrl)}/hubs`
  : undefined

export const config = {
  apiUrl: viteApiUrl || apiBaseUrlFromNextPublic || 'http://localhost:5000/api',
  signalRUrl: viteSignalRUrl || signalRUrlFromNextPublic || 'http://localhost:5000/hubs',
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

