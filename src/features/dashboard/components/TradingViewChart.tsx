import { useEffect, useRef, useState, useCallback } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts'
import { stockDataService, OHLCVData } from '../services/stockDataService'
import { chartSettingsService } from '../services/chartSettingsService'
import { ChartBarIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { SymbolSelector } from './SymbolSelector'

interface TradingViewChartProps {
  symbol: string
  height?: number
}

// Chart color constants - moved outside component to avoid recreation
const CHART_COLORS = {
  light: {
    background: '#ffffff',
    text: '#333',
    grid: '#f0f0f0',
    border: '#e0e0e0',
  },
  dark: {
    background: '#0c1221',
    text: '#e2e8f0',
    grid: '#1e293b',
    border: '#334155',
  },
} as const

export const TradingViewChart = ({ symbol, height = 500 }: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  
  const [selectedSymbol, setSelectedSymbol] = useState(symbol)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M')
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  )

  // Update selectedSymbol when prop changes
  useEffect(() => {
    setSelectedSymbol(symbol)
  }, [symbol])

  // Listen for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const darkMode = document.documentElement.classList.contains('dark')
          setIsDarkMode(darkMode)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  // Update chart colors when dark mode changes
  useEffect(() => {
    if (!chartRef.current) return

    const colors = isDarkMode ? CHART_COLORS.dark : CHART_COLORS.light

    chartRef.current.applyOptions({
      layout: {
        background: { color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: {
        borderColor: colors.border,
      },
      timeScale: {
        borderColor: colors.border,
      },
    })
  }, [isDarkMode])

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = chartSettingsService.loadSettings(selectedSymbol)
    if (savedSettings) {
      setTimeRange(savedSettings.timeRange)
    }
  }, [selectedSymbol])

  // Save settings when timeRange changes
  useEffect(() => {
    chartSettingsService.saveSettings(selectedSymbol, { timeRange })
  }, [selectedSymbol, timeRange])

  useEffect(() => {
    if (!chartContainerRef.current) return

    const colors = isDarkMode ? CHART_COLORS.dark : CHART_COLORS.light

    // Create chart with dark mode support
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: colors.border,
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartRef.current = chart

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })
    candlestickSeriesRef.current = candlestickSeries

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })
    volumeSeriesRef.current = volumeSeries

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [height, isDarkMode])

  const loadChartData = useCallback(async () => {
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

      // Convert to candlestick data
      const candlestickData: CandlestickData[] = data.map((d: OHLCVData) => ({
        time: d.time as Time,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))

      // Convert to volume data
      const volumeData = data.map((d: OHLCVData) => ({
        time: d.time as Time,
        value: d.volume,
        color: d.close >= d.open ? '#26a69a80' : '#ef535080',
      }))

      candlestickSeriesRef.current?.setData(candlestickData)
      volumeSeriesRef.current?.setData(volumeData)

      // Fit content
      chartRef.current?.timeScale().fitContent()
    } catch (err) {
      console.error('Error loading chart data:', err)
      setError('Lỗi khi tải dữ liệu biểu đồ')
    } finally {
      setLoading(false)
    }
  }, [selectedSymbol, timeRange])

  useEffect(() => {
    loadChartData()
  }, [loadChartData])

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-card-foreground">Biểu đồ</span>
            <SymbolSelector
              value={selectedSymbol}
              onChange={setSelectedSymbol}
              placeholder="Chọn mã CK..."
              className="w-48"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
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

          {/* Refresh Button */}
          <button
            onClick={loadChartData}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
            title="Làm mới"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => chartSettingsService.exportSettings(selectedSymbol)}
            className="p-2 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
            title="Xuất cài đặt"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded-lg">
            <div className="text-center">
              <ArrowPathIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
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

        <div ref={chartContainerRef} className="rounded-lg overflow-hidden" />
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Tăng</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Giảm</span>
          </div>
        </div>
        <div>
          Dữ liệu từ VNStock
        </div>
      </div>
    </div>
  )
}


