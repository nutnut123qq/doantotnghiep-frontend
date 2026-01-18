import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { RoleProtectedRoute } from '@/shared/components/RoleProtectedRoute'
import { Layout } from '@/shared/components/Layout'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { VerifyEmailPage } from '@/features/auth/components/VerifyEmailPage'
import { LoadingFallback } from '@/shared/components/LoadingFallback'

// Lazy load heavy components for code splitting
const Dashboard = lazy(() => import('@/features/dashboard/components/Dashboard').then(m => ({ default: m.Dashboard })))
const CustomizableDashboard = lazy(() => import('@/features/dashboard/components/CustomizableDashboard').then(m => ({ default: m.CustomizableDashboard })))
const TradingBoard = lazy(() => import('@/features/trading-board/components/TradingBoard').then(m => ({ default: m.TradingBoard })))
const Portfolio = lazy(() => import('@/features/portfolio/components/Portfolio').then(m => ({ default: m.Portfolio })))
const Watchlist = lazy(() => import('@/features/watchlist/components/Watchlist').then(m => ({ default: m.Watchlist })))
const AIInsights = lazy(() => import('@/features/ai-insights/components/AIInsights').then(m => ({ default: m.AIInsights })))
const EventsFeed = lazy(() => import('@/features/events/components/EventsFeed'))
const EventsCalendar = lazy(() => import('@/features/events/components/EventsCalendar'))
const AdminDashboard = lazy(() => import('@/features/admin/components/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const Settings = lazy(() => import('@/features/settings/components/Settings').then(m => ({ default: m.Settings })))
const AlertList = lazy(() => import('@/features/alerts/components/AlertList').then(m => ({ default: m.AlertList })))
const ChartPage = lazy(() => import('@/features/chart/components/ChartPage').then(m => ({ default: m.ChartPage })))
const WorkspacePage = lazy(() => import('@/features/workspace/components/WorkspacePage').then(m => ({ default: m.WorkspacePage })))

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
              <CustomizableDashboard />
            </Suspense>
          ),
        },
        {
          path: 'dashboard-classic',
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
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <EventsCalendar />
            </Suspense>
          ),
        },
        {
          path: 'admin',
          element: (
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            </RoleProtectedRoute>
          ),
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
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <ChartPage />
            </Suspense>
          ),
        },
        {
          path: 'workspace',
          element: (
            <Suspense fallback={<LoadingFallback />}>
              <WorkspacePage />
            </Suspense>
          ),
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
  ]
)

