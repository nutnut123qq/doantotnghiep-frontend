import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, AlertTriangle, BarChart3, Bell, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'

interface AIInsight {
  type: 'summary' | 'risk' | 'catalyst' | 'recommendation'
  title: string
  content: string
  confidence?: number
  sentiment?: 'positive' | 'negative' | 'neutral'
}

interface AIInsightsPanelProps {
  symbol: string
}

const MOCK_INSIGHTS: AIInsight[] = [
  {
    type: 'summary',
    title: 'Market Summary',
    content: 'Strong upward momentum with high volume. Technical indicators suggest continued bullish trend in short term.',
    confidence: 85,
    sentiment: 'positive',
  },
  {
    type: 'risk',
    title: 'Risk Assessment',
    content: 'Moderate risk level. RSI approaching overbought territory. Consider profit-taking if price exceeds resistance at 105,000.',
    confidence: 75,
    sentiment: 'neutral',
  },
  {
    type: 'catalyst',
    title: 'Key Catalysts',
    content: 'Upcoming earnings report expected to show strong Q4 results. Positive analyst coverage from major firms.',
    confidence: 80,
    sentiment: 'positive',
  },
  {
    type: 'recommendation',
    title: 'AI Recommendation',
    content: 'Hold position with stop-loss at 98,000. Consider adding to position on any pullback below 100,000.',
    confidence: 70,
    sentiment: 'positive',
  },
]

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'summary':
      return BarChart3
    case 'risk':
      return AlertTriangle
    case 'catalyst':
      return TrendingUp
    case 'recommendation':
      return Sparkles
    default:
      return Sparkles
  }
}

const getInsightColor = (sentiment?: string) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-[hsl(var(--positive))] text-[hsl(var(--positive-foreground))]'
    case 'negative':
      return 'bg-[hsl(var(--negative))] text-[hsl(var(--negative-foreground))]'
    default:
      return 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
  }
}

export const AIInsightsPanel = ({ symbol }: AIInsightsPanelProps) => {
  const [insights] = useState<AIInsight[]>(MOCK_INSIGHTS)
  const [isLoading] = useState(false)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardContent className="pt-6">
          <LoadingSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
          <span>AI Insights for {symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No insights available"
            description="AI analysis will appear here"
          />
        ) : (
          insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type)
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-[hsl(var(--muted))]" />
                    <h4 className="text-sm font-semibold text-[hsl(var(--text))]">
                      {insight.title}
                    </h4>
                  </div>
                  {insight.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[hsl(var(--muted))] mb-3">{insight.content}</p>
                {insight.sentiment && (
                  <Badge className={cn('text-xs', getInsightColor(insight.sentiment))}>
                    {insight.sentiment}
                  </Badge>
                )}
              </div>
            )
          })
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-[hsl(var(--border))] space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate(`/alerts?symbol=${symbol}`)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              // TODO: Add to watchlist
            }}
          >
            <Star className="h-4 w-4 mr-2" />
            Add to Watchlist
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
