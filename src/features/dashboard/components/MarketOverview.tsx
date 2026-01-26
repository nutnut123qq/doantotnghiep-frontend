import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tradingBoardService } from '@/features/trading-board/services/tradingBoardService'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { ErrorState } from '@/shared/components/ErrorState'
import { BarChart3 } from 'lucide-react'

interface MarketIndex {
  name: string
  value: number
  change: number
  changePercent: number
}

interface MarketOverviewProps {
  indices?: MarketIndex[]
  breadth?: {
    up: number
    down: number
    unchanged: number
  }
  volume?: number
  value?: number
}

export const MarketOverview = ({
  indices,
  breadth,
  volume,
  value,
}: MarketOverviewProps) => {
  // Fetch tickers to calculate market breadth if not provided
  const { data: tickers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['trading-board', 'market-overview'],
    queryFn: () => tradingBoardService.getTickers(),
    staleTime: 60000, // 1 minute
    enabled: !breadth && !volume && !value, // Only fetch if we need to calculate
  })

  // Calculate market breadth from tickers
  const calculatedBreadth = breadth || (tickers.length > 0 ? {
    up: tickers.filter(t => (t.changePercent || 0) > 0).length,
    down: tickers.filter(t => (t.changePercent || 0) < 0).length,
    unchanged: tickers.filter(t => (t.changePercent || 0) === 0).length,
  } : undefined)

  const calculatedVolume = volume || (tickers.length > 0 
    ? tickers.reduce((sum, t) => sum + (t.volume || 0), 0)
    : undefined)

  const calculatedValue = value || (tickers.length > 0
    ? tickers.reduce((sum, t) => sum + (t.value || 0), 0)
    : undefined)

  if (isLoading && !indices && !breadth && !volume && !value) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton />
      </div>
    )
  }

  if (error && !indices && !breadth && !volume && !value) {
    return (
      <div className="space-y-4">
        <ErrorState
          message="Failed to load market data"
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  // Show empty state if no data available
  if (!indices && !calculatedBreadth && !calculatedVolume && !calculatedValue) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={BarChart3}
          title="No market data available"
          description="Market overview will appear here when data is available"
        />
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {/* Market Indices */}
      {indices && indices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {indices.map((index) => (
          <Card key={index.name} className="bg-[hsl(var(--surface-1))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[hsl(var(--muted))]">
                {index.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold tabular-nums text-[hsl(var(--text))]">
                  {index.value.toLocaleString('vi-VN', { minimumFractionDigits: 2 })}
                </div>
                <div
                  className={cn(
                    'flex items-center space-x-1 text-sm font-medium tabular-nums',
                    index.change >= 0
                      ? 'text-[hsl(var(--positive))]'
                      : 'text-[hsl(var(--negative))]'
                  )}
                >
                  {index.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span>
                    {index.change >= 0 ? '+' : ''}
                    {index.change.toLocaleString('vi-VN', { minimumFractionDigits: 2 })}
                  </span>
                  <span>
                    ({index.changePercent >= 0 ? '+' : ''}
                    {index.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Market Breadth */}
      {calculatedBreadth && (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[hsl(var(--muted))]">
              Market Breadth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--positive))]"></div>
                <span className="text-sm text-[hsl(var(--text))]">
                  <span className="font-semibold tabular-nums">{calculatedBreadth.up}</span> Up
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--negative))]"></div>
                <span className="text-sm text-[hsl(var(--text))]">
                  <span className="font-semibold tabular-nums">{calculatedBreadth.down}</span> Down
                </span>
              </div>
              {calculatedBreadth.unchanged > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--muted))]"></div>
                  <span className="text-sm text-[hsl(var(--text))]">
                    <span className="font-semibold tabular-nums">{calculatedBreadth.unchanged}</span> Unchanged
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Volume & Value */}
      {(calculatedVolume || calculatedValue) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculatedVolume && (
            <Card className="bg-[hsl(var(--surface-1))]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted))]">
                  Total Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold tabular-nums text-[hsl(var(--text))]">
                  {calculatedVolume.toLocaleString('vi-VN')}
                </div>
              </CardContent>
            </Card>
          )}
          {calculatedValue && (
            <Card className="bg-[hsl(var(--surface-1))]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted))]">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold tabular-nums text-[hsl(var(--text))]">
                  {calculatedValue.toLocaleString('vi-VN')} VNĐ
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
