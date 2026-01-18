import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { technicalIndicatorService } from '../services/technicalIndicatorService'

interface Indicator {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'hold'
  description: string
}

interface IndicatorsDisplayProps {
  symbol: string
}

const getSignalIcon = (signal: Indicator['signal']) => {
  switch (signal) {
    case 'buy':
      return TrendingUp
    case 'sell':
      return TrendingDown
    default:
      return Minus
  }
}

const getSignalColor = (signal: Indicator['signal']) => {
  switch (signal) {
    case 'buy':
      return 'bg-[hsl(var(--positive))] text-[hsl(var(--positive-foreground))]'
    case 'sell':
      return 'bg-[hsl(var(--negative))] text-[hsl(var(--negative-foreground))]'
    default:
      return 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
  }
}

const deriveSignal = (trend?: string): 'buy' | 'sell' | 'hold' => {
  if (!trend) return 'hold'
  const t = trend.toLowerCase()
  if (t.includes('bullish') || t.includes('buy') || t.includes('strong uptrend')) return 'buy'
  if (t.includes('bearish') || t.includes('sell') || t.includes('downtrend')) return 'sell'
  return 'hold'
}

export const IndicatorsDisplay = ({ symbol }: IndicatorsDisplayProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['technical-indicators', symbol],
    queryFn: () => technicalIndicatorService.getIndicators(symbol),
    enabled: !!symbol
  })

  const indicators = useMemo(() => {
    if (!data?.indicators) {
      return { momentum: [], trend: [], volatility: [] }
    }
    
    const grouped: Record<string, Indicator[]> = {
      momentum: [],
      trend: [],
      volatility: []
    }
    
    data.indicators.forEach(ind => {
      const type = ind.indicatorType
      const isTrend = type.startsWith('MA') || type.startsWith('EMA')
      
      const indicator: Indicator = {
        name: isTrend
          ? `${type} (${Math.round(ind.value || 0)})` 
          : type,
        value: ind.value ?? 0,
        signal: deriveSignal(ind.trendAssessment),
        description: ind.trendAssessment ?? 'N/A'
      }
      
      // Group by type - match BE indicator types: MA20, MA50, RSI, MACD
      const isMomentum = ['RSI', 'MACD', 'Stochastic'].includes(type)
      
      if (isMomentum) {
        grouped.momentum.push(indicator)
      } else if (isTrend) {
        grouped.trend.push(indicator)
      } else {
        grouped.volatility.push(indicator)
      }
    })
    
    return grouped
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--accent))]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-[hsl(var(--negative))]">
        Failed to load indicators. Please try again.
      </div>
    )
  }

  return (
    <Tabs defaultValue="momentum" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="momentum">Momentum</TabsTrigger>
        <TabsTrigger value="trend">Trend</TabsTrigger>
        <TabsTrigger value="volatility">Volatility</TabsTrigger>
      </TabsList>
      {Object.entries(indicators).map(([category, categoryIndicators]) => (
        <TabsContent key={category} value={category} className="mt-4">
          <div className="space-y-3">
            {categoryIndicators.map((indicator, index) => {
              const SignalIcon = getSignalIcon(indicator.signal)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <SignalIcon
                        className={cn(
                          'h-4 w-4',
                          indicator.signal === 'buy'
                            ? 'text-[hsl(var(--positive))]'
                            : indicator.signal === 'sell'
                            ? 'text-[hsl(var(--negative))]'
                            : 'text-[hsl(var(--muted))]'
                        )}
                      />
                      <span className="text-sm font-semibold text-[hsl(var(--text))]">
                        {indicator.name}
                      </span>
                      <Badge className={cn('text-xs', getSignalColor(indicator.signal))}>
                        {indicator.signal.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium tabular-nums text-[hsl(var(--text))]">
                        {indicator.value.toLocaleString('vi-VN', {
                          minimumFractionDigits: indicator.value < 1 ? 2 : 0,
                          maximumFractionDigits: indicator.value < 1 ? 4 : 0,
                        })}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted))]">
                        {indicator.description}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
