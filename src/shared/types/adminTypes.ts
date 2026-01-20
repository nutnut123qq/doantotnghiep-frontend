export enum UserRole {
  Investor = 1,
  Admin = 2,
  Premium = 3,
}

export interface User {
  id: string;
  email: string;
  fullName?: string | null;
  role: UserRole;
  isActive: boolean;
  lockoutEnabled: boolean;
  lockoutEnd?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalStocks: number;
  totalWatchlists: number;
  totalAlerts: number;
  totalEvents: number;
  totalNews: number;
  lastUpdated: string;
}

export interface SystemHealthStatus {
  isHealthy: boolean;
  checkedAt: string;
  database: DatabaseHealth;
  cache: CacheHealth;
  backgroundJobs: BackgroundJobsHealth;
  performance: PerformanceMetrics;
}

export interface DatabaseHealth {
  isConnected: boolean;
  connectionPoolSize: number;
  responseTimeMs: number;
}

export interface CacheHealth {
  isConnected: boolean;
  responseTimeMs: number;
  cachedItemsCount: number;
}

export interface BackgroundJobsHealth {
  allJobsRunning: boolean;
  jobs: JobStatus[];
}

export interface JobStatus {
  jobName: string;
  isRunning: boolean;
  lastRunTime: string | null;
  status: string;
}

export interface PerformanceMetrics {
  cpuUsagePercent: number;
  memoryUsageMB: number;
  totalMemoryMB: number;
  activeConnections: number;
  uptimeSeconds: number;
}

export interface UpdateUserRoleRequest {
  newRole: UserRole;
}

export interface SetUserStatusRequest {
  isActive: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName?: string | null;
  role: UserRole;
}

export interface UpdateUserRequest {
  email?: string | null;
  fullName?: string | null;
  role?: UserRole | null;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export interface PaginatedUsers {
  users: User[];
  totalCount: number;
}
