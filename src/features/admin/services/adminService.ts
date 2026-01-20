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
import type { AdminSharedLayoutInfo } from '../../../shared/types/layoutTypes';

class AdminService {
  private baseUrl = '/api/Admin';

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
    const params: any = {};
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
   * Get shared layouts for moderation
   */
  async getAllSharedLayouts(
    page: number = 1,
    pageSize: number = 20,
    ownerId?: string,
    status: 'active' | 'expired' | 'all' = 'all'
  ): Promise<{ items: AdminSharedLayoutInfo[]; totalCount: number; page: number; pageSize: number }> {
    const params: any = { page, pageSize, status };
    if (ownerId) params.ownerId = ownerId;
    const response = await apiClient.get(`${this.baseUrl}/shared-layouts`, { params });
    return response.data;
  }

  /**
   * Delete a shared layout
   */
  async deleteSharedLayout(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/shared-layouts/${id}`);
  }
}

export const adminService = new AdminService();
