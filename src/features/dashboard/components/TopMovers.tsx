import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createChart, ColorType, IChartApi } from 'lightweight-charts'
import { useEffect, useRef } from 'react'

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

const DEFAULT_GAINERS: Mover[] = [
  { symbol: 'VIC', name: 'Vingroup', price: 100000, change: 5000, changePercent: 5.26, volume: 1000000, sparkline: [95000, 96000, 97000, 98000, 99000, 100000] },
  { symbol: 'VNM', name: 'Vinamilk', price: 85000, change: 3000, changePercent: 3.66, volume: 500000, sparkline: [82000, 83000, 84000, 84500, 85000] },
  { symbol: 'FPT', name: 'FPT Corporation', price: 120000, change: 2500, changePercent: 2.13, volume: 800000, sparkline: [117500, 118000, 119000, 119500, 120000] },
]

const DEFAULT_LOSERS: Mover[] = [
  { symbol: 'VCB', name: 'Vietcombank', price: 95000, change: -2000, changePercent: -2.06, volume: 600000, sparkline: [97000, 96000, 95500, 95000, 95000] },
  { symbol: 'BID', name: 'BIDV', price: 45000, change: -1000, changePercent: -2.17, volume: 400000, sparkline: [46000, 45500, 45000, 45000, 45000] },
]

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

export const TopMovers = ({
  gainers = DEFAULT_GAINERS,
  losers = DEFAULT_LOSERS,
  maxItems = 5,
}: TopMoversProps) => {
  const displayGainers = gainers.slice(0, maxItems)
  const displayLosers = losers.slice(0, maxItems)

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
