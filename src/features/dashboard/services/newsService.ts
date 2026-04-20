import { apiClient } from '@/infrastructure/api/apiClient'
import { PaginatedResponse } from '@/shared/types/common.types'

export interface News {
  id: string
  tickerId?: string
  title: string
  content: string
  source: string
  url?: string
  publishedAt: string
  createdAt: string
  summary?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  impactAssessment?: string
  /** Soft-delete / hidden from users; admin list may include this. */
  isDeleted?: boolean
}

export interface SummarizeResponse {
  summary: string
  sentiment: string
  impact_assessment: string
  key_points?: string[]
}

export interface NewsQASource {
  title: string
  url?: string
  sourceType: string
  publishedAt?: string
}

export interface NewsQAResponse {
  question: string
  answer: string
  sources: NewsQASource[]
}

export const newsService = {
  async getNews(page = 1, pageSize = 10, tickerId?: string): Promise<PaginatedResponse<News>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    
    if (tickerId) {
      params.append('tickerId', tickerId)
    }
    
    const response = await apiClient.get<PaginatedResponse<News>>(`/News?${params.toString()}`)
    return response.data
  },

  async getNewsById(id: string): Promise<News> {
    const response = await apiClient.get<News>(`/News/${id}`)
    return response.data
  },

  async requestSummarization(newsId: string): Promise<void> {
    await apiClient.post(`/News/${newsId}/summarize`)
  },

  async askQuestion(question: string, symbol?: string, days = 7, topK = 6): Promise<NewsQAResponse> {
    const body: Record<string, unknown> = { question, days, topK }
    const sym = symbol?.trim()
    if (sym) body.symbol = sym
    const response = await apiClient.post<NewsQAResponse>('/News/qa', body)
    return response.data
  },
}

