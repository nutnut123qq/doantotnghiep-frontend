export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  token: string
  email: string
  role: string
}

export interface RegisterResponse {
  userId: string
  email: string
  message: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

export interface VerifyEmailResponse {
  success: boolean
  message: string
  token?: string
  email?: string
  role?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

