import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Indicator {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'hold'
  description: string
}

interface IndicatorsDisplayProps {
  symbol: string
}

const MOCK_INDICATORS: Record<string, Indicator[]> = {
  momentum: [
    { name: 'RSI (14)', value: 65.5, signal: 'hold', description: 'Neutral - approaching overbought' },
    { name: 'MACD', value: 1250, signal: 'buy', description: 'Bullish crossover detected' },
    { name: 'Stochastic', value: 72.3, signal: 'hold', description: 'Overbought territory' },
  ],
  trend: [
    { name: 'MA (20)', value: 98000, signal: 'buy', description: 'Price above 20-day MA' },
    { name: 'MA (50)', value: 95000, signal: 'buy', description: 'Price above 50-day MA' },
    { name: 'MA (200)', value: 92000, signal: 'buy', description: 'Price above 200-day MA' },
    { name: 'EMA (12)', value: 99000, signal: 'buy', description: 'Strong uptrend' },
  ],
  volatility: [
    { name: 'Bollinger Bands', value: 0.025, signal: 'hold', description: 'Price near upper band' },
    { name: 'ATR', value: 2500, signal: 'hold', description: 'Moderate volatility' },
  ],
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

export const IndicatorsDisplay = ({ symbol: _symbol }: IndicatorsDisplayProps) => {
  const [indicators] = useState(MOCK_INDICATORS)

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
