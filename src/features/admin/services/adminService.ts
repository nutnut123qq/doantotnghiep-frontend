import { apiClient } from '../../../infrastructure/api/apiClient';
import type { 
  SystemStats, 
  SystemHealthStatus,
  SetUserStatusRequest,
  PaginatedUsers
} from '../../../shared/types/adminTypes';
import type {
  ApiAnalytics,
  PopularStock,
  EndpointMetrics
} from '../../../shared/types/analyticsTypes';
import type { PaginatedResponse, QueryParams } from '../../../shared/types/common.types';
import type { News } from '../../dashboard/services/newsService';

export interface AdminAIInsight {
  id: string;
  symbol: string;
  name?: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  generatedAt: string;
  isDeleted: boolean;
}

export interface AdminFinancialReport {
  id: string;
  tickerId: string;
  symbol?: string;
  reportType: string;
  year: number;
  quarter?: number;
  reportDate: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface AdminCorporateEvent {
  id: string;
  stockTickerId: string;
  symbol?: string;
  eventType: number;
  eventDate: string;
  title: string;
  description?: string;
  sourceUrl?: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface AIProvider {
  id: string;
  name: string;
  model: string;
  status: string;
  latencyMs: number;
  quotaRemaining: number;
  quotaTotal: number;
  keyMasked: string;
  priority: number;
  note?: string;
}

export interface AIProbeResult {
  probedAt: string;
  results: Array<{
    id: string;
    status: string;
    latencyMs: number;
    error?: string;
  }>;
}

export interface AIPipelineNode {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
}

export interface AIPipelineEdge {
  from: string;
  to: string;
}

export interface AIPipelineInfo {
  lightMode: boolean;
  provider: string;
  nodes: AIPipelineNode[];
  edges: AIPipelineEdge[];
  estimatedLlmCalls: number;
}

export interface AIRagDocument {
  documentId: string;
  source: string;
  symbol: string;
  chunks: number;
  sizeBytes: number;
  ingestedAt?: string;
}

export interface AICacheStats {
  hitRatePercent: number;
  memoryUsedMb: number;
  totalKeys: number;
  connectedClients: number;
  dbSize: number;
}

export interface AIJob {
  id: string;
  symbol: string;
  status: string;
  progress: number;
  provider?: string;
  enqueuedAt?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface AIParameters {
  temperature: number;
  maxTokens: number;
  promptVersion: string;
  shadowMode: boolean;
  canaryRatio: number;
  llmProvider: string;
  defaultModel: string;
  lightModeEnv?: string;
}

export interface AIParametersUpdate {
  temperature?: number;
  maxTokens?: number;
  promptVersion?: string;
  shadowMode?: boolean;
  canaryRatio?: number;
}

export interface AITraceNode {
  name: string;
  status: string;
  ms: number;
  parallel: boolean;
}

export interface AITrace {
  id: string;
  symbol: string;
  provider: string;
  startedAt: string;
  totalMs: number;
  nodes: AITraceNode[];
  result: Record<string, unknown>;
}

class AdminService {
  private baseUrl = '/Admin';

  /**
   * Get all users with pagination
   */
  async getAllUsers(page: number = 1, pageSize: number = 20): Promise<PaginatedUsers> {
    const response = await apiClient.get<PaginatedUsers>(
      `${this.baseUrl}/users`,
      { params: { page, pageSize } }
    );
    return response.data;
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get<SystemStats>(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealthStatus> {
    const response = await apiClient.get<SystemHealthStatus>(`${this.baseUrl}/health`);
    return response.data;
  }

  /**
   * Set user active status
   */
  async setUserStatus(userId: string, isActive: boolean): Promise<void> {
    const request: SetUserStatusRequest = { isActive };
    await apiClient.put(`${this.baseUrl}/users/${userId}/status`, request);
  }

  /**
   * Get API analytics
   */
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<ApiAnalytics> {
    const params: QueryParams = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    const response = await apiClient.get<ApiAnalytics>(`${this.baseUrl}/analytics`, { params });
    return response.data;
  }

  /**
   * Get popular stocks
   */
  async getPopularStocks(topN: number = 10, daysBack: number = 7): Promise<PopularStock[]> {
    const response = await apiClient.get<PopularStock[]>(`${this.baseUrl}/popular-stocks`, {
      params: { topN, daysBack }
    });
    return response.data;
  }

  /**
   * Get endpoint performance metrics
   */
  async getEndpointMetrics(topN: number = 20): Promise<EndpointMetrics[]> {
    const response = await apiClient.get<EndpointMetrics[]>(`${this.baseUrl}/endpoint-metrics`, {
      params: { topN }
    });
    return response.data;
  }

  /**
   * List all news including hidden (admin only)
   */
  async getAdminNews(page: number = 1, pageSize: number = 10, tickerId?: string): Promise<PaginatedResponse<News>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (tickerId) params.tickerId = tickerId;
    const response = await apiClient.get<PaginatedResponse<News>>(`${this.baseUrl}/news`, { params });
    return response.data;
  }

  /**
   * Show or hide a news article (soft delete)
   */
  async setNewsDeleted(id: string, isDeleted: boolean): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/news/${id}`, { isDeleted });
  }

  async getAdminFinancialReports(page: number = 1, pageSize: number = 10, symbol?: string): Promise<PaginatedResponse<AdminFinancialReport>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (symbol) params.symbol = symbol;
    const response = await apiClient.get<PaginatedResponse<AdminFinancialReport>>(`${this.baseUrl}/financial-reports`, { params });
    return response.data;
  }

  async setFinancialReportDeleted(id: string, isDeleted: boolean): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/financial-reports/${id}`, { isDeleted });
  }

  async getAdminCorporateEvents(
    page: number = 1,
    pageSize: number = 10,
    filters?: { symbol?: string; eventType?: number; status?: number }
  ): Promise<PaginatedResponse<AdminCorporateEvent>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (filters?.symbol) params.symbol = filters.symbol;
    if (filters?.eventType !== undefined) params.eventType = filters.eventType;
    if (filters?.status !== undefined) params.status = filters.status;
    const response = await apiClient.get<PaginatedResponse<AdminCorporateEvent>>(`${this.baseUrl}/corporate-events`, { params });
    return response.data;
  }

  async setCorporateEventDeleted(id: string, isDeleted: boolean): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/corporate-events/${id}`, { isDeleted });
  }

  async getAIInsightsAdmin(filters?: {
    type?: string;
    symbol?: string;
    includeDismissed?: boolean;
    includeDeleted?: boolean;
  }): Promise<AdminAIInsight[]> {
    const params: Record<string, string | boolean> = {};
    if (filters?.type) params.type = filters.type;
    if (filters?.symbol) params.symbol = filters.symbol;
    if (filters?.includeDismissed !== undefined) params.includeDismissed = filters.includeDismissed;
    params.includeDeleted = filters?.includeDeleted ?? true;

    const response = await apiClient.get<AdminAIInsight[]>('/AIInsights', { params });
    return response.data;
  }

  async toggleAIInsightDeleted(id: string, isDeleted: boolean): Promise<void> {
    await apiClient.patch(`/AIInsights/${id}/deleted`, { isDeleted });
  }

  async generateAIInsight(symbol: string): Promise<AdminAIInsight> {
    const response = await apiClient.post<AdminAIInsight>('/AIInsights/generate', { symbol });
    return response.data;
  }

  async generateAIInsightsBatch(symbols?: string[]): Promise<{ status: string; jobId: string; count: number; symbols: string[] }> {
    const response = await apiClient.post<{ status: string; jobId: string; count: number; symbols: string[] }>('/AIInsights/generate/batch', { symbols });
    return response.data;
  }

  // AI Management
  private aiMgmtBase = '/admin/ai-management';

  async getAIProviders(): Promise<AIProvider[]> {
    const response = await apiClient.get<AIProvider[]>(`${this.aiMgmtBase}/providers`);
    return response.data;
  }

  async probeAIProviders(): Promise<AIProbeResult> {
    const response = await apiClient.post<AIProbeResult>(`${this.aiMgmtBase}/providers/probe`);
    return response.data;
  }

  async getAIPipeline(): Promise<AIPipelineInfo> {
    const response = await apiClient.get<AIPipelineInfo>(`${this.aiMgmtBase}/pipeline`);
    return response.data;
  }

  async getRAGDocuments(): Promise<AIRagDocument[]> {
    const response = await apiClient.get<AIRagDocument[]>(`${this.aiMgmtBase}/rag/documents`);
    return response.data;
  }

  async deleteRAGDocument(documentId: string): Promise<void> {
    await apiClient.delete(`${this.aiMgmtBase}/rag/documents/${documentId}`);
  }

  async getCacheStats(): Promise<AICacheStats> {
    const response = await apiClient.get<AICacheStats>(`${this.aiMgmtBase}/cache/stats`);
    return response.data;
  }

  async updateCacheTTL(payload: { analyzeTtl?: number; quoteTtl?: number; historyTtl?: number; symbolsTtl?: number }): Promise<void> {
    await apiClient.put(`${this.aiMgmtBase}/cache/ttl`, payload);
  }

  async getAIJobs(): Promise<AIJob[]> {
    const response = await apiClient.get<AIJob[]>(`${this.aiMgmtBase}/jobs`);
    return response.data;
  }

  async retryAIJob(jobId: string): Promise<void> {
    await apiClient.post(`${this.aiMgmtBase}/jobs/${jobId}/retry`);
  }

  async cancelAIJob(jobId: string): Promise<void> {
    await apiClient.delete(`${this.aiMgmtBase}/jobs/${jobId}`);
  }

  async getAIParameters(): Promise<AIParameters> {
    const response = await apiClient.get<AIParameters>(`${this.aiMgmtBase}/parameters`);
    return response.data;
  }

  async updateAIParameters(payload: AIParametersUpdate): Promise<void> {
    await apiClient.put(`${this.aiMgmtBase}/parameters`, payload);
  }

  async getAITraces(limit = 20): Promise<AITrace[]> {
    const response = await apiClient.get<AITrace[]>(`${this.aiMgmtBase}/traces`, { params: { limit } });
    return response.data;
  }

  async clearAITraces(): Promise<void> {
    await apiClient.delete(`${this.aiMgmtBase}/traces`);
  }
}

export const adminService = new AdminService();
