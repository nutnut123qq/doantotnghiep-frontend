import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { eventService } from '../services/eventService'
import type {
  CorporateEvent,
  CorporateEventType,
  EventStatus,
  EventFilterParams,
} from '../../../shared/types/eventTypes'
import {
  CorporateEventType as EventType,
  EventStatus as Status,
  EVENT_TYPE_LABELS as TypeLabels,
  EVENT_TYPE_COLORS as TypeColors,
  EVENT_STATUS_LABELS as StatusLabels,
} from '../../../shared/types/eventTypes'

export default function EventsFeed() {
  const [events, setEvents] = useState<CorporateEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CorporateEvent | null>(null)

  // Filter states
  const [symbolFilter, setSymbolFilter] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<CorporateEventType | undefined>()
  const [statusFilter, setStatusFilter] = useState<EventStatus | undefined>()
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    startDate?: string
    endDate?: string
  }>({})

  useEffect(() => {
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolFilter, eventTypeFilter, statusFilter, dateRangeFilter])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: EventFilterParams = {
        symbol: symbolFilter || undefined,
        eventType: eventTypeFilter,
        status: statusFilter,
        startDate: dateRangeFilter.startDate,
        endDate: dateRangeFilter.endDate,
      }

      const data = await eventService.getEvents(filters)
      setEvents(data)
    } catch (err) {
      console.error('Error loading events:', err)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSymbolFilter('')
    setEventTypeFilter(undefined)
    setStatusFilter(undefined)
    setDateRangeFilter({})
  }

  const getEventTypeColor = (type: CorporateEventType): string => {
    return TypeColors[type] || 'bg-gray-500'
  }

  const getEventTypeLabel = (type: CorporateEventType): string => {
    return TypeLabels[type] || 'Unknown'
  }

  const getEventStatusLabel = (status: EventStatus): string => {
    return StatusLabels[status] || 'Unknown'
  }

  const renderEventDetails = (event: CorporateEvent) => {
    switch (event.eventType) {
      case EventType.Earnings:
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Period:</strong> {(event as any).period || 'N/A'}</p>
            <p><strong>Year:</strong> {(event as any).year || 'N/A'}</p>
            {(event as any).eps && <p><strong>EPS:</strong> {(event as any).eps}</p>}
            {(event as any).revenue && <p><strong>Revenue:</strong> {(event as any).revenue.toLocaleString()} VND</p>}
          </div>
        )
      
      case EventType.Dividend:
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Dividend/Share:</strong> {(event as any).dividendPerShare || 'N/A'}</p>
            {(event as any).cashDividend && <p><strong>Cash:</strong> {(event as any).cashDividend.toLocaleString()} VND</p>}
            {(event as any).exDividendDate && <p><strong>Ex-Date:</strong> {eventService.formatEventDate((event as any).exDividendDate)}</p>}
            {(event as any).paymentDate && <p><strong>Payment:</strong> {eventService.formatEventDate((event as any).paymentDate)}</p>}
          </div>
        )
      
      case EventType.StockSplit:
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Split Ratio:</strong> {(event as any).splitRatio || 'N/A'}</p>
            <p><strong>Type:</strong> {(event as any).isReverseSplit ? 'Reverse Split' : 'Forward Split'}</p>
            <p><strong>Effective:</strong> {eventService.formatEventDate((event as any).effectiveDate)}</p>
          </div>
        )
      
      case EventType.AGM:
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Year:</strong> {(event as any).year || 'N/A'}</p>
            {(event as any).location && <p><strong>Location:</strong> {(event as any).location}</p>}
            {(event as any).meetingTime && <p><strong>Time:</strong> {(event as any).meetingTime}</p>}
          </div>
        )
      
      case EventType.RightsIssue:
        return (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Shares:</strong> {(event as any).numberOfShares?.toLocaleString() || 'N/A'}</p>
            <p><strong>Price:</strong> {(event as any).issuePrice?.toLocaleString() || 'N/A'} VND</p>
            {(event as any).rightsRatio && <p><strong>Ratio:</strong> {(event as any).rightsRatio}</p>}
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadEvents}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Corporate Events</h2>
        <div className="flex gap-2">
          <Link
            to="/events/calendar"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Calendar View
          </Link>
          <button
            onClick={loadEvents}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Symbol Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={symbolFilter}
              onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
              placeholder="e.g., VNM"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Type
            </label>
            <select
              value={eventTypeFilter ?? ''}
              onChange={(e) => setEventTypeFilter(e.target.value ? Number(e.target.value) as CorporateEventType : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              <option value={EventType.Earnings}>Earnings</option>
              <option value={EventType.Dividend}>Dividend</option>
              <option value={EventType.StockSplit}>Stock Split</option>
              <option value={EventType.AGM}>AGM</option>
              <option value={EventType.RightsIssue}>Rights Issue</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter ?? ''}
              onChange={(e) => setStatusFilter(e.target.value ? Number(e.target.value) as EventStatus : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value={Status.Upcoming}>Upcoming</option>
              <option value={Status.Today}>Today</option>
              <option value={Status.Past}>Past</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No events found</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${getEventTypeColor(event.eventType)}`}>
                      {getEventTypeLabel(event.eventType)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {event.stockTicker?.symbol || 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {event.stockTicker?.name}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {event.title}
                  </h3>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {event.description}
                    </p>
                  )}

                  {renderEventDetails(event)}
                </div>

                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {eventService.formatEventDate(event.eventDate)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {eventService.getRelativeTime(event.eventDate)}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                    event.status === Status.Upcoming ? 'bg-green-100 text-green-800' :
                    event.status === Status.Today ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getEventStatusLabel(event.status)}
                  </span>
                </div>
              </div>

              {event.sourceUrl && (
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-2 inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Source →
                </a>
              )}
            </div>
          ))
        )}
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
    </div>
  )
}
