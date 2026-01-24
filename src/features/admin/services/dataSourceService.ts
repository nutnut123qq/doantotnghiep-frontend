import { apiClient } from '@/infrastructure/api/apiClient'
import type { DataSource, DataSourceType } from '@/shared/types/dataSourceTypes'

// Response DTOs
interface GetDataSourcesResponse {
  dataSources: DataSource[]
}

interface TestConnectionResponse {
  isConnected: boolean
  errorMessage?: string
  lastChecked: string
}

export const dataSourceService = {
  async getAll(type?: DataSourceType): Promise<DataSource[]> {
    const params = new URLSearchParams()
    if (type) params.append('type', type.toString())
    
    const response = await apiClient.get<GetDataSourcesResponse>(
      `/DataSource?${params.toString()}`
    )
    // Backend returns GetDataSourcesResponse with dataSources property
    return response.data.dataSources || []
  },

  async getById(id: string): Promise<DataSource> {
    const response = await apiClient.get<DataSource>(`/DataSource/${id}`)
    return response.data
  },

  async create(dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastChecked'>): Promise<DataSource> {
    const response = await apiClient.post<DataSource>('/DataSource', dataSource)
    return response.data
  },

  async update(id: string, dataSource: Partial<DataSource>): Promise<DataSource> {
    const response = await apiClient.put<DataSource>(`/DataSource/${id}`, dataSource)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/DataSource/${id}`)
  },

  async testConnection(id: string): Promise<TestConnectionResponse> {
    const response = await apiClient.post<TestConnectionResponse>(
      `/DataSource/${id}/test`
    )
    return response.data
  },
}

