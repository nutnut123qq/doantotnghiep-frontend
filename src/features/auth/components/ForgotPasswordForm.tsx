import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '@/shared/hooks/useToast'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import type { ForgotPasswordRequest } from '../types/auth.types'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
})

export const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const toast = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: ForgotPasswordRequest) => {
    try {
      setLoading(true)
      const result = await authService.forgotPassword(data)
      setSubmittedEmail(data.email)
      setSubmitted(true)
      if (!result.success) {
        toast.error(result.message || 'Unable to process the request. Please try again.')
      }
    } catch (err: unknown) {
      const errorMessage = getAxiosErrorMessage(err)
      toast.error(
        errorMessage === 'Unknown error'
          ? 'Unable to send reset email. Please try again.'
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
            Forgot your password?
          </CardTitle>
          <CardDescription>
            {submitted
              ? "We've processed your request."
              : "Enter the email associated with your account and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center space-y-4 py-4">
              <CheckCircleIcon className="h-16 w-16 text-green-600" />
              <p className="text-sm text-center text-muted-foreground">
                If an account exists for <span className="font-medium">{submittedEmail}</span>, a
                password reset link has been sent. The link will expire in 30 minutes.
              </p>
              <p className="text-xs text-center text-muted-foreground">
                Didn't receive an email? Check your spam folder or try again in a few minutes.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Back to Sign in</Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>

              <div className="flex justify-between text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  Back to Sign in
                </Link>
                <Link to="/register" className="text-primary hover:underline">
                  Create an account
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
