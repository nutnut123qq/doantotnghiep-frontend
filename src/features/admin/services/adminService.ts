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
}

export const adminService = new AdminService();
