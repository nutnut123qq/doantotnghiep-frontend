import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { useToast } from '@/shared/hooks/useToast'
import { normalizeRole } from '@/features/auth/utils/roleUtils'
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

  const normalizedRole = user ? normalizeRole(user.role) : null

  useEffect(() => {
    if (!isLoading && isAuthenticated && normalizedRole && !allowedRoles.includes(normalizedRole)) {
      toast.error('You do not have permission to access this page.')
    }
  }, [isLoading, isAuthenticated, normalizedRole, allowedRoles, toast])

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

  if (normalizedRole && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
