import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar as CalendarIcon, List, Loader2, RefreshCw } from 'lucide-react'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS as enUSLocale } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { eventService } from '../services/eventService'
import type { CorporateEvent, CorporateEventType } from '@/shared/types/eventTypes'
import {
  CorporateEventType as EventType,
  EVENT_TYPE_LABELS as TypeLabels,
  EVENT_TYPE_COLORS as TypeColors,
  isEarningsEvent,
  isDividendEvent,
  isStockSplitEvent,
  isAGMEvent,
  isRightsIssueEvent,
} from '@/shared/types/eventTypes'
import { PageHeader } from '@/shared/components/PageHeader'
import { ErrorState } from '@/shared/components/ErrorState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const locales = {
  'en-US': enUSLocale,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: CorporateEvent
}

export default function EventsCalendar() {
  const [events, setEvents] = useState<CorporateEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CorporateEvent | null>(null)
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  const getViewStartDate = useCallback(
    (currentDate: Date, currentView: View): Date => {
      const dateCopy = new Date(currentDate)

      if (currentView === 'month') {
        dateCopy.setDate(1)
        dateCopy.setDate(dateCopy.getDate() - 7)
      } else if (currentView === 'week') {
        const day = dateCopy.getDay()
        dateCopy.setDate(dateCopy.getDate() - day)
      } else if (currentView === 'day') {
        dateCopy.setHours(0, 0, 0, 0)
      } else if (currentView === 'agenda') {
        dateCopy.setHours(0, 0, 0, 0)
      }

      return dateCopy
    },
    []
  )

  const getViewEndDate = useCallback(
    (currentDate: Date, currentView: View): Date => {
      const dateCopy = new Date(currentDate)

      if (currentView === 'month') {
        dateCopy.setMonth(dateCopy.getMonth() + 1, 0)
        dateCopy.setDate(dateCopy.getDate() + 14)
      } else if (currentView === 'week') {
        const day = dateCopy.getDay()
        dateCopy.setDate(dateCopy.getDate() + (6 - day))
      } else if (currentView === 'day') {
        dateCopy.setHours(23, 59, 59, 999)
      } else if (currentView === 'agenda') {
        dateCopy.setDate(dateCopy.getDate() + 30)
      }

      return dateCopy
    },
    []
  )

  const loadEvents = useCallback(
    async (currentDate: Date, currentView: View) => {
      try {
        setLoading(true)
        setError(null)

        const startDate = getViewStartDate(currentDate, currentView)
        const endDate = getViewEndDate(currentDate, currentView)

        const data = await eventService.getEventsByDateRange(
          startDate.toISOString(),
          endDate.toISOString()
        )
        setEvents(data)
      } catch (err) {
        console.error('Error loading events:', err)
        setError('Failed to load events. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [getViewStartDate, getViewEndDate]
  )

  useEffect(() => {
    loadEvents(date, view)
  }, [date, view, loadEvents])

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: `${event.stockTicker?.symbol || 'N/A'} - ${event.title}`,
      start: new Date(event.eventDate),
      end: new Date(event.eventDate),
      resource: event,
    }))
  }, [events])

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventType = event.resource.eventType
    const colorClass = TypeColors[eventType] || 'bg-gray-500'
    const colorMap: Record<string, string> = {
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#22c55e',
      'bg-purple-500': '#a855f7',
      'bg-orange-500': '#f97316',
      'bg-pink-500': '#ec4899',
      'bg-gray-500': '#6b7280',
    }

    return {
      style: {
        backgroundColor: colorMap[colorClass] || '#6b7280',
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0',
        display: 'block',
        fontSize: '0.875rem',
        padding: '2px 5px',
      },
    }
  }

  const handleSelectEvent = (calEvent: CalendarEvent) => {
    setSelectedEvent(calEvent.resource)
  }

  const handleNavigate = (newDate: Date) => {
    setDate(newDate)
  }

  const handleViewChange = (newView: View) => {
    setView(newView)
  }

  const getEventTypeColor = (type: CorporateEventType): string => {
    return TypeColors[type] || 'bg-gray-500'
  }

  const getEventTypeLabel = (type: CorporateEventType): string => {
    return TypeLabels[type] || 'Unknown'
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
          {event.exDividendDate && (
            <p>
              <strong className="text-[hsl(var(--text))]">Ex-Date:</strong>{' '}
              {eventService.formatEventDate(event.exDividendDate)}
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
        </div>
      )
    }

    if (isRightsIssueEvent(event)) {
      return (
        <div className={detailClass}>
          <p>
            <strong className="text-[hsl(var(--text))]">Issue Price:</strong>{' '}
            {event.issuePrice?.toLocaleString() || 'N/A'} VND
          </p>
        </div>
      )
    }

    return null
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
            onRetry={() => loadEvents(date, view)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Lịch sự kiện"
          description="Xem sự kiện doanh nghiệp theo tháng, tuần hoặc ngày"
          actions={
            <>
              <Button variant="outline" asChild>
                <Link to="/events">
                  <List className="mr-2 h-4 w-4" />
                  Danh sách
                </Link>
              </Button>
              <Button
                variant="default"
                className="gap-2"
                onClick={() => loadEvents(date, view)}
              >
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>
            </>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarIcon className="h-5 w-5" />
              Loại sự kiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.values(EventType)
                .filter((v) => typeof v === 'number')
                .map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-3 w-3 shrink-0 rounded',
                        getEventTypeColor(type as CorporateEventType)
                      )}
                    />
                    <span className="text-sm text-muted-foreground">
                      {getEventTypeLabel(type as CorporateEventType)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="calendar-container">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                view={view}
                onView={handleViewChange}
                date={date}
                onNavigate={handleNavigate}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                popup
                selectable
              />
            </div>
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedEvent}
          onOpenChange={(open) => {
            if (!open) setSelectedEvent(null)
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
                  <Badge variant="outline" className="gap-2">
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        getEventTypeColor(selectedEvent.eventType)
                      )}
                    />
                    {getEventTypeLabel(selectedEvent.eventType)}
                  </Badge>
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--text))]">
                      Ngày:{' '}
                      {eventService.formatEventDate(selectedEvent.eventDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {eventService.getRelativeTime(selectedEvent.eventDate)}
                    </p>
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
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
