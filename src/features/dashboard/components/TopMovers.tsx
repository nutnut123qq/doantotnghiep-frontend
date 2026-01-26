import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createChart, ColorType, IChartApi } from 'lightweight-charts'
import { useEffect, useRef, useMemo } from 'react'
import { tradingBoardService } from '@/features/trading-board/services/tradingBoardService'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { ErrorState } from '@/shared/components/ErrorState'
import { BarChart3 } from 'lucide-react'
import type { StockTicker } from '@/domain/entities/StockTicker'

interface Mover {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  sparkline?: number[]
}

interface TopMoversProps {
  gainers?: Mover[]
  losers?: Mover[]
  maxItems?: number
}

const MiniSparkline = ({ data }: { data: number[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: 80,
      height: 30,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
    })

    const lineSeries = chart.addLineSeries({
      color: data[data.length - 1] >= data[0] ? 'hsl(var(--positive))' : 'hsl(var(--negative))',
      lineWidth: 2,
    })

    const chartData = data.map((value, index) => ({
      time: index as any,
      value,
    }))

    lineSeries.setData(chartData)
    chartRef.current = chart

    return () => {
      chart.remove()
    }
  }, [data])

  return <div ref={chartContainerRef} className="w-20 h-8" />
}

// Transform StockTicker to Mover format
const transformTickerToMover = (ticker: StockTicker): Mover => ({
  symbol: ticker.symbol,
  name: ticker.name || ticker.symbol,
  price: ticker.currentPrice || 0,
  change: ticker.change || 0,
  changePercent: ticker.changePercent || 0,
  volume: ticker.volume || 0,
})

export const TopMovers = ({
  gainers,
  losers,
  maxItems = 5,
}: TopMoversProps) => {
  // Fetch tickers if not provided
  const { data: tickers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['trading-board', 'top-movers'],
    queryFn: () => tradingBoardService.getTickers(),
    staleTime: 60000, // 1 minute
    enabled: !gainers && !losers, // Only fetch if not provided
  })

  // Calculate gainers and losers from tickers
  const calculatedGainers = gainers || useMemo(() => {
    return tickers
      .filter(t => (t.changePercent || 0) > 0)
      .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
      .slice(0, maxItems)
      .map(transformTickerToMover)
  }, [tickers, maxItems])

  const calculatedLosers = losers || useMemo(() => {
    return tickers
      .filter(t => (t.changePercent || 0) < 0)
      .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0))
      .slice(0, maxItems)
      .map(transformTickerToMover)
  }, [tickers, maxItems])

  const displayGainers = calculatedGainers.slice(0, maxItems)
  const displayLosers = calculatedLosers.slice(0, maxItems)

  if (isLoading && !gainers && !losers) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-6">
            <LoadingSkeleton />
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-6">
            <LoadingSkeleton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !gainers && !losers) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-6">
            <ErrorState
              message="Failed to load top movers"
              onRetry={() => refetch()}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (displayGainers.length === 0 && displayLosers.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-6">
            <EmptyState
              icon={BarChart3}
              title="No market data available"
              description="Top movers will appear here when data is available"
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Top Gainers */}
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--positive))]" />
            <span>Top Gainers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Symbol</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead className="w-[80px]">Chart</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayGainers.map((mover) => (
                <TableRow key={mover.symbol}>
                  <TableCell className="font-medium tabular-nums">
                    {mover.symbol}
                  </TableCell>
                  <TableCell className="tabular-nums text-[hsl(var(--text))]">
                    {mover.price.toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'tabular-nums font-medium',
                      'text-[hsl(var(--positive))]'
                    )}
                  >
                    +{mover.changePercent.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    {mover.sparkline && <MiniSparkline data={mover.sparkline} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Losers */}
      <Card className="bg-[hsl(var(--surface-1))]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <TrendingDown className="h-4 w-4 text-[hsl(var(--negative))]" />
            <span>Top Losers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Symbol</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead className="w-[80px]">Chart</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLosers.map((mover) => (
                <TableRow key={mover.symbol}>
                  <TableCell className="font-medium tabular-nums">
                    {mover.symbol}
                  </TableCell>
                  <TableCell className="tabular-nums text-[hsl(var(--text))]">
                    {mover.price.toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'tabular-nums font-medium',
                      'text-[hsl(var(--negative))]'
                    )}
                  >
                    {mover.changePercent.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    {mover.sparkline && <MiniSparkline data={mover.sparkline} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
