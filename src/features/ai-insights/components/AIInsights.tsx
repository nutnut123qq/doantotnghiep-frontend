import { useState } from 'react'
import { Tab } from '@headlessui/react'
import { useQuery } from '@tanstack/react-query'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Cpu,
  Smile,
  AlertTriangle,
  Star,
  X
} from 'lucide-react'
import { aiInsightsService, shouldRetryAIInsightsRequest, type AIInsight } from '../services/aiInsightsService'
import { motion } from 'framer-motion'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins} phút trước`
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`
  } else {
    return date.toLocaleDateString('vi-VN')
  }
}

export const AIInsights = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Insights')
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [error, setError] = useState<string | null>(null)

  const insightsQuery = useQuery({
    queryKey: ['ai-insights', 'list'],
    queryFn: () => aiInsightsService.getInsights(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    retry: shouldRetryAIInsightsRequest,
  })

  const sentimentQuery = useQuery({
    queryKey: ['ai-insights', 'sentiment'],
    queryFn: () => aiInsightsService.getMarketSentiment(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: false,
    retry: shouldRetryAIInsightsRequest,
  })

  const insights = insightsQuery.data ?? []
  const marketSentiment = sentimentQuery.data ?? null
  const loading = insightsQuery.isLoading || sentimentQuery.isLoading

  const queryError = insightsQuery.error ?? sentimentQuery.error

  const loadData = async () => {
    setError(null)
    const results = await Promise.all([
      insightsQuery.refetch(),
      sentimentQuery.refetch(),
    ])

    const failed = results.find((result) => result.isError)
    if (failed?.error) {
      const msg = getAxiosErrorMessage(failed.error)
      setError(msg === 'Unknown error' ? 'Không thể tải dữ liệu AI Insights' : msg)
    }
  }

  const handleViewDetails = async (insightId: string) => {
    try {
      const detail = await aiInsightsService.getInsightById(insightId)
      setSelectedInsight(detail)
    } catch (err: unknown) {
      console.error('Error loading insight details:', err)
      const msg = getAxiosErrorMessage(err)
      setError(msg === 'Unknown error' ? 'Không thể tải chi tiết insight' : msg)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buy': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-700' }
      case 'sell': return { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-700' }
      case 'hold': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700' }
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600' }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'buy': return <TrendingUp className="h-6 w-6" />
      case 'sell': return <TrendingDown className="h-6 w-6" />
      case 'hold': return <Minus className="h-6 w-6" />
      default: return <TrendingUp className="h-6 w-6" />
    }
  }

  const getSentimentIcon = (overall: string) => {
    switch (overall.toLowerCase()) {
      case 'bullish': return <Smile className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
      case 'bearish': return <Smile className="w-12 h-12 text-rose-600 dark:text-rose-400 rotate-180" />
      default: return <Minus className="w-12 h-12 text-slate-600 dark:text-slate-400" />
    }
  }

  const getSentimentColor = (overall: string) => {
    switch (overall.toLowerCase()) {
      case 'bullish': return 'text-emerald-600 dark:text-emerald-400'
      case 'bearish': return 'text-rose-600 dark:text-rose-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'text-rose-600 dark:text-rose-400'
      case 'moderate': return 'text-amber-600 dark:text-amber-400'
      default: return 'text-emerald-600 dark:text-emerald-400'
    }
  }

  const categories = {
    'All Insights': [...insights].sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0)),
    'Buy Signals': insights.filter(i => i.type.toLowerCase() === 'buy'),
    'Sell Signals': insights.filter(i => i.type.toLowerCase() === 'sell'),
    'Hold Recommendations': insights.filter(i => i.type.toLowerCase() === 'hold'),
  }

  const getQualityColor = (status?: string) => {
    switch ((status ?? '').toLowerCase()) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'rejected':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    }
  }

  // Note: Insights are filtered by category in Tab.Panels below

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-300">Đang tải AI Insights...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || queryError) {
    const displayError = error ?? (() => {
      const msg = getAxiosErrorMessage(queryError)
      return msg === 'Unknown error' ? 'Không thể tải dữ liệu AI Insights' : msg
    })()

    return (
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{displayError}</p>
            <button
              onClick={() => void loadData()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AI Insights
          </h1>
          <p className="text-slate-600 dark:text-slate-400">AI-powered market analysis and trading recommendations</p>
        </div>

        {/* Insights with Tabs */}
        <Tab.Group selectedIndex={Object.keys(categories).indexOf(selectedCategory)} onChange={(index) => setSelectedCategory(Object.keys(categories)[index])}>
          <Tab.List className="flex space-x-2 rounded-xl bg-white dark:bg-slate-800 p-2 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
            {Object.keys(categories).map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                    'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                    selected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400'
                  )
                }
              >
                {category} ({categories[category as keyof typeof categories].length})
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {Object.values(categories).map((categoryInsights, idx) => (
              <Tab.Panel key={idx} className="space-y-6">
                {categoryInsights.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <Cpu className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-300 text-lg font-medium mb-2">
                      {insights.length === 0 
                        ? 'Chưa có insights nào được tạo' 
                        : 'Chưa có insights trong danh mục này'}
                    </p>
                    {insights.length === 0 && (
                      <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Dữ liệu insight được hệ thống backend tạo định kỳ cho toàn bộ người dùng.
                        <br />
                        <span className="text-sm text-slate-400 dark:text-slate-500">Vui lòng quay lại sau.</span>
                      </p>
                    )}
                  </div>
                ) : (
                  categoryInsights.map((insight) => {
                    const colors = getTypeColor(insight.type)
                    return (
                      <motion.div
                        key={insight.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ${colors.text}`}>
                                {getTypeIcon(insight.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} uppercase`}>
                                    {insight.type}
                                  </span>
                                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{insight.symbol}</span>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">{insight.title}</h3>
                                <p className="text-slate-600 dark:text-slate-300">{insight.description}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getQualityColor(insight.qualityStatus)}`}>
                                    {insight.qualityStatus === 'approved'
                                      ? 'Quality: Approved'
                                      : insight.qualityStatus === 'rejected'
                                        ? 'Quality: Rejected'
                                        : 'Quality: Needs Review'}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Score: {insight.qualityScore ?? 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{formatTimestamp(insight.timestamp)}</div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-slate-600 dark:text-slate-300">Confidence:</span>
                                <span className={`text-lg font-bold ${colors.text}`}>{insight.confidence}%</span>
                              </div>
                            </div>
                          </div>

                          {insight.evidence && insight.evidence.length > 0 && (
                            <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Evidence</p>
                              <ul className="space-y-1">
                                {insight.evidence.slice(0, 3).map((ev, idx) => (
                                  <li key={idx} className="text-xs text-slate-600 dark:text-slate-300">- {ev}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Confidence Bar */}
                          <div className="mb-4">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className={`${colors.bg.replace('100', '500')} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${insight.confidence}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleViewDetails(insight.id)}
                              className={`px-4 py-2 ${colors.bg.replace('100', '600')} text-white rounded-lg font-medium hover:shadow-lg transition-all`}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>

        {/* Market Sentiment */}
        {marketSentiment && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Market Sentiment</h3>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {getSentimentIcon(marketSentiment.overall)}
                </div>
                <p className={`text-2xl font-bold ${getSentimentColor(marketSentiment.overall)}`}>
                  {marketSentiment.overall === 'Bullish' ? 'Tăng giá' : marketSentiment.overall === 'Bearish' ? 'Giảm giá' : 'Trung lập'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  {marketSentiment.buySignalsCount > marketSentiment.sellSignalsCount
                    ? `${Math.round((marketSentiment.buySignalsCount / (marketSentiment.buySignalsCount + marketSentiment.sellSignalsCount + marketSentiment.holdSignalsCount)) * 100)}% tín hiệu tích cực`
                    : 'Tín hiệu hỗn hợp'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Risk Level</h3>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <AlertTriangle className={`w-12 h-12 ${getRiskColor(marketSentiment.riskLevel)}`} />
                </div>
                <p className={`text-2xl font-bold ${getRiskColor(marketSentiment.riskLevel)}`}>
                  {marketSentiment.riskLevel === 'High' ? 'Cao' : marketSentiment.riskLevel === 'Moderate' ? 'Trung bình' : 'Thấp'}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Volatility index: {marketSentiment.volatilityIndex}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Opportunities</h3>
              <div className="text-center">
              <div className="flex justify-center mb-2">
                <Star className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{marketSentiment.opportunitiesCount} Found</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Based on your criteria</p>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedInsight && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedInsight.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {selectedInsight.symbol} - {formatTimestamp(selectedInsight.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="rounded-md p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(selectedInsight.type).bg} ${getTypeColor(selectedInsight.type).text} uppercase`}>
                      {selectedInsight.type}
                    </span>
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-300">Confidence: {selectedInsight.confidence}%</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mô tả</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{selectedInsight.description}</p>
                  </div>

                  {selectedInsight.reasoning && selectedInsight.reasoning.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Lý do phân tích</h4>
                      <ul className="space-y-2">
                        {selectedInsight.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="text-emerald-600 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(selectedInsight.targetPrice || selectedInsight.stopLoss) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedInsight.targetPrice && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Giá mục tiêu</h4>
                          <p className="text-lg font-bold text-emerald-600">{selectedInsight.targetPrice.toLocaleString('vi-VN')} VND</p>
                        </div>
                      )}
                      {selectedInsight.stopLoss && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Cắt lỗ</h4>
                          <p className="text-lg font-bold text-rose-600">{selectedInsight.stopLoss.toLocaleString('vi-VN')} VND</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedInsight.evidence && selectedInsight.evidence.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Evidence</h4>
                      <ul className="space-y-2">
                        {selectedInsight.evidence.map((ev, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
