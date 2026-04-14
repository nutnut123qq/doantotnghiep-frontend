import { useCallback, useEffect, useState } from 'react'
import { adminService, type AdminFinancialReport } from '../services/adminService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { RefreshCw, Landmark } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/shared/utils/logger'
import { cn } from '@/lib/utils'

export function FinanceManagement() {
  const [items, setItems] = useState<AdminFinancialReport[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadReports = useCallback(
    async (page: number) => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminService.getAdminFinancialReports(page, pageSize)
        setItems(data.items)
        setTotalCount(data.totalCount)
        setTotalPages(data.totalPages)
      } catch (err) {
        setError('Failed to load financial reports')
        logger.error('Error loading financial reports', { error: err })
      } finally {
        setLoading(false)
      }
    },
    [pageSize]
  )

  useEffect(() => {
    void loadReports(currentPage)
  }, [currentPage, loadReports])

  const handleVisibilityChange = useCallback(async (report: AdminFinancialReport, visible: boolean) => {
    const isDeleted = !visible
    const previous = !!report.isDeleted
    setTogglingId(report.id)
    setItems((rows) => rows.map((r) => (r.id === report.id ? { ...r, isDeleted } : r)))

    try {
      await adminService.setFinancialReportDeleted(report.id, isDeleted)
      toast.success(isDeleted ? 'Report hidden' : 'Report visible')
    } catch (err) {
      setItems((rows) => rows.map((r) => (r.id === report.id ? { ...r, isDeleted: previous } : r)))
      logger.error('Error updating report visibility', { error: err })
      toast.error('Failed to update visibility')
    } finally {
      setTogglingId(null)
    }
  }, [])

  const getPageNumbers = () => {
    if (totalPages <= 0) return []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const canGoNext = currentPage < totalPages
  const canGoPrev = currentPage > 1

  if (loading && items.length === 0) return <LoadingSkeleton />
  if (error && items.length === 0) return <ErrorState message={error} onRetry={() => void loadReports(currentPage)} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Landmark className="h-5 w-5" />
          <span>Manage financial report visibility with soft-delete (isDeleted).</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadReports(currentPage)} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {items.length === 0 && !loading ? (
        <EmptyState icon={Landmark} title="No reports" description="There are no financial reports on this page." />
      ) : (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px] text-right">Visible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r) => {
                  const hidden = !!r.isDeleted
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.symbol ?? '—'}</TableCell>
                      <TableCell>{r.reportType}</TableCell>
                      <TableCell>{r.quarter ? `Q${r.quarter} ${r.year}` : `${r.year}`}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(r.reportDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{hidden ? <Badge variant="secondary">Hidden</Badge> : <Badge variant="outline">Live</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={!hidden}
                          disabled={togglingId === r.id}
                          onCheckedChange={(checked) => void handleVisibilityChange(r, checked)}
                          aria-label={hidden ? 'Show report' : 'Hide report'}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {totalPages > 0 && (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Total {totalCount} items - Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={!canGoPrev || loading}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={!canGoNext || loading}>
                  Next
                </Button>
                {getPageNumbers().map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading || pageNum === currentPage}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
