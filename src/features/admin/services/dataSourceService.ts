import { apiClient } from '@/infrastructure/api/apiClient'
import type { DataSource, DataSourceType } from '@/shared/types/dataSourceTypes'

export const dataSourceService = {
  async getAll(type?: DataSourceType): Promise<DataSource[]> {
    const params = new URLSearchParams()
    if (type) params.append('type', type.toString())
    
    const response = await apiClient.get<{ dataSources: DataSource[] }>(
      `/api/DataSource?${params.toString()}`
    )
    // Backend returns GetDataSourcesResponse with DataSources property
    return (response.data as any).dataSources || []
  },

  async getById(id: string): Promise<DataSource> {
    const response = await apiClient.get<DataSource>(`/api/DataSource/${id}`)
    return response.data
  },

  async create(dataSource: Omit<DataSource, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastChecked'>): Promise<DataSource> {
    const response = await apiClient.post<DataSource>('/api/DataSource', dataSource)
    return response.data
  },

  async update(id: string, dataSource: Partial<DataSource>): Promise<DataSource> {
    const response = await apiClient.put<DataSource>(`/api/DataSource/${id}`, dataSource)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/DataSource/${id}`)
  },

  async testConnection(id: string): Promise<{ isConnected: boolean; errorMessage?: string; lastChecked: string }> {
    const response = await apiClient.post<{ isConnected: boolean; errorMessage?: string; lastChecked: string }>(
      `/api/DataSource/${id}/test`
    )
    return response.data
  },
}

