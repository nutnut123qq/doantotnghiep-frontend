import { useState, useEffect } from 'react'
import { financialReportService, FinancialReport, FinancialMetrics } from '../services/financialReportService'
import { DocumentTextIcon, ChatBubbleLeftRightIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface FinancialReportsProps {
  symbol?: string
}

export const FinancialReports = ({ symbol = 'VIC' }: FinancialReportsProps) => {
  const [reports, setReports] = useState<FinancialReport[]>([])
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null)
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)

  useEffect(() => {
    loadReports()
  }, [symbol])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await financialReportService.getReportsBySymbol(symbol)
      setReports(data)
      if (data.length > 0) {
        selectReport(data[0])
      }
    } catch (error) {
      console.error('Error loading financial reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectReport = (report: FinancialReport) => {
    setSelectedReport(report)
    const parsedMetrics = financialReportService.parseContent(report.content)
    setMetrics(parsedMetrics)
    setAnswer('')
  }

  const handleAskQuestion = async () => {
    if (!selectedReport || !question.trim()) return

    try {
      setAsking(true)
      const response = await financialReportService.askQuestion(selectedReport.id, question)
      setAnswer(response.answer)
    } catch (error) {
      console.error('Error asking question:', error)
      setAnswer('Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại.')
    } finally {
      setAsking(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Báo cáo tài chính</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Báo cáo tài chính - {symbol}</h3>
        </div>
        <button
          onClick={loadReports}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Làm mới
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
          <p>Chưa có báo cáo tài chính</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report List */}
          <div className="lg:col-span-1">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Danh sách báo cáo</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => selectReport(report)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedReport?.id === report.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-medium text-sm text-slate-900">
                    {report.reportType} {report.year}
                    {report.quarter && ` Q${report.quarter}`}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(report.reportDate).toLocaleDateString('vi-VN')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Report Details */}
          <div className="lg:col-span-2">
            {selectedReport && metrics ? (
              <div className="space-y-6">
                {/* Financial Metrics */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-slate-700">Chỉ số tài chính</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard label="Doanh thu" value={financialReportService.formatCurrency(metrics.Revenue)} />
                    <MetricCard label="Lợi nhuận gộp" value={financialReportService.formatCurrency(metrics.GrossProfit)} />
                    <MetricCard label="Lợi nhuận hoạt động" value={financialReportService.formatCurrency(metrics.OperatingProfit)} />
                    <MetricCard label="Lợi nhuận sau thuế" value={financialReportService.formatCurrency(metrics.NetProfit)} />
                    <MetricCard label="EPS" value={metrics.EPS.toFixed(2)} />
                    <MetricCard label="ROE" value={financialReportService.formatPercent(metrics.ROE)} />
                    <MetricCard label="ROA" value={financialReportService.formatPercent(metrics.ROA)} />
                    <MetricCard label="Vốn chủ sở hữu" value={financialReportService.formatCurrency(metrics.Equity)} />
                  </div>
                </div>

                {/* AI Q&A */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-slate-700">Hỏi đáp AI</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                        placeholder="Đặt câu hỏi về báo cáo tài chính..."
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAskQuestion}
                        disabled={asking || !question.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {asking ? 'Đang xử lý...' : 'Hỏi'}
                      </button>
                    </div>

                    {/* Suggested Questions */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-slate-500">Gợi ý:</span>
                      {[
                        'Doanh thu tăng trưởng như thế nào?',
                        'Đánh giá khả năng sinh lời',
                        'So sánh với quý trước',
                        'Phân tích ROE và ROA'
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setQuestion(suggestion)}
                          className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    {answer && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-blue-900 mb-2">Trả lời AI:</p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">{answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Chọn một báo cáo để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
}

const MetricCard = ({ label, value }: MetricCardProps) => {
  return (
    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-xs text-slate-600 mb-1">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

