import { useState, useEffect, useCallback } from 'react'
import { newsService, News } from '../services/newsService'
import { Newspaper, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ErrorState } from '@/shared/components/ErrorState'
import { notify } from '@/shared/utils/notify'

// Move formatDate outside component to avoid recreation on each render
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

export const NewsFeed = () => {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summarizing, setSummarizing] = useState<string | null>(null)

  const loadNews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await newsService.getNews(1, 10)
      setNews(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load news'
      setError(errorMessage)
      notify.error('Failed to load news', { silent: true }) // Silent to avoid double notification
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  const handleSummarize = async (newsId: string) => {
    try {
      setSummarizing(newsId)
      await newsService.requestSummarization(newsId)
      
      // Reload news to get updated summary (reduced timeout for sync processing)
      setTimeout(async () => {
        const updatedNews = await newsService.getNewsById(newsId)
        setNews(prev => prev.map(n => n.id === newsId ? updatedNews : n))
        setSummarizing(null)
      }, 1000)
    } catch (error) {
      notify.error('Failed to summarize news article')
      setSummarizing(null)
    }
  }

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return (
          <Badge className="bg-[hsl(var(--positive))] text-[hsl(var(--positive-foreground))]">
            Positive
          </Badge>
        )
      case 'negative':
        return (
          <Badge className="bg-[hsl(var(--negative))] text-[hsl(var(--negative-foreground))]">
            Negative
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[hsl(var(--muted))]">
            Neutral
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-[hsl(var(--surface-2))] rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-[hsl(var(--surface-2))] rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={loadNews}
      />
    )
  }

  return (
    <div className="space-y-3">
      {news.length === 0 ? (
        <div className="text-center py-8 text-[hsl(var(--muted))]">
          <Newspaper className="h-12 w-12 mx-auto mb-2 text-[hsl(var(--muted))] opacity-30" />
          <p>Chưa có tin tức</p>
        </div>
      ) : (
        news.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="border-b border-[hsl(var(--border))] last:border-0 pb-3 last:pb-0 hover:bg-[hsl(var(--surface-2))] p-3 rounded-lg transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[hsl(var(--text))] hover:text-[hsl(var(--accent))] line-clamp-2"
                >
                  {item.title}
                </a>
              </div>
            </div>

            <p className="text-xs text-[hsl(var(--muted))] mb-2 line-clamp-2">{item.content}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-[hsl(var(--muted))]">
                <span className="font-medium">{item.source}</span>
                <span>•</span>
                <span>{formatDate(item.publishedAt)}</span>
                {item.sentiment && (
                  <>
                    <span>•</span>
                    {getSentimentBadge(item.sentiment)}
                  </>
                )}
              </div>

              {!item.summary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSummarize(item.id)}
                  disabled={summarizing === item.id}
                  className="h-7 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  <span>{summarizing === item.id ? 'Đang tóm tắt...' : 'Tóm tắt AI'}</span>
                </Button>
              )}
            </div>

            {item.summary && (
              <div className="mt-3 p-3 bg-[hsl(var(--surface-2))] rounded-lg border border-[hsl(var(--border))]">
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-4 w-4 text-[hsl(var(--accent))] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[hsl(var(--text))] mb-1">Tóm tắt AI:</p>
                    <p className="text-xs text-[hsl(var(--muted))]">{item.summary}</p>
                    {item.impactAssessment && (
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            item.sentiment === 'positive'
                              ? 'border-[hsl(var(--positive))] text-[hsl(var(--positive))]'
                              : item.sentiment === 'negative'
                              ? 'border-[hsl(var(--negative))] text-[hsl(var(--negative))]'
                              : ''
                          )}
                        >
                          Impact: {item.impactAssessment}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

