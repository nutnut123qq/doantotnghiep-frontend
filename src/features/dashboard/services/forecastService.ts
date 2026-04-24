import { apiClient } from '@/infrastructure/api/apiClient'
import { getAxiosErrorMessage } from '@/shared/utils/axiosError'

export interface ForecastResult {
  symbol: string
  trend: 'Up' | 'Down' | 'Sideways'
  confidence: 'High' | 'Medium' | 'Low'
  confidenceScore: number
  timeHorizon: 'short' | 'medium' | 'long'
  recommendation: 'Buy' | 'Hold' | 'Sell'
  keyDrivers?: string[] | null
  risks?: string[] | null
  analysis: string
  generatedAt: string
}

export type ForecastJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'unknown'

export interface ForecastEnqueueResponse {
  status: ForecastJobStatus
  jobId?: string | null
  symbol: string
  timeHorizon: string
  /** Present when Python/.NET returned an inline cache hit. */
  result?: ForecastResult
}

export interface PollForecastOptions {
  timeHorizon?: 'short' | 'medium' | 'long'
  intervalMs?: number
  maxMs?: number
  signal?: AbortSignal
  onStatus?: (status: ForecastJobStatus, attempt: number) => void
}

export class ForecastPollTimeoutError extends Error {
  constructor(message = 'Hết thời gian chờ phân tích LangGraph') {
    super(message)
    this.name = 'ForecastPollTimeoutError'
  }
}

export class ForecastPollAbortedError extends Error {
  constructor(message = 'Đã hủy chờ phân tích LangGraph') {
    super(message)
    this.name = 'ForecastPollAbortedError'
  }
}

function normalizeForecast(data: ForecastResult & { confidence_score?: number }): ForecastResult {
  return {
    ...data,
    confidenceScore: data.confidenceScore ?? data.confidence_score ?? 0,
    keyDrivers: data.keyDrivers || [],
    risks: data.risks || [],
  }
}

function sleepWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ForecastPollAbortedError())
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(new ForecastPollAbortedError())
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export interface AllForecasts {
  symbol: string
  forecasts: {
    shortTerm: ForecastResult
    mediumTerm: ForecastResult
    longTerm: ForecastResult
  }
}

export interface BatchForecastItem {
  symbol: string
  trend?: string
  confidence?: string
  recommendation?: string
  error?: string
}

export const forecastService = {
  async getForecast(symbol: string, timeHorizon: 'short' | 'medium' | 'long' = 'short'): Promise<ForecastResult> {
    try {
      const response = await apiClient.get<ForecastResult & { confidence_score?: number }>(`/Forecast/${symbol}?timeHorizon=${timeHorizon}`)
      // Normalize data to ensure arrays are never null
      const data = response.data
      return {
        ...data,
        confidenceScore: data.confidenceScore ?? data.confidence_score ?? 0,
        keyDrivers: data.keyDrivers || [],
        risks: data.risks || [],
      }
    } catch (error: unknown) {
      const errorMessage = getAxiosErrorMessage(error)
      throw new Error(errorMessage === 'Unknown error' ? 'Không thể tải dự báo' : errorMessage)
    }
  },

  /**
   * Ask the backend to enqueue a LangGraph forecast job.
   *
   * The backend returns either:
   *   - HTTP 200 + full {@link ForecastResult} when a fresh cache exists, OR
   *   - HTTP 202 + `{ status, jobId }` when a worker needs to run the graph.
   *
   * We inspect the payload shape and return a unified envelope for the caller.
   */
  async enqueueForecast(
    symbol: string,
    timeHorizon: 'short' | 'medium' | 'long' = 'short',
    signal?: AbortSignal,
  ): Promise<ForecastEnqueueResponse> {
    const response = await apiClient.get<
      (ForecastResult & { confidence_score?: number }) | {
        status?: string
        jobId?: string
        symbol?: string
        timeHorizon?: string
      }
    >(`/Forecast/${symbol}?timeHorizon=${timeHorizon}`, {
      signal,
      silent: true,
      validateStatus: (status) => status === 200 || status === 202,
    })

    const data = response.data as Record<string, unknown>

    if (response.status === 200 && typeof data.trend === 'string') {
      return {
        status: 'completed',
        symbol,
        timeHorizon,
        result: normalizeForecast(data as unknown as ForecastResult & { confidence_score?: number }),
      }
    }

    const jobId = (data.jobId as string | undefined) ?? null
    const rawStatus = ((data.status as string | undefined) ?? 'queued').toLowerCase()
    const status: ForecastJobStatus =
      rawStatus === 'queued' || rawStatus === 'running' || rawStatus === 'completed' || rawStatus === 'failed'
        ? (rawStatus as ForecastJobStatus)
        : 'queued'

    return { status, jobId, symbol, timeHorizon }
  },

  /** Poll `/Forecast/langgraph/jobs/{jobId}` once — returns result on completion. */
  async getForecastJob(
    jobId: string,
    symbol: string,
    timeHorizon: 'short' | 'medium' | 'long' = 'short',
    signal?: AbortSignal,
  ): Promise<ForecastEnqueueResponse> {
    const response = await apiClient.get<
      (ForecastResult & { confidence_score?: number }) | {
        status?: string
        jobId?: string
        symbol?: string
        timeHorizon?: string
        error?: string
      }
    >(`/Forecast/langgraph/jobs/${encodeURIComponent(jobId)}?symbol=${encodeURIComponent(symbol)}&timeHorizon=${timeHorizon}`, {
      signal,
      silent: true,
      validateStatus: (status) => status === 200 || status === 202,
    })

    const data = response.data as Record<string, unknown>

    if (response.status === 200 && typeof data.trend === 'string') {
      return {
        status: 'completed',
        jobId,
        symbol,
        timeHorizon,
        result: normalizeForecast(data as unknown as ForecastResult & { confidence_score?: number }),
      }
    }

    const rawStatus = ((data.status as string | undefined) ?? 'queued').toLowerCase()
    const status: ForecastJobStatus =
      rawStatus === 'queued' || rawStatus === 'running' || rawStatus === 'completed' || rawStatus === 'failed'
        ? (rawStatus as ForecastJobStatus)
        : 'unknown'

    return { status, jobId, symbol, timeHorizon }
  },

  /**
   * Enqueue + poll helper. Resolves with the final forecast, or throws
   * {@link ForecastPollTimeoutError} / {@link ForecastPollAbortedError}.
   */
  async pollForecast(
    symbol: string,
    options: PollForecastOptions = {},
  ): Promise<ForecastResult> {
    const timeHorizon = options.timeHorizon ?? 'short'
    const intervalMs = options.intervalMs ?? 5000
    const maxMs = options.maxMs ?? 10 * 60 * 1000
    const signal = options.signal

    let envelope: ForecastEnqueueResponse
    try {
      envelope = await this.enqueueForecast(symbol, timeHorizon, signal)
    } catch (error: unknown) {
      if (signal?.aborted) throw new ForecastPollAbortedError()
      throw new Error(getAxiosErrorMessage(error) || 'Không thể tạo job dự báo')
    }

    if (envelope.status === 'completed' && envelope.result) {
      options.onStatus?.('completed', 0)
      return envelope.result
    }

    if (!envelope.jobId) {
      throw new Error('Backend không trả về jobId cho dự báo LangGraph')
    }

    options.onStatus?.(envelope.status, 0)

    const jobId = envelope.jobId
    const startedAt = Date.now()
    let attempt = 0

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Date.now() - startedAt > maxMs) {
        throw new ForecastPollTimeoutError()
      }

      await sleepWithAbort(intervalMs, signal)
      attempt += 1

      let polled: ForecastEnqueueResponse
      try {
        polled = await this.getForecastJob(jobId, symbol, timeHorizon, signal)
      } catch (error: unknown) {
        if (signal?.aborted) throw new ForecastPollAbortedError()
        throw new Error(getAxiosErrorMessage(error) || 'Mất kết nối khi chờ phân tích')
      }

      options.onStatus?.(polled.status, attempt)

      if (polled.status === 'completed' && polled.result) {
        return polled.result
      }
      if (polled.status === 'failed') {
        throw new Error('Phân tích LangGraph thất bại. Vui lòng thử lại sau.')
      }
    }
  },

  async getAllForecasts(symbol: string): Promise<AllForecasts> {
    const response = await apiClient.get<AllForecasts>(`/Forecast/${symbol}/all`)
    return response.data
  },

  async getBatchForecasts(symbols: string[], timeHorizon: 'short' | 'medium' | 'long' = 'short'): Promise<{ forecasts: BatchForecastItem[] }> {
    const response = await apiClient.post<{ forecasts: BatchForecastItem[] }>('/Forecast/batch', {
      symbols,
      timeHorizon,
    })
    return response.data
  },

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'Up':
        return 'text-green-600'
      case 'Down':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  },

  getTrendBgColor(trend: string): string {
    switch (trend) {
      case 'Up':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'Down':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-muted border-border'
    }
  },

  getConfidenceColor(confidence: string): string {
    switch (confidence) {
      case 'High':
        return 'text-green-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'Low':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  },

  getRecommendationColor(recommendation: string): string {
    switch (recommendation) {
      case 'Buy':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Sell':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  },

  getTimeHorizonLabel(timeHorizon: string): string {
    switch (timeHorizon) {
      case 'short':
        return '1-5 ngày'
      case 'medium':
        return '1-4 tuần'
      case 'long':
        return '1-3 tháng'
      default:
        return timeHorizon
    }
  },
}

