import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { analysisReportApi } from '@/infrastructure/api/analysisReportApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { QAChatPanel } from './QAChatPanel'

export const AnalysisReportDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['analysis-report-detail', id],
    queryFn: () => analysisReportApi.getDetail(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (error) {
      toast.error('Không thể tải báo cáo. Vui lòng thử lại.')
    }
  }, [error])

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>
  }

  if (!data) {
    return (
      <div className="text-sm text-muted-foreground">
        Không tìm thấy báo cáo.
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{data.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
              <span>
                <b>Symbol:</b> {data.symbol}
              </span>
              <span>
                <b>CTCK:</b> {data.firmName}
              </span>
              <span>
                <b>Ngày:</b>{' '}
                {new Date(data.publishedAt).toLocaleDateString()}
              </span>
              {data.recommendation && (
                <Badge variant="secondary">{data.recommendation}</Badge>
              )}
              {data.targetPrice && (
                <span>
                  <b>Giá mục tiêu:</b> {data.targetPrice.toLocaleString()}
                </span>
              )}
            </div>
            {data.sourceUrl && (
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary underline"
              >
                <ExternalLink className="h-4 w-4" />
                {data.sourceUrl}
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="whitespace-pre-wrap text-sm leading-6">
              {data.content}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <QAChatPanel reportId={data.id} />
      </div>
    </div>
  )
}
