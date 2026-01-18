import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-3 rounded-full bg-[hsl(var(--negative)/0.1)]">
              <AlertCircle className="h-6 w-6 text-[hsl(var(--negative))]" />
            </div>
            <h3 className="text-lg font-semibold text-[hsl(var(--text))] mb-2">
              {title}
            </h3>
            <p className="text-sm text-[hsl(var(--muted))] mb-4">
              {message}
            </p>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
