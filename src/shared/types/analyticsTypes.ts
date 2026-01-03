export interface ApiAnalytics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  averageResponseTimeMs: number;
  requestsByEndpoint: Record<string, number>;
  requestsByStatusCode: Record<string, number>;
  startDate: string;
  endDate: string;
}

export interface PopularStock {
  symbol: string;
  companyName: string;
  viewCount: number;
  uniqueUsers: number;
}

export interface EndpointMetrics {
  endpoint: string;
  method: string;
  requestCount: number;
  averageResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  errorCount: number;
  errorRate: number;
}
