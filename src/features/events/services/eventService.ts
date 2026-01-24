import { apiClient } from '../../../infrastructure/api/apiClient'
import type {
  CorporateEvent,
  EventFilterParams,
  CorporateEventType,
} from '../../../shared/types/eventTypes'

/**
 * Service for managing corporate events
 */
class EventService {
  private readonly BASE_URL = '/CorporateEvent'

  /**
   * Get all events with optional filtering
   */
  async getEvents(filters?: EventFilterParams): Promise<CorporateEvent[]> {
    const params = new URLSearchParams()
    
    if (filters?.symbol) params.append('symbol', filters.symbol)
    if (filters?.eventType !== undefined) params.append('eventType', filters.eventType.toString())
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.status !== undefined) params.append('status', filters.status.toString())

    const queryString = params.toString()
    const url = queryString ? `${this.BASE_URL}?${queryString}` : this.BASE_URL

    const response = await apiClient.get<CorporateEvent[]>(url)
    return response.data
  }

  /**
   * Get upcoming events (next N days)
   */
  async getUpcomingEvents(daysAhead: number = 30): Promise<CorporateEvent[]> {
    const response = await apiClient.get<CorporateEvent[]>(
      `${this.BASE_URL}/upcoming?daysAhead=${daysAhead}`
    )
    return response.data
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<CorporateEvent> {
    const response = await apiClient.get<CorporateEvent>(`${this.BASE_URL}/${id}`)
    return response.data
  }

  /**
   * Create new event
   */
  async createEvent(eventData: {
    stockTickerId: string
    eventType: CorporateEventType
    eventDate: string
    title: string
    description?: string
    sourceUrl?: string
    eventData?: Record<string, any>
  }): Promise<CorporateEvent> {
    const response = await apiClient.post<CorporateEvent>(this.BASE_URL, eventData)
    return response.data
  }

  /**
   * Get events by stock symbol
   */
  async getEventsBySymbol(symbol: string): Promise<CorporateEvent[]> {
    return this.getEvents({ symbol })
  }

  /**
   * Get events by date range
   */
  async getEventsByDateRange(startDate: string, endDate: string): Promise<CorporateEvent[]> {
    return this.getEvents({ startDate, endDate })
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: CorporateEventType): Promise<CorporateEvent[]> {
    return this.getEvents({ eventType })
  }

  /**
   * Format event date for display
   */
  formatEventDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /**
   * Check if event is upcoming (in the future)
   */
  isUpcoming(eventDate: string): boolean {
    return new Date(eventDate) > new Date()
  }

  /**
   * Check if event is today
   */
  isToday(eventDate: string): boolean {
    const today = new Date()
    const event = new Date(eventDate)
    return (
      today.getFullYear() === event.getFullYear() &&
      today.getMonth() === event.getMonth() &&
      today.getDate() === event.getDate()
    )
  }

  /**
   * Get relative time string (e.g., "2 days ago", "in 3 days")
   */
  getRelativeTime(eventDate: string): string {
    const now = new Date()
    const event = new Date(eventDate)
    const diffMs = event.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 0) return `in ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  /**
   * Analyze event with AI
   */
  async analyzeEvent(id: string): Promise<{ analysis: string; impact: string }> {
    const response = await apiClient.post<{ analysis: string; impact: string }>(
      `${this.BASE_URL}/${id}/analyze`
    )
    return response.data
  }
}

export const eventService = new EventService()
