import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS as enUSLocale } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { eventService } from '../services/eventService'
import type {
  CorporateEvent,
  CorporateEventType,
} from '../../../shared/types/eventTypes'
import {
  CorporateEventType as EventType,
  EVENT_TYPE_LABELS as TypeLabels,
  EVENT_TYPE_COLORS as TypeColors,
  isEarningsEvent,
  isDividendEvent,
  isStockSplitEvent,
  isAGMEvent,
  isRightsIssueEvent,
} from '../../../shared/types/eventTypes'

// Configure date-fns localizer
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

// Calendar event interface
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

  const getViewStartDate = useCallback((currentDate: Date, currentView: View): Date => {
    const dateCopy = new Date(currentDate)
    
    if (currentView === 'month') {
      // Start of month minus 7 days (to include previous month's visible dates)
      dateCopy.setDate(1)
      dateCopy.setDate(dateCopy.getDate() - 7)
    } else if (currentView === 'week') {
      // Start of week
      const day = dateCopy.getDay()
      dateCopy.setDate(dateCopy.getDate() - day)
    } else if (currentView === 'day') {
      // Current day
      dateCopy.setHours(0, 0, 0, 0)
    } else if (currentView === 'agenda') {
      // Current date
      dateCopy.setHours(0, 0, 0, 0)
    }
    
    return dateCopy
  }, [])

  const getViewEndDate = useCallback((currentDate: Date, currentView: View): Date => {
    const dateCopy = new Date(currentDate)
    
    if (currentView === 'month') {
      // End of month plus 14 days (to include next month's visible dates)
      dateCopy.setMonth(dateCopy.getMonth() + 1, 0)
      dateCopy.setDate(dateCopy.getDate() + 14)
    } else if (currentView === 'week') {
      // End of week
      const day = dateCopy.getDay()
      dateCopy.setDate(dateCopy.getDate() + (6 - day))
    } else if (currentView === 'day') {
      // End of day
      dateCopy.setHours(23, 59, 59, 999)
    } else if (currentView === 'agenda') {
      // 30 days from current date
      dateCopy.setDate(dateCopy.getDate() + 30)
    }
    
    return dateCopy
  }, [])

  const loadEvents = useCallback(async (currentDate: Date, currentView: View) => {
    try {
      setLoading(true)
      setError(null)

      // Get events for current view range
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
  }, [getViewStartDate, getViewEndDate])

  useEffect(() => {
    loadEvents(date, view)
  }, [date, view, loadEvents])

  // Convert CorporateEvents to Calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return events.map((event) => ({
      id: event.id,
      title: `${event.stockTicker?.symbol || 'N/A'} - ${event.title}`,
      start: new Date(event.eventDate),
      end: new Date(event.eventDate),
      resource: event,
    }))
  }, [events])

  // Custom event style based on event type
  const eventStyleGetter = (event: CalendarEvent) => {
    const eventType = event.resource.eventType
    const colorClass = TypeColors[eventType] || 'bg-gray-500'
    
    // Extract Tailwind color to inline style
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

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource)
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
    if (isEarningsEvent(event)) {
      return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Period:</strong> {event.period || 'N/A'}</p>
          <p><strong>Year:</strong> {event.year || 'N/A'}</p>
          {event.eps && <p><strong>EPS:</strong> {event.eps}</p>}
        </div>
      )
    }
    
    if (isDividendEvent(event)) {
      return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Dividend/Share:</strong> {event.dividendPerShare || 'N/A'}</p>
          {event.exDividendDate && <p><strong>Ex-Date:</strong> {eventService.formatEventDate(event.exDividendDate)}</p>}
        </div>
      )
    }
    
    if (isStockSplitEvent(event)) {
      return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Split Ratio:</strong> {event.splitRatio || 'N/A'}</p>
          <p><strong>Type:</strong> {event.isReverseSplit ? 'Reverse Split' : 'Forward Split'}</p>
        </div>
      )
    }
    
    if (isAGMEvent(event)) {
      return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Year:</strong> {event.year || 'N/A'}</p>
          {event.location && <p><strong>Location:</strong> {event.location}</p>}
        </div>
      )
    }
    
    if (isRightsIssueEvent(event)) {
      return (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Issue Price:</strong> {event.issuePrice?.toLocaleString() || 'N/A'} VND</p>
        </div>
      )
    }
    
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => loadEvents(date, view)}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Events Calendar</h2>
        <div className="flex gap-2">
          <Link
            to="/events"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            List View
          </Link>
          <button
            onClick={() => loadEvents(date, view)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Event Types</h3>
        <div className="flex flex-wrap gap-3">
          {Object.values(EventType).filter(v => typeof v === 'number').map((type) => (
            <div key={type} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded ${getEventTypeColor(type as CorporateEventType)}`}></span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {getEventTypeLabel(type as CorporateEventType)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 calendar-container">
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedEvent.stockTicker?.symbol} - {selectedEvent.stockTicker?.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className={`px-3 py-1 text-sm font-semibold text-white rounded ${getEventTypeColor(selectedEvent.eventType)}`}>
                    {getEventTypeLabel(selectedEvent.eventType)}
                  </span>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Date: {eventService.formatEventDate(selectedEvent.eventDate)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {eventService.getRelativeTime(selectedEvent.eventDate)}
                  </p>
                </div>

                {selectedEvent.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedEvent.description}</p>
                  </div>
                )}

                {renderEventDetails(selectedEvent)}

                {selectedEvent.sourceUrl && (
                  <div>
                    <a
                      href={selectedEvent.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View Official Source →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .calendar-container .rbc-calendar {
          color: var(--text-color, #1f2937);
          background: var(--bg-color, white);
        }
        
        .calendar-container .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          color: #4b5563;
        }
        
        .calendar-container .rbc-today {
          background-color: #dbeafe;
        }
        
        .calendar-container .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        
        .calendar-container .rbc-event {
          cursor: pointer;
        }
        
        .calendar-container .rbc-event:hover {
          opacity: 1;
        }
        
        .calendar-container .rbc-toolbar button {
          color: #374151;
          border: 1px solid #d1d5db;
          background: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
        }
        
        .calendar-container .rbc-toolbar button:hover {
          background-color: #f3f4f6;
        }
        
        .calendar-container .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  )
}
