import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Bell, Star, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { ErrorState } from '@/shared/components/ErrorState'
import { aiInsightsService, type AIInsight } from '@/features/ai-insights/services/aiInsightsService'
import { watchlistService } from '@/features/watchlist/services/watchlistService'
import { notify } from '@/shared/utils/notify'

interface AIInsightsPanelProps {
  symbol: string
}

const getInsightIcon = (type: AIInsight['type']) => {
  const typeLower = type?.toLowerCase()
  if (typeLower === 'buy' || typeLower === 'hold') {
    return TrendingUp
  }
  if (typeLower === 'sell') {
    return TrendingDown
  }
  return BarChart3
}

const getInsightColor = (type: AIInsight['type']) => {
  const typeLower = type?.toLowerCase()
  if (typeLower === 'buy') {
    return 'bg-[hsl(var(--positive))] text-[hsl(var(--positive-foreground))]'
  }
  if (typeLower === 'sell') {
    return 'bg-[hsl(var(--negative))] text-[hsl(var(--negative-foreground))]'
  }
  return 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
}

export const AIInsightsPanel = ({ symbol }: AIInsightsPanelProps) => {
  const navigate = useNavigate()

  const { data: insights = [], isLoading, error, refetch } = useQuery({
    queryKey: ['ai-insights', symbol],
    queryFn: () => aiInsightsService.getInsights({ symbol }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!symbol,
  })

  const { data: watchlists = [] } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistService.getWatchlists(),
  })

  const handleAddToWatchlist = async () => {
    // Use first watchlist if available, don't rely on state (async issue)
    const watchlistId = watchlists.length > 0 ? watchlists[0].id : null

    if (!watchlistId) {
      notify.warning('Please create a watchlist first')
      return
    }

    try {
      await watchlistService.addStock(watchlistId, symbol)
      notify.success(`Added ${symbol} to watchlist`)
    } catch (err) {
      notify.error('Failed to add stock to watchlist')
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
            <span>AI Insights for {symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
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
            <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
            <span>AI Insights for {symbol}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message="Failed to load AI insights"
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
          <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
          <span>AI Insights for {symbol}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No insights available"
            description="AI analysis will appear here when available"
          />
        ) : (
          insights.map((insight) => {
            const Icon = getInsightIcon(insight.type)
            return (
              <div
                key={insight.id}
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
                <p className="text-sm text-[hsl(var(--muted))] mb-2">{insight.description}</p>
                {insight.reasoning && insight.reasoning.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-[hsl(var(--text))] mb-1">Reasoning:</p>
                    <ul className="text-xs text-[hsl(var(--muted))] list-disc list-inside space-y-1">
                      {insight.reasoning.slice(0, 3).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Badge className={cn('text-xs', getInsightColor(insight.type))}>
                    {insight.type}
                  </Badge>
                  {insight.targetPrice && (
                    <Badge variant="outline" className="text-xs">
                      Target: {insight.targetPrice.toLocaleString('vi-VN')}
                    </Badge>
                  )}
                  {insight.stopLoss && (
                    <Badge variant="outline" className="text-xs">
                      Stop: {insight.stopLoss.toLocaleString('vi-VN')}
                    </Badge>
                  )}
                </div>
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
            onClick={handleAddToWatchlist}
            disabled={watchlists.length === 0}
          >
            <Star className="h-4 w-4 mr-2" />
            Add to Watchlist
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
