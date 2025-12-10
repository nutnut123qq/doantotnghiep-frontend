import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import type { LoginRequest, RegisterRequest } from '../types/auth.types'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      setError(null)
      await authService.login(credentials)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true)
      setError(null)
      await authService.register(data)
      navigate('/login')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    navigate('/login')
  }

  return {
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated: authService.isAuthenticated(),
  }
}

