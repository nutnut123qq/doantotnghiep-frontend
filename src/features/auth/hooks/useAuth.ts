import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import type { LoginRequest, RegisterRequest } from '../types/auth.types'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'

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
    } catch (err: unknown) {
      const msg = getAxiosErrorMessage(err)
      setError(msg === 'Unknown error' ? 'Login failed' : msg)
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
    } catch (err: unknown) {
      const msg = getAxiosErrorMessage(err)
      setError(msg === 'Unknown error' ? 'Registration failed' : msg)
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

