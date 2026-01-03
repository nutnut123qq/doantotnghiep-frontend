import { useState, useEffect } from 'react'
import { newsService, News } from '../services/newsService'
import { NewspaperIcon, SparklesIcon } from '@heroicons/react/24/outline'

export const NewsFeed = () => {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [summarizing, setSummarizing] = useState<string | null>(null)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)
      const data = await newsService.getNews(1, 10)
      setNews(data)
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async (newsId: string) => {
    try {
      setSummarizing(newsId)
      await newsService.requestSummarization(newsId)
      
      // Reload news to get updated summary
      setTimeout(async () => {
        const updatedNews = await newsService.getNewsById(newsId)
        setNews(prev => prev.map(n => n.id === newsId ? updatedNews : n))
        setSummarizing(null)
      }, 3000)
    } catch (error) {
      console.error('Error summarizing news:', error)
      setSummarizing(null)
    }
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50'
      case 'negative':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-slate-600 bg-slate-50'
    }
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return '📈'
      case 'negative':
        return '📉'
      default:
        return '➖'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <NewspaperIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Tin tức thị trường</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <NewspaperIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Tin tức thị trường</h3>
        </div>
        <button
          onClick={loadNews}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Làm mới
        </button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {news.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <NewspaperIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
            <p>Chưa có tin tức</p>
          </div>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              className="border-b border-slate-100 last:border-0 pb-4 last:pb-0 hover:bg-slate-50 p-3 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-900 hover:text-blue-600 line-clamp-2"
                  >
                    {item.title}
                  </a>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-2 line-clamp-2">{item.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span className="font-medium">{item.source}</span>
                  <span>•</span>
                  <span>{formatDate(item.publishedAt)}</span>
                  {item.sentiment && (
                    <>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                        {getSentimentIcon(item.sentiment)} {item.sentiment === 'positive' ? 'Tích cực' : item.sentiment === 'negative' ? 'Tiêu cực' : 'Trung lập'}
                      </span>
                    </>
                  )}
                </div>

                {!item.summary && (
                  <button
                    onClick={() => handleSummarize(item.id)}
                    disabled={summarizing === item.id}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>{summarizing === item.id ? 'Đang tóm tắt...' : 'Tóm tắt AI'}</span>
                  </button>
                )}
              </div>

              {item.summary && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start space-x-2">
                    <SparklesIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-900 mb-1">Tóm tắt AI:</p>
                      <p className="text-xs text-blue-800">{item.summary}</p>
                      {item.impactAssessment && (
                        <p className="text-xs text-blue-700 mt-2">
                          <span className="font-medium">Đánh giá tác động:</span> {item.impactAssessment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

