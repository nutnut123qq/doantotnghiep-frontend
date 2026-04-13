import { useState, useEffect, useCallback, type ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Loader2, RefreshCw } from 'lucide-react'
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
  EVENT_STATUS_LABELS as StatusLabels,
  parseEventStatus,
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
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

function statusBadgeVariant(
  status: EventStatus
): ComponentProps<typeof Badge>['variant'] {
  switch (status) {
    case Status.Upcoming:
      return 'success'
    case Status.Today:
      return 'info'
    case Status.Past:
      return 'secondary'
    case Status.Cancelled:
      return 'destructive'
    default:
      return 'outline'
  }
}

export default function EventsFeed() {
  const [events, setEvents] = useState<CorporateEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CorporateEvent | null>(null)

  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{
    eventId: string
    analysis: string
    impact: string
  } | null>(null)

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
      setQaError('Không thể trả lời (kiểm tra AI service và đăng nhập).')
    } finally {
      setQaLoading(false)
    }
  }

  const handleAnalyzeEvent = async (eventId: string) => {
    try {
      setAnalyzing(eventId)
      const result = await eventService.analyzeEvent(eventId)
      setAnalysisResult({ eventId, ...result })
    } catch (err) {
      console.error('Error analyzing event:', err)
    } finally {
      setAnalyzing(null)
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

  const renderStatusBadge = (event: CorporateEvent) => {
    const parsed = parseEventStatus(event.status)
    if (parsed === undefined) return null
    return (
      <Badge variant={statusBadgeVariant(parsed)} className="mt-2">
        {StatusLabels[parsed]}
      </Badge>
    )
  }

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
          actions={
            <>
              <Button variant="outline" asChild>
                <Link to="/events/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Lịch
                </Link>
              </Button>
              <Button
                variant="default"
                className="gap-2"
                onClick={() => loadEvents(appliedFilters)}
              >
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>
            </>
          }
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
              Hỏi AI về sự kiện (RAG)
            </CardTitle>
            <CardDescription>
              Dựa trên sự kiện đã lưu (crawl + RSS). Nhập mã và câu hỏi tiếng
              Việt hoặc Anh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="qa-symbol">Mã CK</Label>
                <Input
                  id="qa-symbol"
                  value={qaSymbol}
                  onChange={(e) => setQaSymbol(e.target.value.toUpperCase())}
                  placeholder="VD: FPT"
                />
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
            {qaResult && (
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
                  description="Thử đổi bộ lọc hoặc làm mới sau khi backend đã thu thập dữ liệu."
                />
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card
                key={event.id}
                className={cn(
                  'cursor-pointer transition-shadow hover:shadow-md'
                )}
                onClick={() => setSelectedEvent(event)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[hsl(var(--text))]">
                          {event.stockTicker?.symbol || 'N/A'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {event.stockTicker?.name}
                        </span>
                      </div>
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
                      <p className="text-xs text-muted-foreground">
                        {eventService.getRelativeTime(event.eventDate)}
                      </p>
                      {renderStatusBadge(event)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog
          open={!!selectedEvent}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedEvent(null)
              setAnalysisResult(null)
            }
          }}
        >
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle className="pr-8 text-left text-xl">
                    {selectedEvent.title}
                  </DialogTitle>
                  <p className="text-left text-sm text-muted-foreground">
                    {selectedEvent.stockTicker?.symbol} —{' '}
                    {selectedEvent.stockTicker?.name}
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--text))]">
                      Ngày:{' '}
                      {eventService.formatEventDate(selectedEvent.eventDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {eventService.getRelativeTime(selectedEvent.eventDate)}
                    </p>
                    {renderStatusBadge(selectedEvent)}
                  </div>
                  {selectedEvent.description && (
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-[hsl(var(--text))]">
                        Mô tả
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                  {renderEventDetails(selectedEvent)}
                  {selectedEvent.sourceUrl && (
                    <div>
                      <a
                        href={selectedEvent.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Xem nguồn chính thức →
                      </a>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <Button
                      onClick={() => handleAnalyzeEvent(selectedEvent.id)}
                      disabled={analyzing === selectedEvent.id}
                    >
                      {analyzing === selectedEvent.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang phân tích…
                        </>
                      ) : (
                        'Phân tích bằng AI'
                      )}
                    </Button>
                    {analysisResult?.eventId === selectedEvent.id && (
                      <Card className="mt-3 border bg-muted/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Kết quả AI
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <p className="whitespace-pre-wrap text-[hsl(var(--text))]">
                            {analysisResult.analysis}
                          </p>
                          <div className="border-t pt-2 text-muted-foreground">
                            <strong className="text-[hsl(var(--text))]">
                              Tác động:
                            </strong>{' '}
                            <span className="whitespace-pre-wrap">
                              {analysisResult.impact}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
