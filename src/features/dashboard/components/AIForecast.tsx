import { useState, useEffect } from 'react'
import { forecastService, ForecastResult } from '../services/forecastService'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowsRightLeftIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { parseMarkdownBold } from '../utils/markdownParser'

interface AIForecastProps {
  symbol: string
}

export const AIForecast = ({ symbol }: AIForecastProps) => {
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeHorizon, setTimeHorizon] = useState<'short' | 'medium' | 'long'>('short')
  const [hasRequested, setHasRequested] = useState(false)

  // Reset forecast when symbol or timeHorizon changes (but don't auto-load)
  useEffect(() => {
    setForecast(null)
    setError(null)
    setHasRequested(false)
  }, [symbol, timeHorizon])

  const loadForecast = async () => {
    try {
      setLoading(true)
      setError(null)
      setHasRequested(true)
      const data = await forecastService.getForecast(symbol, timeHorizon)
      setForecast(data)
    } catch (err: unknown) {
      console.error('Error loading forecast:', err)
      const msg = getAxiosErrorMessage(err)
      setError(msg === 'Unknown error' ? 'Không thể tải dự báo. Vui lòng kiểm tra kết nối AI service.' : msg)
      setForecast(null) // Clear forecast data on error
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Up':
        return <ArrowTrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
      case 'Down':
        return <ArrowTrendingDownIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
      default:
        return <ArrowsRightLeftIcon className="h-6 w-6 text-muted-foreground" />
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6 border border-border max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Time Horizon Selector Skeleton */}
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              <div className="h-8 w-16 bg-background rounded-md animate-pulse"></div>
              <div className="h-8 w-20 bg-background rounded-md animate-pulse"></div>
              <div className="h-8 w-16 bg-background rounded-md animate-pulse"></div>
            </div>
            {/* Refresh Button Skeleton */}
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
          </div>
        </div>

        {/* Scrollable Content Skeleton */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 pr-2 custom-scrollbar">
          {/* Forecast Summary Skeleton - 3 cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Trend Card Skeleton */}
            <div className="p-4 rounded-lg border border-border bg-green-50 dark:bg-green-900/20 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-16 bg-green-200 dark:bg-green-800 rounded"></div>
                <div className="h-6 w-6 bg-green-200 dark:bg-green-800 rounded-full"></div>
              </div>
              <div className="h-8 w-20 bg-green-200 dark:bg-green-800 rounded"></div>
            </div>

            {/* Confidence Card Skeleton */}
            <div className="p-4 bg-muted rounded-lg border border-border animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-background rounded"></div>
                <div className="h-5 w-12 bg-purple-200 dark:bg-purple-800 rounded"></div>
              </div>
              <div className="h-8 w-24 bg-background rounded"></div>
            </div>

            {/* Recommendation Card Skeleton */}
            <div className="p-4 bg-muted rounded-lg border border-border animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-background rounded"></div>
              </div>
              <div className="h-6 w-16 bg-blue-200 dark:bg-blue-800 rounded-full"></div>
            </div>
          </div>

          {/* Key Drivers Skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="flex items-center space-x-2 mb-3">
              <div className="h-5 w-5 bg-yellow-200 dark:bg-yellow-800 rounded"></div>
              <div className="h-5 w-28 bg-muted rounded"></div>
            </div>
            <ul className="space-y-2">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex items-start space-x-2">
                  <div className="h-4 w-4 bg-green-200 dark:bg-green-800 rounded-full mt-1"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks Skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="flex items-center space-x-2 mb-3">
              <div className="h-5 w-5 bg-red-200 dark:bg-red-800 rounded"></div>
              <div className="h-5 w-36 bg-muted rounded"></div>
            </div>
            <ul className="space-y-2">
              {[1, 2].map((i) => (
                <li key={i} className="flex items-start space-x-2">
                  <div className="h-4 w-4 bg-red-200 dark:bg-red-800 rounded-full mt-1"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Analysis Skeleton */}
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 animate-pulse">
            <div className="h-5 w-32 bg-purple-200 dark:bg-purple-800 rounded mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-full"></div>
              <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-full"></div>
              <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-5/6"></div>
              <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-3/4"></div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="mt-4">
            <div className="h-3 w-48 bg-muted rounded mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasRequested) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
        <div className="flex items-center space-x-3 mb-6">
          <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-card-foreground">Dự báo AI - {symbol}</h3>
        </div>
        <div className="text-center py-8">
          <SparklesIcon className="h-12 w-12 text-purple-300 dark:text-purple-600 mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">Nhấn nút bên dưới để tạo dự báo AI cho {symbol}</p>
          <button
            onClick={loadForecast}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Đang tạo dự báo...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5" />
                <span>Tạo dự báo AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  if (error || !forecast) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6 border border-border">
        <div className="flex items-center space-x-3 mb-6">
          <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-card-foreground">Dự báo AI - {symbol}</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-4">{error || 'Không có dữ liệu'}</p>
          <button
            onClick={loadForecast}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 mx-auto"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-4 w-4" />
                <span>Thử lại</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 border border-border max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-card-foreground">Dự báo AI - {symbol}</h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Horizon Selector */}
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {(['short', 'medium', 'long'] as const).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeHorizon === horizon
                    ? 'bg-background text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {forecastService.getTimeHorizonLabel(horizon)}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadForecast}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50"
            title="Làm mới"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto overflow-x-hidden flex-1 pr-2 custom-scrollbar">
        {/* Forecast Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Trend */}
          <div className={`p-4 rounded-lg border ${forecastService.getTrendBgColor(forecast.trend)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Xu hướng</span>
              {getTrendIcon(forecast.trend)}
            </div>
            <p className={`text-2xl font-bold ${forecastService.getTrendColor(forecast.trend)}`}>
              {forecast.trend === 'Up' ? 'Tăng' : forecast.trend === 'Down' ? 'Giảm' : 'Đi ngang'}
            </p>
          </div>

          {/* Confidence */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Độ tin cậy</span>
              <span className={`text-xs font-semibold ${forecastService.getConfidenceColor(forecast.confidence)}`}>
                {forecast.confidenceScore?.toFixed(0) ?? '0'}%
              </span>
            </div>
            <p className={`text-2xl font-bold ${forecastService.getConfidenceColor(forecast.confidence)}`}>
              {forecast.confidence === 'High' ? 'Cao' : forecast.confidence === 'Medium' ? 'Trung bình' : 'Thấp'}
            </p>
          </div>

          {/* Recommendation */}
          <div className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-card-foreground">Khuyến nghị</span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${forecastService.getRecommendationColor(forecast.recommendation)}`}>
              {forecast.recommendation === 'Buy' ? 'MUA' : forecast.recommendation === 'Sell' ? 'BÁN' : 'GIỮ'}
            </div>
          </div>
        </div>

        {/* Key Drivers */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <LightBulbIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <h4 className="text-sm font-semibold text-card-foreground">Yếu tố chính</h4>
          </div>
          <ul className="space-y-2">
            {(forecast.keyDrivers || []).map((driver, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                <span className="text-sm text-card-foreground">
                  {parseMarkdownBold(driver, 'text-green-700 dark:text-green-300')}
                </span>
              </li>
            ))}
            {(!forecast.keyDrivers || forecast.keyDrivers.length === 0) && (
              <li className="text-sm text-muted-foreground">Chưa có dữ liệu</li>
            )}
          </ul>
        </div>

        {/* Risks */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <ShieldExclamationIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h4 className="text-sm font-semibold text-card-foreground">Rủi ro cần lưu ý</h4>
          </div>
          <ul className="space-y-2">
            {(forecast.risks || []).map((risk, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-600 dark:text-red-400 mt-1">⚠</span>
                <span className="text-sm text-card-foreground">
                  {parseMarkdownBold(risk, 'text-red-600 dark:text-red-400')}
                </span>
              </li>
            ))}
            {(!forecast.risks || forecast.risks.length === 0) && (
              <li className="text-sm text-muted-foreground">Chưa có dữ liệu</li>
            )}
          </ul>
        </div>

        {/* Analysis */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">Phân tích chi tiết</h4>
          <div className="text-sm text-purple-800 dark:text-purple-300 whitespace-pre-wrap">
            {parseMarkdownBold(forecast.analysis, 'text-purple-900 dark:text-purple-200')}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Dự báo được tạo bởi AI • {new Date(forecast.generatedAt).toLocaleString('vi-VN')}
        </div>
      </div>
    </div>
  )
}

