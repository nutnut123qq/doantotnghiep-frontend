import { useState, useEffect } from 'react'
import { forecastService, ForecastResult } from '../services/forecastService'
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowsRightLeftIcon,
  ShieldExclamationIcon,
  LightBulbIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface AIForecastProps {
  symbol: string
}

export const AIForecast = ({ symbol }: AIForecastProps) => {
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeHorizon, setTimeHorizon] = useState<'short' | 'medium' | 'long'>('short')

  useEffect(() => {
    loadForecast()
  }, [symbol, timeHorizon])

  const loadForecast = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await forecastService.getForecast(symbol, timeHorizon)
      setForecast(data)
    } catch (err) {
      console.error('Error loading forecast:', err)
      setError('Không thể tải dự báo')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Up':
        return <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
      case 'Down':
        return <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
      default:
        return <ArrowsRightLeftIcon className="h-6 w-6 text-slate-600" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">Dự báo AI</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error || !forecast) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">Dự báo AI</h3>
        </div>
        <div className="text-center py-8 text-slate-500">
          <p>{error || 'Không có dữ liệu'}</p>
          <button
            onClick={loadForecast}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900">Dự báo AI - {symbol}</h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Horizon Selector */}
          <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
            {(['short', 'medium', 'long'] as const).map((horizon) => (
              <button
                key={horizon}
                onClick={() => setTimeHorizon(horizon)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeHorizon === horizon
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
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
            className="p-2 text-slate-600 hover:text-purple-600 disabled:opacity-50"
            title="Làm mới"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Trend */}
        <div className={`p-4 rounded-lg border ${forecastService.getTrendBgColor(forecast.trend)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Xu hướng</span>
            {getTrendIcon(forecast.trend)}
          </div>
          <p className={`text-2xl font-bold ${forecastService.getTrendColor(forecast.trend)}`}>
            {forecast.trend === 'Up' ? 'Tăng' : forecast.trend === 'Down' ? 'Giảm' : 'Đi ngang'}
          </p>
        </div>

        {/* Confidence */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Độ tin cậy</span>
            <span className={`text-xs font-semibold ${forecastService.getConfidenceColor(forecast.confidence)}`}>
              {forecast.confidenceScore?.toFixed(0) ?? '0'}%
            </span>
          </div>
          <p className={`text-2xl font-bold ${forecastService.getConfidenceColor(forecast.confidence)}`}>
            {forecast.confidence === 'High' ? 'Cao' : forecast.confidence === 'Medium' ? 'Trung bình' : 'Thấp'}
          </p>
        </div>

        {/* Recommendation */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Khuyến nghị</span>
          </div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${forecastService.getRecommendationColor(forecast.recommendation)}`}>
            {forecast.recommendation === 'Buy' ? 'MUA' : forecast.recommendation === 'Sell' ? 'BÁN' : 'GIỮ'}
          </div>
        </div>
      </div>

      {/* Key Drivers */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <LightBulbIcon className="h-5 w-5 text-yellow-600" />
          <h4 className="text-sm font-semibold text-slate-700">Yếu tố chính</h4>
        </div>
        <ul className="space-y-2">
          {forecast.keyDrivers.map((driver, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-sm text-slate-700">{driver}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <ShieldExclamationIcon className="h-5 w-5 text-red-600" />
          <h4 className="text-sm font-semibold text-slate-700">Rủi ro cần lưu ý</h4>
        </div>
        <ul className="space-y-2">
          {forecast.risks.map((risk, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-red-600 mt-1">⚠</span>
              <span className="text-sm text-slate-700">{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Analysis */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-semibold text-purple-900 mb-2">Phân tích chi tiết</h4>
        <p className="text-sm text-purple-800 whitespace-pre-wrap">{forecast.analysis}</p>
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-slate-500 text-center">
        Dự báo được tạo bởi AI • {new Date(forecast.generatedAt).toLocaleString('vi-VN')}
      </div>
    </div>
  )
}

