import { apiClient } from '../../../infrastructure/api/apiClient';
import type { 
  SystemStats, 
  SystemHealthStatus,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  UpdateUserRoleRequest,
  SetUserStatusRequest,
  PaginatedUsers
} from '../../../shared/types/adminTypes';
import type {
  ApiAnalytics,
  PopularStock,
  EndpointMetrics
} from '../../../shared/types/analyticsTypes';
import type { QueryParams } from '../../../shared/types/common.types';
import type { News } from '../../dashboard/services/newsService';

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
   * Create a new user
   */
  async createUser(request: CreateUserRequest): Promise<void> {
    await apiClient.post(`${this.baseUrl}/users`, request);
  }

  /**
   * Update user info/role
   */
  async updateUser(userId: string, request: UpdateUserRequest): Promise<void> {
    await apiClient.put(`${this.baseUrl}/users/${userId}`, request);
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const request: ResetPasswordRequest = { newPassword };
    await apiClient.post(`${this.baseUrl}/users/${userId}/reset-password`, request);
  }

  /**
   * Lock user account
   */
  async lockUser(userId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/users/${userId}/lock`);
  }

  /**
   * Unlock user account
   */
  async unlockUser(userId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/users/${userId}/unlock`);
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: number): Promise<void> {
    const request: UpdateUserRoleRequest = { newRole };
    await apiClient.put(`${this.baseUrl}/users/${userId}/role`, request);
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
  async getAdminNews(page: number = 1, pageSize: number = 20, tickerId?: string): Promise<News[]> {
    const params: Record<string, string | number> = { page, pageSize };
    if (tickerId) params.tickerId = tickerId;
    const response = await apiClient.get<News[]>(`${this.baseUrl}/news`, { params });
    return response.data;
  }

  /**
   * Show or hide a news article (soft delete)
   */
  async setNewsDeleted(id: string, isDeleted: boolean): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/news/${id}`, { isDeleted });
  }
}

export const adminService = new AdminService();
