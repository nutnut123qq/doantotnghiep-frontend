import type { StockTicker } from '@/domain/entities/StockTicker'

function pick<T>(r: Record<string, unknown>, camel: string, pascal: string): T | undefined {
  const a = r[camel]
  if (a !== undefined && a !== null) return a as T
  const b = r[pascal]
  if (b !== undefined && b !== null) return b as T
  return undefined
}

function numOrUndef(v: unknown): number | undefined {
  if (v === undefined || v === null) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function normExchange(ex: unknown): StockTicker['exchange'] {
  if (ex === 'HOSE' || ex === 'HNX' || ex === 'UPCOM') return ex
  if (ex === 1 || ex === '1') return 'HOSE'
  if (ex === 2 || ex === '2') return 'HNX'
  if (ex === 3 || ex === '3') return 'UPCOM'
  return 'HOSE'
}

export function effectivePrice(t: Pick<StockTicker, 'currentPrice' | 'value' | 'volume'>): number | undefined {
  const p = t.currentPrice
  if (typeof p === 'number' && Number.isFinite(p) && p > 0) return p
  return undefined
}

export function hasQuotablePrice(t: Pick<StockTicker, 'currentPrice' | 'value' | 'volume'>): boolean {
  return effectivePrice(t) != null
}

/** Chuẩn hóa payload từ API / SignalR (camelCase + PascalCase). */
export function normalizeStockTicker(raw: unknown): StockTicker {
  const r = raw as Record<string, unknown>

  let currentPrice = numOrUndef(pick(r, 'currentPrice', 'CurrentPrice')) ?? 0
  const volume = numOrUndef(pick(r, 'volume', 'Volume'))
  const value = numOrUndef(pick(r, 'value', 'Value'))

  const id = pick(r, 'id', 'Id')
  const symbol = pick(r, 'symbol', 'Symbol')

  return {
    id: id != null ? String(id) : '',
    symbol: symbol != null ? String(symbol) : '',
    name: String(pick(r, 'name', 'Name') ?? symbol ?? ''),
    exchange: normExchange(pick(r, 'exchange', 'Exchange')),
    industry: pick(r, 'industry', 'Industry') as string | undefined,
    currentPrice: Number.isFinite(currentPrice) ? currentPrice : 0,
    previousClose: numOrUndef(pick(r, 'previousClose', 'PreviousClose')),
    change: numOrUndef(pick(r, 'change', 'Change')),
    changePercent: numOrUndef(pick(r, 'changePercent', 'ChangePercent')),
    volume,
    value,
    lastUpdated: String(pick(r, 'lastUpdated', 'LastUpdated') ?? new Date().toISOString()),
  }
}
