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

// Base Corporate Event properties (shared across all event types)
interface BaseCorporateEvent {
  id: string
  stockTickerId: string
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

// Discriminated union: Earnings Event
export interface EarningsEvent extends BaseCorporateEvent {
  eventType: CorporateEventType.Earnings
  period: string // Q1, Q2, Q3, Q4, Year
  year: number
  eps?: number
  revenue?: number
  netProfit?: number
}

// Discriminated union: Dividend Event
export interface DividendEvent extends BaseCorporateEvent {
  eventType: CorporateEventType.Dividend
  dividendPerShare: number
  cashDividend?: number
  stockDividendRatio?: number
  exDividendDate?: string
  recordDate?: string
  paymentDate?: string
}

// Discriminated union: Stock Split Event
export interface StockSplitEvent extends BaseCorporateEvent {
  eventType: CorporateEventType.StockSplit
  splitRatio: string
  isReverseSplit: boolean
  effectiveDate: string
  recordDate?: string
}

// Discriminated union: AGM Event
export interface AGMEvent extends BaseCorporateEvent {
  eventType: CorporateEventType.AGM
  location?: string
  meetingTime?: string
  agenda?: string
  recordDate?: string
  year: number
}

// Discriminated union: Rights Issue Event
export interface RightsIssueEvent extends BaseCorporateEvent {
  eventType: CorporateEventType.RightsIssue
  numberOfShares: number
  issuePrice: number
  rightsRatio?: string
  recordDate?: string
  subscriptionStartDate?: string
  subscriptionEndDate?: string
  purpose?: string
}

// Discriminated union type for all Corporate Events
export type CorporateEvent =
  | EarningsEvent
  | DividendEvent
  | StockSplitEvent
  | AGMEvent
  | RightsIssueEvent

// Type guards
export function isEarningsEvent(event: CorporateEvent): event is EarningsEvent {
  return event.eventType === CorporateEventType.Earnings
}

export function isDividendEvent(event: CorporateEvent): event is DividendEvent {
  return event.eventType === CorporateEventType.Dividend
}

export function isStockSplitEvent(event: CorporateEvent): event is StockSplitEvent {
  return event.eventType === CorporateEventType.StockSplit
}

export function isAGMEvent(event: CorporateEvent): event is AGMEvent {
  return event.eventType === CorporateEventType.AGM
}

export function isRightsIssueEvent(event: CorporateEvent): event is RightsIssueEvent {
  return event.eventType === CorporateEventType.RightsIssue
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
