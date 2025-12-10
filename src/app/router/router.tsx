import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { Layout } from '@/shared/components/Layout'
import { Dashboard } from '@/features/dashboard/components/Dashboard'
import { TradingBoard } from '@/features/trading-board/components/TradingBoard'
import { Portfolio } from '@/features/portfolio/components/Portfolio'
import { Watchlist } from '@/features/watchlist/components/Watchlist'
import { AIInsights } from '@/features/ai-insights/components/AIInsights'
import { Settings } from '@/features/settings/components/Settings'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: 'trading-board',
          element: <TradingBoard />,
        },
        {
          path: 'portfolio',
          element: <Portfolio />,
        },
        {
          path: 'watchlist',
          element: <Watchlist />,
        },
        {
          path: 'ai-insights',
          element: <AIInsights />,
        },
        {
          path: 'settings',
          element: <Settings />,
        },
      ],
    },
    {
      path: '/login',
      element: <LoginForm />,
    },
    {
      path: '/register',
      element: <RegisterForm />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
)

