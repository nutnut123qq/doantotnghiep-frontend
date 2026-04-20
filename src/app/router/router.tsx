import { createBrowserRouter, Navigate, useSearchParams } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { RoleProtectedRoute } from '@/shared/components/RoleProtectedRoute'
import { Layout } from '@/shared/components/Layout'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { VerifyEmailPage } from '@/features/auth/components/VerifyEmailPage'
import { CheckEmailPage } from '@/features/auth/components/CheckEmailPage'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'
import { LoadingFallback } from '@/shared/components/LoadingFallback'

// Lazy load heavy components for code splitting
const Dashboard = lazy(() => import('@/features/dashboard/components/Dashboard').then(m => ({ default: m.Dashboard })))
const TradingBoard = lazy(() => import('@/features/trading-board/components/TradingBoard').then(m => ({ default: m.TradingBoard })))
const Portfolio = lazy(() => import('@/features/portfolio/components/Portfolio').then(m => ({ default: m.Portfolio })))
const Watchlist = lazy(() => import('@/features/watchlist/components/Watchlist').then(m => ({ default: m.Watchlist })))
const AIInsights = lazy(() => import('@/features/ai-insights/components/AIInsights').then(m => ({ default: m.AIInsights })))
const EventsFeed = lazy(() => import('@/features/events/components/EventsFeed'))
const AdminLayout = lazy(() => import('@/features/admin/components/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('@/features/admin/components/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const UserManagement = lazy(() => import('@/features/admin/components/UserManagement').then(m => ({ default: m.UserManagement })))
const NewsManagement = lazy(() => import('@/features/admin/components/NewsManagement').then(m => ({ default: m.NewsManagement })))
const FinanceManagement = lazy(() => import('@/features/admin/components/FinanceManagement').then(m => ({ default: m.FinanceManagement })))
const EventsManagement = lazy(() => import('@/features/admin/components/EventsManagement').then(m => ({ default: m.EventsManagement })))
const AIInsightsManagement = lazy(() => import('@/features/admin/components/AIInsightsManagement').then(m => ({ default: m.AIInsightsManagement })))
const Settings = lazy(() => import('@/features/settings/components/Settings').then(m => ({ default: m.Settings })))
const AlertList = lazy(() => import('@/features/alerts/components/AlertList').then(m => ({ default: m.AlertList })))

/** Old `/chart?symbol=` URLs redirect to dashboard with the same symbol. */
function ChartLegacyRedirect() {
  const [searchParams] = useSearchParams()
  const raw = searchParams.get('symbol')
  const symbol = raw?.trim()
  if (symbol) {
    return <Navigate to={`/?symbol=${encodeURIComponent(symbol.toUpperCase())}`} replace />
  }
  return <Navigate to="/" replace />
}

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
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          ),
        },
        {
          path: 'trading-board',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <TradingBoard />
            </Suspense>
          ),
        },
        {
          path: 'portfolio',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Portfolio />
            </Suspense>
          ),
        },
        {
          path: 'watchlist',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Watchlist />
            </Suspense>
          ),
        },
        {
          path: 'ai-insights',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <AIInsights />
            </Suspense>
          ),
        },
        {
          path: 'events',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <EventsFeed />
            </Suspense>
          ),
        },
        {
          path: 'events/calendar',
          element: <Navigate to="/events" replace />,
        },
        {
          path: 'admin',
          element: (
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <Suspense fallback={<LoadingFallback />}>
                <AdminLayout />
              </Suspense>
            </RoleProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={<LoadingFallback />}>
                  <AdminDashboard />
                </Suspense>
              ),
            },
            {
              path: 'users',
              element: (
                <Suspense fallback={<LoadingFallback />}>
                  <UserManagement />
                </Suspense>
              ),
            },
            {
              path: 'news',
              element: (
                <Suspense fallback={<LoadingFallback />}>
                  <NewsManagement />
                </Suspense>
              ),
            },
            {
              path: 'finance',
              element: (
                <Suspense fallback={<LoadingFallback />}>
                  <FinanceManagement />
                </Suspense>
              ),
            },
            {
              path: 'events',
              element: (
                <Suspense fallback={<LoadingFallback />}>
                  <EventsManagement />
                </Suspense>
              ),
            },
            {
              path: 'ai-insights',
              element: (
                <Suspense fallback={<LoadingFallback />}>
                  <AIInsightsManagement />
                </Suspense>
              ),
            },
          ],
        },
        {
          path: 'settings',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          ),
        },
        {
          path: 'alerts',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <AlertList />
            </Suspense>
          ),
        },
        {
          path: 'chart',
          element: <ChartLegacyRedirect />,
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
    {
      path: '/verify-email',
      element: <VerifyEmailPage />,
    },
    {
      path: '/check-email',
      element: <CheckEmailPage />,
    },
    {
      path: '/forgot-password',
      element: <ForgotPasswordForm />,
    },
    {
      path: '/reset-password',
      element: <ResetPasswordForm />,
    },
  ]
)

