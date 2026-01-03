import { apiClient } from '@/infrastructure/api/apiClient'

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
}

export interface SummarizeResponse {
  summary: string
  sentiment: string
  impact_assessment: string
  key_points?: string[]
}

export const newsService = {
  async getNews(page = 1, pageSize = 20, tickerId?: string): Promise<News[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    
    if (tickerId) {
      params.append('tickerId', tickerId)
    }
    
    const response = await apiClient.get<News[]>(`/api/News?${params.toString()}`)
    return response.data
  },

  async getNewsById(id: string): Promise<News> {
    const response = await apiClient.get<News>(`/api/News/${id}`)
    return response.data
  },

  async requestSummarization(newsId: string): Promise<void> {
    await apiClient.post(`/api/News/${newsId}/summarize`)
  },
}

