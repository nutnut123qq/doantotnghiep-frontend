/**
 * Types for Analysis Reports module
 * V1 Minimal: NO URL crawler, plain text content only
 */

// List item DTO (no full content)
export interface AnalysisReportListItem {
  id: string;
  symbol: string;
  title: string;
  firmName: string;
  publishedAt: string;
  recommendation?: string;
  targetPrice?: number;
  sourceUrl?: string;
  contentPreview: string; // First 200 chars
}

// Detail DTO (with full content)
export interface AnalysisReportDetail {
  id: string;
  symbol: string;
  title: string;
  firmName: string;
  publishedAt: string;
  recommendation?: string;
  targetPrice?: number;
  content: string; // Full content
  sourceUrl?: string;
  createdAt: string;
}

// Create DTO (V1 - Plain Text Only, NO URL field)
export interface CreateAnalysisReportDto {
  symbol: string;
  title: string;
  firmName: string;
  publishedAt: string;
  recommendation?: string;
  targetPrice?: number;
  content: string; // V1: paste text only (required)
  sourceUrl?: string; // Optional reference URL
}

// Q&A types
export interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

/**
 * Citation interface
 * P0 Fix #8: citationNumber field matches [n] in answer text
 */
export interface Citation {
  citationNumber: number; // ✅ P0 Fix #8: Original context index (matches [n] in answer)
  sourceType: 'analysis_report' | 'financial_report' | 'news';
  sourceId: string;
  title: string;
  url?: string;
  excerpt: string;
}

export interface AskQuestionRequest {
  question: string;
}

export interface QAResponse {
  answer: string;
  citations: Citation[];
}

// List response
export interface AnalysisReportListResponse {
  items: AnalysisReportListItem[];
  total: number;
  page: number;
  pageSize: number;
}
