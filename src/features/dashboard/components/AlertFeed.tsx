import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { alertService } from '@/features/alerts/services/alertService'
import type { Alert, AlertType } from '@/features/alerts/types/alert.types'
import { AlertTypeLabels } from '@/features/alerts/types/alert.types'

interface AlertFeedProps {
  maxItems?: number
}

const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
  const colors = {
    high: 'bg-[hsl(var(--negative))] text-[hsl(var(--negative-foreground))]',
    medium: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
    low: 'bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]',
  }
  return colors[severity]
}

// Transform Alert to display format
const transformAlert = (alert: Alert) => {
  const message = alert.condition 
    ? `${alert.symbol || 'Stock'} ${alert.condition}${alert.threshold ? ` ${alert.threshold}` : ''}`
    : `${alert.symbol || 'Stock'} alert triggered`
  
  return {
    id: alert.id,
    symbol: alert.symbol || 'N/A',
    type: alert.type,
    message,
    triggeredAt: alert.triggeredAt || alert.createdAt || new Date().toISOString(),
    timeframe: alert.timeframe,
    severity: 'medium' as 'high' | 'medium' | 'low', // Default since Alert doesn't have severity
  }
}

export const AlertFeed = ({ maxItems = 5 }: AlertFeedProps) => {
  const { data: alerts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['alerts', 'recent'],
    queryFn: () => alertService.getAlerts(true), // Get active alerts only
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  })

  const displayAlerts = alerts
    .filter(alert => alert.triggeredAt) // Only show triggered alerts
    .map(transformAlert)
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
    .slice(0, maxItems)

  if (isLoading) {
    return (
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Alert Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Alert Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message="Failed to load alerts"
            onRetry={() => refetch()}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>Alert Feed</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayAlerts.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No alerts"
            description="Triggered alerts will appear here"
          />
        ) : (
          <div className="space-y-3">
            {displayAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-[hsl(var(--text))] tabular-nums">
                      {alert.symbol}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {AlertTypeLabels[alert.type as AlertType] || 'Alert'}
                    </Badge>
                    <Badge className={cn('text-xs', getSeverityColor(alert.severity))}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <span className="text-xs text-[hsl(var(--muted))]">
                    {format(new Date(alert.triggeredAt), 'HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--text))] mb-2">{alert.message}</p>
                {alert.timeframe && (
                  <div className="mt-2 p-2 rounded bg-[hsl(var(--surface-3))] border border-[hsl(var(--border))]">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="h-3 w-3 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[hsl(var(--muted))]">
                        <span className="font-medium text-[hsl(var(--text))]">Timeframe:</span>{' '}
                        {alert.timeframe}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
