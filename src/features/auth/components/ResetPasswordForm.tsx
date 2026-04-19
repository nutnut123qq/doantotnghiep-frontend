import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '@/shared/hooks/useToast'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

type ResetFormValues = {
  newPassword: string
  confirmPassword: string
}

const PASSWORD_REGEX = {
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /[0-9]/,
  special: /[^a-zA-Z0-9]/,
}

const schema = yup.object({
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .matches(PASSWORD_REGEX.upper, 'Password must contain at least one uppercase letter')
    .matches(PASSWORD_REGEX.lower, 'Password must contain at least one lowercase letter')
    .matches(PASSWORD_REGEX.digit, 'Password must contain at least one number')
    .matches(PASSWORD_REGEX.special, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
})

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams])

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) {
      toast.error('Missing reset token. Please use the link sent to your email.')
      return
    }
    try {
      setLoading(true)
      const result = await authService.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      if (result.success) {
        setDone(true)
        toast.success(result.message || 'Password reset successfully.')
        setTimeout(() => navigate('/login', { replace: true }), 1500)
      } else {
        toast.error(result.message || 'Unable to reset password. Please request a new link.')
      }
    } catch (err: unknown) {
      const errorMessage = getAxiosErrorMessage(err)
      toast.error(
        errorMessage === 'Unknown error'
          ? 'Unable to reset password. The link may have expired.'
          : errorMessage
      )
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
            Reset your password
          </CardTitle>
          <CardDescription>
            {done
              ? 'Password updated successfully.'
              : token
                ? 'Choose a strong new password for your account.'
                : 'Invalid or missing reset link.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <XCircleIcon className="h-16 w-16 text-red-600" />
              <p className="text-sm text-center text-muted-foreground">
                This reset link is missing a token. Please request a new password reset email.
              </p>
              <Button asChild className="w-full">
                <Link to="/forgot-password">Request a new reset link</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Back to Sign in</Link>
              </Button>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <CheckCircleIcon className="h-16 w-16 text-green-600" />
              <p className="text-sm text-center text-muted-foreground">
                Your password has been reset. Redirecting to sign in...
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Sign in now</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  {...register('newPassword')}
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="New password"
                  className={errors.newPassword ? 'border-destructive' : ''}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  At least 8 chars with uppercase, lowercase, number and special character.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  className={errors.confirmPassword ? 'border-destructive' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Resetting...
                  </>
                ) : (
                  'Reset password'
                )}
              </Button>

              <div className="text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  Back to Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
