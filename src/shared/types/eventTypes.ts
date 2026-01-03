// Corporate Event types
export enum CorporateEventType {
  Earnings = 1,
  Dividend = 2,
  StockSplit = 3,
  AGM = 4,
  RightsIssue = 5,
}

export enum EventStatus {
  Upcoming = 1,
  Today = 2,
  Past = 3,
  Cancelled = 4,
}

// Base Corporate Event interface
export interface CorporateEvent {
  id: string
  stockTickerId: string
  eventType: CorporateEventType
  eventDate: string // ISO date string
  title: string
  description?: string
  sourceUrl?: string
  status: EventStatus
  additionalData?: string
  createdAt: string
  updatedAt: string
  
  // Stock ticker info (included from backend)
  stockTicker?: {
    id: string
    symbol: string
    name: string
    exchange: number
  }
}

// Earnings Event
export interface EarningsEvent extends CorporateEvent {
  period: string // Q1, Q2, Q3, Q4, Year
  year: number
  eps?: number
  revenue?: number
  netProfit?: number
}

// Dividend Event
export interface DividendEvent extends CorporateEvent {
  dividendPerShare: number
  cashDividend?: number
  stockDividendRatio?: number
  exDividendDate?: string
  recordDate?: string
  paymentDate?: string
}

// Stock Split Event
export interface StockSplitEvent extends CorporateEvent {
  splitRatio: string
  isReverseSplit: boolean
  effectiveDate: string
  recordDate?: string
}

// AGM Event
export interface AGMEvent extends CorporateEvent {
  location?: string
  meetingTime?: string
  agenda?: string
  recordDate?: string
  year: number
}

// Rights Issue Event
export interface RightsIssueEvent extends CorporateEvent {
  numberOfShares: number
  issuePrice: number
  rightsRatio?: string
  recordDate?: string
  subscriptionStartDate?: string
  subscriptionEndDate?: string
  purpose?: string
}

// Event filter params
export interface EventFilterParams {
  symbol?: string
  eventType?: CorporateEventType
  startDate?: string
  endDate?: string
  status?: EventStatus
}

// Event type labels
export const EVENT_TYPE_LABELS: Record<CorporateEventType, string> = {
  [CorporateEventType.Earnings]: 'Earnings',
  [CorporateEventType.Dividend]: 'Dividend',
  [CorporateEventType.StockSplit]: 'Stock Split',
  [CorporateEventType.AGM]: 'AGM',
  [CorporateEventType.RightsIssue]: 'Rights Issue',
}

// Event type colors (for UI)
export const EVENT_TYPE_COLORS: Record<CorporateEventType, string> = {
  [CorporateEventType.Earnings]: 'bg-blue-500',
  [CorporateEventType.Dividend]: 'bg-green-500',
  [CorporateEventType.StockSplit]: 'bg-purple-500',
  [CorporateEventType.AGM]: 'bg-orange-500',
  [CorporateEventType.RightsIssue]: 'bg-pink-500',
}

// Event status labels
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  [EventStatus.Upcoming]: 'Upcoming',
  [EventStatus.Today]: 'Today',
  [EventStatus.Past]: 'Past',
  [EventStatus.Cancelled]: 'Cancelled',
}
