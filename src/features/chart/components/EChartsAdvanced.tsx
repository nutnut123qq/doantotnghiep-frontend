import { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import { stockDataService, OHLCVData } from '@/features/dashboard/services/stockDataService'
import { chartSettingsService } from '@/features/dashboard/services/chartSettingsService'
// Note: Indicators are calculated from OHLCV data, not fetched from backend
// Backend indicators are single values, not time series

interface EChartsAdvancedProps {
  symbol: string
  height?: number
}

export const EChartsAdvanced = ({ symbol, height = 600 }: EChartsAdvancedProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState(symbol)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M')
  const [showMA20, setShowMA20] = useState(true)
  const [showMA50, setShowMA50] = useState(true)
  const [showRSI, setShowRSI] = useState(true)

  useEffect(() => {
    setSelectedSymbol(symbol)
  }, [symbol])

  // Initialize ECharts instance
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = echarts.init(chartContainerRef.current, 'dark')
    chartInstanceRef.current = chart

    const handleResize = () => {
      chart.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
  }, [])

  // Load chart data
  const loadChartData = useCallback(async () => {
    if (!chartInstanceRef.current) return

    try {
      setLoading(true)
      setError(null)

      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '1M':
          startDate.setMonth(endDate.getMonth() - 1)
          break
        case '3M':
          startDate.setMonth(endDate.getMonth() - 3)
          break
        case '6M':
          startDate.setMonth(endDate.getMonth() - 6)
          break
        case '1Y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        case 'ALL':
          startDate.setFullYear(endDate.getFullYear() - 5)
          break
      }

      const data = await stockDataService.getOHLCVData(selectedSymbol, startDate, endDate)

      if (!data || data.length === 0) {
        setError('Không có dữ liệu')
        return
      }

      // Prepare data arrays
      const dates = data.map(d => {
        const date = new Date(d.time)
        return date.toISOString().split('T')[0] // Format: YYYY-MM-DD
      })
      const ohlcData = data.map(d => [d.open, d.close, d.low, d.high])
      const volumeData = data.map(d => d.volume)

      // Calculate MAs
      const calculateMA = (period: number): number[] => {
        const ma: number[] = []
        for (let i = 0; i < data.length; i++) {
          if (i < period - 1) {
            ma.push(NaN)
            continue
          }
          const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0)
          ma.push(sum / period)
        }
        return ma
      }

      const ma20Data = calculateMA(20)
      const ma50Data = calculateMA(50)

      // Calculate RSI (simplified)
      const calculateRSI = (period: number = 14): number[] => {
        const rsi: number[] = []
        for (let i = 0; i < data.length; i++) {
          if (i < period) {
            rsi.push(NaN)
            continue
          }
          let gains = 0
          let losses = 0
          for (let j = i - period + 1; j <= i; j++) {
            const change = data[j].close - data[j - 1].close
            if (change > 0) gains += change
            else losses += Math.abs(change)
          }
          const avgGain = gains / period
          const avgLoss = losses / period
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
          rsi.push(100 - (100 / (1 + rs)))
        }
        return rsi
      }

      const rsiData = calculateRSI(14)

      // Load saved settings
      const savedSettings = await chartSettingsService.loadSettings(selectedSymbol)
      const drawings = savedSettings?.drawings || {}

      // Build ECharts option
      const option: echarts.EChartsOption = {
        animation: false,
        legend: {
          data: ['Candlestick', 'Volume', 'MA20', 'MA50', 'RSI'],
          top: 10,
        },
        grid: [
          { left: '10%', right: '8%', height: '50%' }, // Main chart
          { left: '10%', right: '8%', top: '63%', height: '16%' }, // Volume
          { left: '10%', right: '8%', top: '82%', height: '14%' }  // RSI
        ],
        xAxis: [
          { type: 'category', data: dates, gridIndex: 0, boundaryGap: false },
          { type: 'category', data: dates, gridIndex: 1, boundaryGap: false },
          { type: 'category', data: dates, gridIndex: 2, boundaryGap: false }
        ],
        yAxis: [
          { scale: true, gridIndex: 0, splitNumber: 5 },
          { scale: true, gridIndex: 1 },
          { scale: true, gridIndex: 2, min: 0, max: 100, splitNumber: 5 }
        ],
        dataZoom: [
          { type: 'inside', xAxisIndex: [0, 1, 2], start: 50, end: 100 },
          { show: true, xAxisIndex: [0, 1, 2], type: 'slider', top: '95%' }
        ],
        series: [
          {
            name: 'Candlestick',
            type: 'candlestick' as const,
            data: ohlcData,
            xAxisIndex: 0,
            yAxisIndex: 0,
            itemStyle: {
              color: '#26a69a',
              color0: '#ef5350',
              borderColor: '#26a69a',
              borderColor0: '#ef5350',
            },
            markLine: {
              data: drawings.trendlines?.map((line: any) => ({
                coord: line.coord,
                lineStyle: line.lineStyle || { color: '#ff6b6b', width: 2 },
                label: line.label || { show: false },
              })) || [],
              silent: true,
            },
            markArea: {
              data: drawings.zones?.map((zone: any) => zone.coord) || [],
              silent: true,
            },
          },
          {
            name: 'Volume',
            type: 'bar' as const,
            data: volumeData.map((vol, idx) => ({
              value: vol,
              itemStyle: {
                color: data[idx].close >= data[idx].open ? '#26a69a80' : '#ef535080',
              },
            })),
            xAxisIndex: 1,
            yAxisIndex: 1,
          },
          ...(showMA20 ? [{
            name: 'MA20',
            type: 'line' as const,
            data: ma20Data,
            xAxisIndex: 0,
            yAxisIndex: 0,
            smooth: true,
            lineStyle: { width: 2, color: '#ffa726' },
            symbol: 'none',
          }] : []),
          ...(showMA50 ? [{
            name: 'MA50',
            type: 'line' as const,
            data: ma50Data,
            xAxisIndex: 0,
            yAxisIndex: 0,
            smooth: true,
            lineStyle: { width: 2, color: '#42a5f5' },
            symbol: 'none',
          }] : []),
          ...(showRSI ? [{
            name: 'RSI',
            type: 'line' as const,
            data: rsiData,
            xAxisIndex: 2,
            yAxisIndex: 2,
            smooth: true,
            lineStyle: { width: 2, color: '#ab47bc' },
            symbol: 'none',
            markLine: {
              data: [
                { yAxis: 70, lineStyle: { color: '#ef5350', type: 'dashed' }, label: { formatter: 'Overbought' } },
                { yAxis: 30, lineStyle: { color: '#26a69a', type: 'dashed' }, label: { formatter: 'Oversold' } },
              ],
            },
          }] : []),
        ] as echarts.SeriesOption[],
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: 'none' },
            restore: {},
            saveAsImage: {},
          },
        },
      }

      chartInstanceRef.current.setOption(option, true)
    } catch (err) {
      console.error('Error loading chart data:', err)
      setError('Lỗi khi tải dữ liệu biểu đồ')
    } finally {
      setLoading(false)
    }
  }, [selectedSymbol, timeRange, showMA20, showMA50, showRSI])

  useEffect(() => {
    loadChartData()
  }, [loadChartData])

  // Save settings when timeRange changes
  useEffect(() => {
    chartSettingsService.saveSettings(selectedSymbol, { timeRange })
  }, [selectedSymbol, timeRange])

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-card-foreground">
          {selectedSymbol} - Advanced Chart
        </div>

        <div className="flex items-center space-x-2">
          {/* Indicator Toggles */}
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setShowMA20(!showMA20)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                showMA20
                  ? 'bg-background text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              MA20
            </button>
            <button
              onClick={() => setShowMA50(!showMA50)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                showMA50
                  ? 'bg-background text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              MA50
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                showRSI
                  ? 'bg-background text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              RSI
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-background text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                onClick={loadChartData}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        <div ref={chartContainerRef} style={{ width: '100%', height: `${height}px` }} />
      </div>
    </div>
  )
}
