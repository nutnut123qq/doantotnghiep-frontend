import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/shared/components/EmptyState'

interface AlertFeedItem {
  id: string
  symbol: string
  type: 'price' | 'volume' | 'sentiment' | 'volatility'
  message: string
  triggeredAt: string
  aiExplanation?: string
  severity: 'high' | 'medium' | 'low'
}

interface AlertFeedProps {
  alerts?: AlertFeedItem[]
  maxItems?: number
}

const DEFAULT_ALERTS: AlertFeedItem[] = [
  {
    id: '1',
    symbol: 'FPT',
    type: 'price',
    message: 'FPT dropped 5% this week',
    triggeredAt: new Date().toISOString(),
    aiExplanation: 'High volume spike detected. Possible sell-off due to market sentiment.',
    severity: 'high',
  },
  {
    id: '2',
    symbol: 'VIC',
    type: 'volume',
    message: 'VIC volume increased 200%',
    triggeredAt: new Date(Date.now() - 3600000).toISOString(),
    aiExplanation: 'Unusual trading activity. May indicate institutional interest.',
    severity: 'medium',
  },
]

const getTypeLabel = (type: AlertFeedItem['type']) => {
  const labels = {
    price: 'Price',
    volume: 'Volume',
    sentiment: 'Sentiment',
    volatility: 'Volatility',
  }
  return labels[type]
}

const getSeverityColor = (severity: AlertFeedItem['severity']) => {
  const colors = {
    high: 'bg-[hsl(var(--negative))] text-[hsl(var(--negative-foreground))]',
    medium: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
    low: 'bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]',
  }
  return colors[severity]
}

export const AlertFeed = ({ alerts = DEFAULT_ALERTS, maxItems = 5 }: AlertFeedProps) => {
  const displayAlerts = alerts.slice(0, maxItems)

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
                      {getTypeLabel(alert.type)}
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
                {alert.aiExplanation && (
                  <div className="mt-2 p-2 rounded bg-[hsl(var(--surface-3))] border border-[hsl(var(--border))]">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="h-3 w-3 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[hsl(var(--muted))]">
                        <span className="font-medium text-[hsl(var(--text))]">AI:</span>{' '}
                        {alert.aiExplanation}
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
