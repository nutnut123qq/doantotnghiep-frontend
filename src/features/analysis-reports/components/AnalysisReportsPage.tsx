import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TickerSearch } from '@/shared/components/TickerSearch'
import { analysisReportApi } from '@/infrastructure/api/analysisReportApi'
import type { AnalysisReportListItem } from '@/shared/types/analysisReportTypes'
import { ImportReportDialog } from './ImportReportDialog'

const PAGE_SIZE = 10

export const AnalysisReportsPage = () => {
  const navigate = useNavigate()
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [isImportOpen, setIsImportOpen] = useState(false)

  const normalizedSymbol = useMemo(() => {
    return selectedSymbol ? selectedSymbol.trim().toUpperCase() : ''
  }, [selectedSymbol])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analysis-reports', normalizedSymbol, page, PAGE_SIZE],
    queryFn: () => analysisReportApi.getList(normalizedSymbol, page, PAGE_SIZE),
    enabled: !!normalizedSymbol,
  })

  useEffect(() => {
    if (error) {
      toast.error('Không thể tải danh sách báo cáo. Vui lòng thử lại.')
    }
  }, [error])

  const items: AnalysisReportListItem[] = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const disablePrev = page <= 1 || totalPages === 0
  const disableNext = page >= totalPages || totalPages === 0

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol.trim().toUpperCase())
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Báo cáo phân tích</CardTitle>
          <Button
            onClick={() => setIsImportOpen(true)}
            disabled={!normalizedSymbol}
          >
            Nhập báo cáo mới
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <TickerSearch onSelect={handleSelectSymbol} />
              {normalizedSymbol && (
                <Badge variant="outline">{normalizedSymbol}</Badge>
              )}
            </div>
            {normalizedSymbol && (
              <Button variant="outline" onClick={() => refetch()}>
                Làm mới
              </Button>
            )}
          </div>

          {!normalizedSymbol && (
            <div className="text-sm text-muted-foreground">
              Chọn mã cổ phiếu để tải danh sách báo cáo.
            </div>
          )}

          {isLoading && normalizedSymbol && (
            <div className="text-sm text-muted-foreground">Đang tải...</div>
          )}

          {normalizedSymbol && !isLoading && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>CTCK</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Khuyến nghị</TableHead>
                    <TableHead className="text-right">Giá mục tiêu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground"
                      >
                        Chưa có báo cáo nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() =>
                          navigate(`/analysis-reports/${item.id}`)
                        }
                      >
                        <TableCell title={item.contentPreview}>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {item.contentPreview}
                          </div>
                        </TableCell>
                        <TableCell>{item.firmName}</TableCell>
                        <TableCell>
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {item.recommendation ? (
                            <Badge variant="secondary">
                              {item.recommendation}
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.targetPrice
                            ? item.targetPrice.toLocaleString()
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Tổng: {total} • Trang {page}/{totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={disablePrev}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  disabled={disableNext}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ImportReportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        defaultSymbol={normalizedSymbol || undefined}
      />
    </div>
  )
}
