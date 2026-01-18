import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/features/auth/services/authService'
import type { LoginRequest, RegisterRequest } from '@/features/auth/types/auth.types'

interface User {
  email: string
  role: string
}

interface LoginResponse {
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<LoginResponse>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = authService.getToken()
    if (token) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials)
    const userData = { email: response.email, role: response.role }
    // Ensure localStorage is updated before setting state
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return response
  }

  const register = async (data: RegisterRequest) => {
    await authService.register(data)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

