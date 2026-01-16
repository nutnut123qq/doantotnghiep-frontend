import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { useToast } from '@/shared/hooks/useToast'
import { useEffect } from 'react'

interface RoleProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: RoleProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthContext()
  const toast = useToast()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
      toast.error('You do not have permission to access this page.')
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-lg font-medium text-slate-700">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
