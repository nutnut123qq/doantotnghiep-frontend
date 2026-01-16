import { apiClient } from '@/infrastructure/api/apiClient'
import { storage } from '@/infrastructure/storage/localStorage'
import type { LoginRequest, RegisterRequest, AuthResponse, RegisterResponse } from '../types/auth.types'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials)
    if (response.data.token) {
      storage.set('token', response.data.token)
      storage.set('user', { email: response.data.email, role: response.data.role })
    }
    return response.data
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', data)
    return response.data
  },

  logout(): void {
    storage.remove('token')
    storage.remove('user')
  },

  getToken(): string | null {
    return storage.get<string>('token')
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`
    )
    return response.data
  },

  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/api/auth/resend-verification',
      { email }
    )
    return response.data
  },
}

