/**
 * API client for Analysis Reports module
 */
import { apiClient } from './apiClient';
import type {
  AnalysisReportListResponse,
  AnalysisReportDetail,
  CreateAnalysisReportDto,
  AskQuestionRequest,
  QAResponse,
} from '@/shared/types/analysisReportTypes';

export const analysisReportApi = {
  /**
   * Get list of analysis reports by symbol (paginated)
   */
  getList: async (symbol: string, page = 1, pageSize = 10): Promise<AnalysisReportListResponse> => {
    const response = await apiClient.get<AnalysisReportListResponse>('/analysis-reports', {
      params: { symbol, page, pageSize },
    });
    return response.data;
  },

  /**
   * Get analysis report detail by ID (with full content)
   */
  getDetail: async (id: string): Promise<AnalysisReportDetail> => {
    const response = await apiClient.get<AnalysisReportDetail>(`/analysis-reports/${id}`);
    return response.data;
  },

  /**
   * Create a new analysis report (V1: plain text only)
   */
  create: async (data: CreateAnalysisReportDto): Promise<AnalysisReportDetail> => {
    const response = await apiClient.post<AnalysisReportDetail>('/analysis-reports', data);
    return response.data;
  },

  /**
   * Ask a question about an analysis report (Q&A with citations)
   */
  askQuestion: async (reportId: string, question: string): Promise<QAResponse> => {
    const response = await apiClient.post<QAResponse>(
      `/analysis-reports/${reportId}/qa`,
      { question } as AskQuestionRequest
    );
    return response.data;
  },
};
