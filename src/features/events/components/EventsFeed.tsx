import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { eventService } from '../services/eventService'
import type {
  CorporateEvent,
  CorporateEventType,
  EventStatus,
  EventFilterParams,
} from '@/shared/types/eventTypes'
import {
  CorporateEventType as EventType,
  EventStatus as Status,
  isEarningsEvent,
  isDividendEvent,
  isStockSplitEvent,
  isAGMEvent,
  isRightsIssueEvent,
} from '@/shared/types/eventTypes'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useSymbols } from '@/features/dashboard/hooks/useSymbols'

function getQaErrorMessage(error: unknown): string {
  const fallback = 'Không thể trả lời. Vui lòng thử lại sau.'
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data as
    | { error?: string; message?: string; detail?: string }
    | undefined

  const message = data?.message?.trim() || data?.error?.trim() || data?.detail?.trim()
  return message || fallback
}

export default function EventsFeed() {
  const [events, setEvents] = useState<CorporateEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [symbolFilter, setSymbolFilter] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<
    CorporateEventType | undefined
  >()
  const [statusFilter, setStatusFilter] = useState<EventStatus | undefined>()
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    startDate?: string
    endDate?: string
  }>({})

  const [appliedFilters, setAppliedFilters] = useState<EventFilterParams>({})

  const [qaSymbol, setQaSymbol] = useState('')
  const qaSymbolFieldRef = useRef<HTMLDivElement>(null)
  const [isQaSymbolDropdownOpen, setIsQaSymbolDropdownOpen] = useState(false)
  const { symbols, isLoading: isLoadingQaSymbols } = useSymbols()
  const [qaQuestion, setQaQuestion] = useState('')
  const [qaLoading, setQaLoading] = useState(false)
  const [qaError, setQaError] = useState<string | null>(null)
  const [qaResult, setQaResult] = useState<{
    answer: string
    sources: Array<{ title: string; url?: string | null; sourceType: string }>
  } | null>(null)

  const loadEvents = useCallback(async (filters: EventFilterParams) => {
    try {
      setLoading(true)
      setError(null)

      const data = await eventService.getEvents(filters)
      setEvents(data)
    } catch (err) {
      console.error('Error loading events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents(appliedFilters)
  }, [appliedFilters, loadEvents])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        qaSymbolFieldRef.current &&
        !qaSymbolFieldRef.current.contains(event.target as Node)
      ) {
        setIsQaSymbolDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredQaSymbols = useMemo(() => {
    const query = qaSymbol.trim().toLowerCase()
    if (!query) return symbols.slice(0, 10)
    const startsWithMatches = symbols.filter((stock) =>
      stock.symbol.toLowerCase().startsWith(query)
    )
    const containsMatches = symbols.filter(
      (stock) =>
        !stock.symbol.toLowerCase().startsWith(query) &&
        (stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query))
    )
    return [...startsWithMatches, ...containsMatches].slice(0, 10)
  }, [qaSymbol, symbols])

  const applyFilters = useCallback(() => {
    setAppliedFilters({
      symbol: symbolFilter || undefined,
      eventType: eventTypeFilter,
      status: statusFilter,
      startDate: dateRangeFilter.startDate,
      endDate: dateRangeFilter.endDate,
    })
  }, [symbolFilter, eventTypeFilter, statusFilter, dateRangeFilter])

  const clearFilters = useCallback(() => {
    setSymbolFilter('')
    setEventTypeFilter(undefined)
    setStatusFilter(undefined)
    setDateRangeFilter({})
    setAppliedFilters({})
  }, [])

  const handleEventsQa = async () => {
    const sym = qaSymbol.trim().toUpperCase()
    const q = qaQuestion.trim()
    if (!sym || !q) {
      setQaError('Nhập mã cổ phiếu và câu hỏi.')
      return
    }
    setQaLoading(true)
    setQaError(null)
    setQaResult(null)
    try {
      const data = await eventService.askEventsQuestion({
        symbol: sym,
        question: q,
        days: 90,
        topK: 6,
      })
      setQaResult({
        answer: data.answer,
        sources: data.sources ?? [],
      })
    } catch (e) {
      console.error('Events Q&A failed:', e)
      setQaError(getQaErrorMessage(e))
    } finally {
      setQaLoading(false)
    }
  }

  const renderEventDetails = (event: CorporateEvent) => {
    const detailClass = 'mt-2 text-sm text-muted-foreground'
    if (isEarningsEvent(event)) {
      return (
        <div className={detailClass}>
          <p>
            <strong className="text-[hsl(var(--text))]">Period:</strong>{' '}
            {event.period || 'N/A'}
          </p>
          <p>
            <strong className="text-[hsl(var(--text))]">Year:</strong>{' '}
            {event.year || 'N/A'}
          </p>
          {event.eps && (
            <p>
              <strong className="text-[hsl(var(--text))]">EPS:</strong>{' '}
              {event.eps}
            </p>
          )}
          {event.revenue && (
            <p>
              <strong className="text-[hsl(var(--text))]">Revenue:</strong>{' '}
              {event.revenue.toLocaleString()} VND
            </p>
          )}
        </div>
      )
    }

    if (isDividendEvent(event)) {
      return (
        <div className={detailClass}>
          <p>
            <strong className="text-[hsl(var(--text))]">Dividend/Share:</strong>{' '}
            {event.dividendPerShare || 'N/A'}
          </p>
          {event.cashDividend && (
            <p>
              <strong className="text-[hsl(var(--text))]">Cash:</strong>{' '}
              {event.cashDividend.toLocaleString()} VND
            </p>
          )}
          {event.exDividendDate && (
            <p>
              <strong className="text-[hsl(var(--text))]">Ex-Date:</strong>{' '}
              {eventService.formatEventDate(event.exDividendDate)}
            </p>
          )}
          {event.paymentDate && (
            <p>
              <strong className="text-[hsl(var(--text))]">Payment:</strong>{' '}
              {eventService.formatEventDate(event.paymentDate)}
            </p>
          )}
        </div>
      )
    }

    if (isStockSplitEvent(event)) {
      return (
        <div className={detailClass}>
          <p>
            <strong className="text-[hsl(var(--text))]">Split Ratio:</strong>{' '}
            {event.splitRatio || 'N/A'}
          </p>
          <p>
            <strong className="text-[hsl(var(--text))]">Type:</strong>{' '}
            {event.isReverseSplit ? 'Reverse Split' : 'Forward Split'}
          </p>
          <p>
            <strong className="text-[hsl(var(--text))]">Effective:</strong>{' '}
            {eventService.formatEventDate(event.effectiveDate)}
          </p>
        </div>
      )
    }

    if (isAGMEvent(event)) {
      return (
        <div className={detailClass}>
          <p>
            <strong className="text-[hsl(var(--text))]">Year:</strong>{' '}
            {event.year || 'N/A'}
          </p>
          {event.location && (
            <p>
              <strong className="text-[hsl(var(--text))]">Location:</strong>{' '}
              {event.location}
            </p>
          )}
          {event.meetingTime && (
            <p>
              <strong className="text-[hsl(var(--text))]">Time:</strong>{' '}
              {event.meetingTime}
            </p>
          )}
        </div>
      )
    }

    if (isRightsIssueEvent(event)) {
      return (
        <div className={detailClass}>
          <p>
            <strong className="text-[hsl(var(--text))]">Shares:</strong>{' '}
            {event.numberOfShares?.toLocaleString() || 'N/A'}
          </p>
          <p>
            <strong className="text-[hsl(var(--text))]">Price:</strong>{' '}
            {event.issuePrice?.toLocaleString() || 'N/A'} VND
          </p>
          {event.rightsRatio && (
            <p>
              <strong className="text-[hsl(var(--text))]">Ratio:</strong>{' '}
              {event.rightsRatio}
            </p>
          )}
        </div>
      )
    }

    return null
  }

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      ),
    [events]
  )

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <ErrorState
            message={error}
            onRetry={() => loadEvents(appliedFilters)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Sự kiện doanh nghiệp"
          description="Theo dõi lịch công bố, cổ tức, ĐHĐCĐ và các sự kiện quan trọng"
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="symbol-filter">Mã CK</Label>
                <Input
                  id="symbol-filter"
                  value={symbolFilter}
                  onChange={(e) =>
                    setSymbolFilter(e.target.value.toUpperCase())
                  }
                  placeholder="VD: VNM"
                />
              </div>
              <div className="space-y-2">
                <Label>Loại sự kiện</Label>
                <Select
                  value={
                    eventTypeFilter === undefined
                      ? 'all'
                      : String(eventTypeFilter)
                  }
                  onValueChange={(v) =>
                    setEventTypeFilter(
                      v === 'all'
                        ? undefined
                        : (Number(v) as CorporateEventType)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value={String(EventType.Earnings)}>
                      Earnings
                    </SelectItem>
                    <SelectItem value={String(EventType.Dividend)}>
                      Dividend
                    </SelectItem>
                    <SelectItem value={String(EventType.StockSplit)}>
                      Stock Split
                    </SelectItem>
                    <SelectItem value={String(EventType.AGM)}>AGM</SelectItem>
                    <SelectItem value={String(EventType.RightsIssue)}>
                      Rights Issue
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={
                    statusFilter === undefined ? 'all' : String(statusFilter)
                  }
                  onValueChange={(v) =>
                    setStatusFilter(
                      v === 'all' ? undefined : (Number(v) as EventStatus)
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value={String(Status.Upcoming)}>
                      Upcoming
                    </SelectItem>
                    <SelectItem value={String(Status.Today)}>Today</SelectItem>
                    <SelectItem value={String(Status.Past)}>Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button className="flex-1" onClick={applyFilters}>
                  Áp dụng
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Xóa lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Hỏi AI về sự kiện
            </CardTitle>
            <CardDescription>
              Dựa trên sự kiện đã lưu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2 relative" ref={qaSymbolFieldRef}>
                <Label htmlFor="qa-symbol">Mã CK</Label>
                <Input
                  id="qa-symbol"
                  value={qaSymbol}
                  autoComplete="off"
                  onChange={(e) => {
                    setQaSymbol(e.target.value.toUpperCase())
                    setIsQaSymbolDropdownOpen(true)
                  }}
                  onFocus={() => setIsQaSymbolDropdownOpen(true)}
                  placeholder={
                    isLoadingQaSymbols ? 'Đang tải mã…' : 'Gõ hoặc chọn mã (VD: FPT)'
                  }
                />
                {isQaSymbolDropdownOpen && (
                  <div
                    className={cn(
                      'absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto',
                      'rounded-md border bg-popover text-popover-foreground shadow-md'
                    )}
                  >
                    {isLoadingQaSymbols ? (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        Đang tải danh sách mã…
                      </div>
                    ) : filteredQaSymbols.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-muted-foreground">
                        Không có mã phù hợp
                      </div>
                    ) : (
                      filteredQaSymbols.map((stock) => (
                        <button
                          key={stock.symbol}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setQaSymbol(stock.symbol)
                            setIsQaSymbolDropdownOpen(false)
                          }}
                        >
                          <div className="text-sm font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {stock.name}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleEventsQa}
                  disabled={qaLoading}
                >
                  {qaLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang trả lời…
                    </>
                  ) : (
                    'Gửi câu hỏi'
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qa-question">Câu hỏi</Label>
              <Textarea
                id="qa-question"
                value={qaQuestion}
                onChange={(e) => setQaQuestion(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Gần đây có sự kiện cổ tức nào không?"
              />
            </div>
            {qaError && (
              <p className="text-sm text-destructive">{qaError}</p>
            )}
            {qaLoading && (
              <div
                className="space-y-3 animate-pulse"
                aria-busy="true"
                aria-live="polite"
                aria-label="Đang tạo câu trả lời AI"
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
            {!qaLoading && qaResult && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="text-sm text-[hsl(var(--text))] whitespace-pre-wrap">
                  {qaResult.answer}
                </p>
                {qaResult.sources.length > 0 && (
                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <p className="font-medium text-[hsl(var(--text))] mb-1">
                      Nguồn tham chiếu
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      {qaResult.sources.map((s, i) => (
                        <li key={i}>
                          {s.url ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {s.title}
                            </a>
                          ) : (
                            s.title
                          )}
                          <span className="text-muted-foreground">
                            {' '}
                            ({s.sourceType})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {events.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  title="Chưa có sự kiện"
                  description="Thử đổi bộ lọc hoặc quay lại sau khi backend đã thu thập dữ liệu."
                />
              </CardContent>
            </Card>
          ) : (
            sortedEvents.map((event) => (
              <Card key={event.id} className={cn('transition-shadow')}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-sm font-semibold text-[hsl(var(--text))]">
                        {event.stockTicker?.symbol || 'N/A'}
                      </p>
                      <h3 className="mb-1 text-lg font-semibold text-[hsl(var(--text))]">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="mb-2 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {renderEventDetails(event)}
                      {event.sourceUrl && (
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Xem nguồn →
                        </a>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[hsl(var(--text))]">
                        {eventService.formatEventDate(event.eventDate)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
