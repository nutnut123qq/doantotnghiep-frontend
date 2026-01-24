import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '@/shared/hooks/useToast'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Token is missing.')
      return
    }

    const verifyEmail = async () => {
      try {
        const result = await authService.verifyEmail(token)
        if (result.success) {
          setStatus('success')
          setMessage(result.message || 'Email verified successfully!')
        } else {
          setStatus('error')
          setMessage(result.message || 'Failed to verify email.')
        }
      } catch (error: unknown) {
        const errorMessage = getAxiosErrorMessage(error)
        setStatus('error')
        setMessage(
          errorMessage === 'Unknown error'
            ? 'Failed to verify email. The link may have expired.'
            : errorMessage
        )
      }
    }

    verifyEmail()
  }, [searchParams])

  const handleResend = async () => {
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    try {
      const result = await authService.resendVerification(email)
      if (result.success) {
        toast.success('Verification email sent! Please check your inbox.')
      } else {
        toast.error(result.message || 'Failed to resend verification email')
      }
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      toast.error(
        errorMessage === 'Unknown error'
          ? 'Failed to resend verification email. Please try again.'
          : errorMessage
      )
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
            Email Verification
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Your email has been verified!'}
            {status === 'error' && 'Verification failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Please wait...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircleIcon className="h-16 w-16 text-green-600" />
              <p className="text-sm text-center text-muted-foreground">{message}</p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <XCircleIcon className="h-16 w-16 text-red-600" />
              <p className="text-sm text-center text-red-600">{message}</p>
              
              <div className="w-full space-y-2">
                <p className="text-xs text-muted-foreground text-center">
                  Didn't receive the email? Enter your email to resend:
                </p>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    onClick={handleResend}
                    variant="outline"
                    size="sm"
                  >
                    Resend
                  </Button>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full">
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
                <Link
                  to="/register"
                  className="text-center text-sm text-primary hover:underline"
                >
                  Create a new account
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
