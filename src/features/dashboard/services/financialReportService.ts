import { apiClient } from '@/infrastructure/api/apiClient'

export interface FinancialReport {
  id: string
  tickerId: string
  reportType: 'Quarterly' | 'Annual'
  year: number
  quarter?: number
  content: string
  reportDate: string
  createdAt: string
}

export interface FinancialMetrics {
  Year: number
  Quarter?: number
  Revenue: number
  GrossProfit: number
  OperatingProfit: number
  NetProfit: number
  EPS: number
  TotalAssets: number
  TotalLiabilities: number
  Equity: number
  ROE: number
  ROA: number
}

export interface AskQuestionResponse {
  question: string
  answer: string
  sources: string[]  // Sources from AI with citations
}

export const financialReportService = {
  async getReportsBySymbol(symbol: string): Promise<FinancialReport[]> {
    const response = await apiClient.get<FinancialReport[]>(`/FinancialReport/symbol/${symbol}`)
    return response.data
  },

  async getReportById(id: string): Promise<FinancialReport> {
    const response = await apiClient.get<FinancialReport>(`/FinancialReport/${id}`)
    return response.data
  },

  async crawlReports(symbol: string, maxReports = 10): Promise<{ symbol: string; count: number; reports: FinancialReport[] }> {
    const response = await apiClient.post<{ symbol: string; count: number; reports: FinancialReport[] }>(
      `/FinancialReport/crawl/${symbol}?maxReports=${maxReports}`
    )
    return response.data
  },

  async askQuestion(reportId: string, question: string): Promise<AskQuestionResponse> {
    const response = await apiClient.post<AskQuestionResponse>(
      `/FinancialReport/${reportId}/ask`,
      { question }
    )
    return response.data
  },

  parseContent(content: string): FinancialMetrics | null {
    try {
      return JSON.parse(content) as FinancialMetrics
    } catch {
      return null
    }
  },

  formatCurrency(value: number): string {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)} tỷ`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} triệu`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)} nghìn`
    }
    return value.toFixed(2)
  },

  formatPercent(value: number): string {
    return `${value.toFixed(2)}%`
  },
}

