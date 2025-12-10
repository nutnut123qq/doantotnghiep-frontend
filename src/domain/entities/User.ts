export interface User {
  id: string
  email: string
  role: 'Investor' | 'Admin'
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
}

