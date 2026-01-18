import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const DEFAULT_INDICES: MarketIndex[] = [
  { name: 'VNINDEX', value: 1250.5, change: 15.2, changePercent: 1.23 },
  { name: 'VN30', value: 1180.3, change: 12.5, changePercent: 1.07 },
]

export const MarketOverview = ({
  indices = DEFAULT_INDICES,
  breadth,
  volume,
  value,
}: MarketOverviewProps) => {
  return (
    <div className="space-y-4">
      {/* Market Indices */}
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

      {/* Market Breadth */}
      {breadth && (
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
                  <span className="font-semibold tabular-nums">{breadth.up}</span> Up
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(var(--negative))]"></div>
                <span className="text-sm text-[hsl(var(--text))]">
                  <span className="font-semibold tabular-nums">{breadth.down}</span> Down
                </span>
              </div>
              {breadth.unchanged > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--muted))]"></div>
                  <span className="text-sm text-[hsl(var(--text))]">
                    <span className="font-semibold tabular-nums">{breadth.unchanged}</span> Unchanged
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Volume & Value */}
      {(volume || value) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {volume && (
            <Card className="bg-[hsl(var(--surface-1))]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted))]">
                  Total Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold tabular-nums text-[hsl(var(--text))]">
                  {volume.toLocaleString('vi-VN')}
                </div>
              </CardContent>
            </Card>
          )}
          {value && (
            <Card className="bg-[hsl(var(--surface-1))]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[hsl(var(--muted))]">
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold tabular-nums text-[hsl(var(--text))]">
                  {value.toLocaleString('vi-VN')} VNĐ
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
