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

