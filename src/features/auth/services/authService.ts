import { apiClient } from '@/infrastructure/api/apiClient'
import { storage } from '@/infrastructure/storage/localStorage'
import { normalizeRole } from '../utils/roleUtils'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  VerifyEmailResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/auth.types'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    if (response.data.token) {
      storage.set('token', response.data.token)
      storage.set('user', { email: response.data.email, role: normalizeRole(response.data.role) })
    }
    return response.data
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data)
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

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const response = await apiClient.post<VerifyEmailResponse>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`
    )
    const data = response.data
    if (data.success && data.token && data.email && data.role) {
      storage.set('token', data.token)
      storage.set('user', { email: data.email, role: normalizeRole(data.role) })
    }
    return data
  },

  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/auth/resend-verification',
      { email }
    )
    return response.data
  },

  async changePassword(payload: ChangePasswordRequest): Promise<ChangePasswordResponse> {
    const response = await apiClient.post<ChangePasswordResponse>('/auth/change-password', payload)
    return response.data
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', payload)
    return response.data
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', payload)
    return response.data
  },
}

