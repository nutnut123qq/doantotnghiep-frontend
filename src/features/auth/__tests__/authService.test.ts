import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authService } from '../services/authService'
import { apiClient } from '@/infrastructure/api/apiClient'
import { storage } from '@/infrastructure/storage/localStorage'

vi.mock('@/infrastructure/api/apiClient')
vi.mock('@/infrastructure/storage/localStorage')

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          email: 'test@example.com',
          role: 'Investor',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse as any)

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(storage.set).toHaveBeenCalledWith('token', 'test-token')
      expect(storage.set).toHaveBeenCalledWith('user', {
        email: 'test@example.com',
        role: 'Investor',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        data: {
          userId: 'user-123',
          email: 'test@example.com',
          message: 'Registration successful',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse as any)

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('logout', () => {
    it('should remove token and user from storage', () => {
      authService.logout()

      expect(storage.remove).toHaveBeenCalledWith('token')
      expect(storage.remove).toHaveBeenCalledWith('user')
    })
  })

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Email verified successfully',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse as any)

      const result = await authService.verifyEmail('test-token')

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/auth/verify-email?token=test-token'
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('resendVerification', () => {
    it('should resend verification email', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Verification email sent',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse as any)

      const result = await authService.resendVerification('test@example.com')

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/auth/resend-verification',
        { email: 'test@example.com' }
      )
      expect(result).toEqual(mockResponse.data)
    })
  })
})
