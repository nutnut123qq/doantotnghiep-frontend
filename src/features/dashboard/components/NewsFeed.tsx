import { useState, useEffect, useCallback, useRef } from 'react'
import { newsService, News, NewsQASource } from '../services/newsService'
import { Newspaper, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

const PAGE_SIZE = 10

export const NewsFeed = () => {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [inputPage, setInputPage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<NewsQASource[]>([])
  const [qaError, setQaError] = useState<string | null>(null)

  const isValidUrl = (str?: string) => {
    if (!str) return false
    try {
      const url = new URL(str)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const loadNews = useCallback(async (targetPage = page) => {
    try {
      setLoading(true)
      setError(null)
      const response = await newsService.getNews(targetPage, PAGE_SIZE)
      setNews(response.items)
      setTotalPages(response.totalPages)
      if (targetPage !== page) {
        setPage(targetPage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load news'
      setError(errorMessage)
      notify.error('Failed to load news', { silent: true }) // Silent to avoid double notification
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    loadNews()
  }, [loadNews])

  const goToPage = useCallback((newPage: number) => {
    if (newPage < 1 || (totalPages > 0 && newPage > totalPages)) return
    loadNews(newPage)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [loadNews, totalPages])

  const handleInputJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const num = parseInt(inputPage, 10)
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        goToPage(num)
        setInputPage('')
      }
    }
  }

  const handleAskQuestion = async () => {
    if (!question.trim()) return
    try {
      setAsking(true)
      setQaError(null)
      const result = await newsService.askQuestion(question.trim())
      setAnswer(result.answer)
      setSources(result.sources || [])
      setQuestion('')
    } catch (error) {
      setQaError('Không thể xử lý câu hỏi. Vui lòng thử lại.')
      setAnswer('')
      setSources([])
    } finally {
      setAsking(false)
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

  const getPageNumbers = () => {
    if (totalPages <= 0) return []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  if (loading) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6 border border-border h-full min-h-0 overflow-hidden flex flex-col">
        <div className="flex items-center space-x-3 mb-6 flex-shrink-0">
          <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-card-foreground">Tin tức</h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-2xl shadow-lg p-6 border border-border h-full min-h-0 overflow-hidden flex flex-col">
        <div className="flex items-center space-x-3 mb-6 flex-shrink-0">
          <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-card-foreground">Tin tức</h3>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <ErrorState message={error} onRetry={loadNews} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 border border-border h-full min-h-0 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Newspaper className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-card-foreground">Tin tức</h3>
        </div>
        <button
          type="button"
          onClick={() => loadNews()}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Làm mới
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4">
      {news.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-2 text-muted-foreground/30" />
          <p>Chưa có tin tức</p>
        </div>
      ) : (
        news.map((item) => (
          <div
            key={item.id}
            className="border-b border-border last:border-0 pb-3 last:pb-0 hover:bg-muted/80 p-3 rounded-lg transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-foreground hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                >
                  {item.title}
                </a>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {item.content || item.summary || ''}
            </p>

            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
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
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              className="flex items-center justify-center w-8 h-8 rounded-md text-sm text-blue-600 dark:text-blue-400 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              title="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => goToPage(num)}
                disabled={loading}
                className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  num === page
                    ? 'bg-blue-600 text-white'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="flex items-center justify-center w-8 h-8 rounded-md text-sm text-blue-600 dark:text-blue-400 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              title="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => goToPage(totalPages)}
              disabled={page >= totalPages || loading}
              className="flex items-center justify-center w-8 h-8 rounded-md text-sm text-blue-600 dark:text-blue-400 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              title="Trang cuối"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Trang <span className="font-medium text-foreground">{page}</span> / {totalPages}
            </span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              Đến trang
              <input
                type="text"
                inputMode="numeric"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value.replace(/\D/g, ''))}
                onKeyDown={handleInputJump}
                placeholder="#"
                className="w-10 px-1 py-0.5 text-center text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </span>
          </div>
        </div>
      )}

      <div className="pt-3 border-t border-border">
        <p className="text-xs font-medium text-foreground mb-2">Hỏi đáp AI theo tin tức</p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !asking && handleAskQuestion()}
            disabled={asking}
            placeholder="Đặt câu hỏi về diễn biến tin tức..."
            className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleAskQuestion}
            disabled={asking || !question.trim()}
            size="sm"
          >
            {asking ? 'Đang xử lý...' : 'Hỏi'}
          </Button>
        </div>

        {qaError && <p className="text-xs text-red-500 mt-2">{qaError}</p>}

        {asking && (
          <div
            className="mt-3 space-y-3 animate-pulse"
            aria-busy="true"
            aria-live="polite"
            aria-label="Đang tạo câu trả lởi AI"
          >
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="h-3.5 bg-blue-200/80 dark:bg-blue-800/60 rounded w-28 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-blue-200/60 dark:bg-blue-800/50 rounded w-full" />
                <div className="h-3 bg-blue-200/60 dark:bg-blue-800/50 rounded w-[94%]" />
                <div className="h-3 bg-blue-200/60 dark:bg-blue-800/50 rounded w-4/5" />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="h-3 bg-gray-200/80 dark:bg-gray-700/50 rounded w-36 mb-2" />
              <div className="h-2.5 bg-gray-200/70 dark:bg-gray-700/40 rounded w-full mb-1.5" />
              <div className="h-2.5 bg-gray-200/70 dark:bg-gray-700/40 rounded w-[88%]" />
            </div>
          </div>
        )}

        {!asking && answer && (
          <div className="mt-3 space-y-2">
            <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-200 mb-1">Trả lởi AI:</p>
              <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">{answer}</p>
            </div>

            {sources.length > 0 && (
              <div className="p-3 rounded-lg border border-border bg-muted">
                <p className="text-xs font-medium text-foreground mb-2">Nguồn tham khảo:</p>
                <ul className="space-y-1">
                  {sources.map((source, index) => (
                    <li key={`${source.title}-${index}`} className="text-xs text-muted-foreground">
                      {isValidUrl(source.url) ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          [{index + 1}] {source.title || source.url}
                        </a>
                      ) : (
                        <span>[{index + 1}] {source.title || 'News source'}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
