import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import { ThemeProvider } from '@/shared/contexts/ThemeContext'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import App from './app/App'
import { store } from './app/store/store'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <App />
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </QueryClientProvider>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
