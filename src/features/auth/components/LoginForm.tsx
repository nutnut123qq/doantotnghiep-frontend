import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/shared/contexts/AuthContext'
import { useToast } from '@/shared/hooks/useToast'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'

const LOGIN_RETURN_URL_KEY = 'login_returnUrl'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { LoginRequest } from '../types/auth.types'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

export const LoginForm = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuthContext()
  const toast = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: LoginRequest) => {
    try {
      setLoading(true)
      await login(data)
      toast.success('Login successful!')
      let returnUrl: string | null = null
      try {
        returnUrl = sessionStorage.getItem(LOGIN_RETURN_URL_KEY)
        if (returnUrl) sessionStorage.removeItem(LOGIN_RETURN_URL_KEY)
      } catch {
        /* ignore */
      }
      const target = (returnUrl && returnUrl !== '/login') ? returnUrl : '/'
      setTimeout(() => navigate(target, { replace: true }), 100)
    } catch (err: unknown) {
      const errorMessage = getAxiosErrorMessage(err)
      toast.error(errorMessage === 'Unknown error' ? 'Login failed. Please check your credentials.' : errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">SI</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sign in to your account
          </CardTitle>
          <CardDescription>
            Or{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              create a new account
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="text-center text-sm">
              <Link to="/register" className="text-primary hover:underline">
                Don't have an account? Register
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

