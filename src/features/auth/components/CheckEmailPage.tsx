import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/authService'
import { useToast } from '@/shared/hooks/useToast'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

export const CheckEmailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const queryEmail = searchParams.get('email')?.trim() ?? ''
  const stateEmail = (location.state as { email?: string } | null)?.email?.trim() ?? ''
  const registeredEmail = queryEmail || stateEmail
  const [email, setEmail] = useState(() => registeredEmail)
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    const target = email.trim()
    if (!target) {
      toast.error('Please enter your email address')
      return
    }

    try {
      setResending(true)
      const result = await authService.resendVerification(target)
      if (result.success) {
        toast.success(result.message || 'If an account exists with this email, check your inbox.')
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
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Check your email
          </CardTitle>
          <CardDescription>
            {registeredEmail ? (
              <>
                A verification link has been sent to{' '}
                <span className="font-medium text-foreground">{registeredEmail}</span>.
              </>
            ) : (
              'A verification link has been sent to your email.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
            <p>Open your inbox and click the verification link to activate your account. The link will expire in 24 hours.</p>
            <p className="mt-2">If you don't see the email, check your spam folder.</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Enter the <span className="font-medium text-foreground">same email</span> you
              used to register, then tap Resend:
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
                disabled={resending}
              >
                {resending ? 'Sending...' : 'Resend'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
              Back to Login
            </Button>
            <Link to="/register" className="text-center text-sm text-primary hover:underline">
              Use a different email
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
