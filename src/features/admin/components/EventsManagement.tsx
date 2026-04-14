import { useCallback, useEffect, useState } from 'react'
import { adminService, type AdminCorporateEvent } from '../services/adminService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { RefreshCw, CalendarDays, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/shared/utils/logger'
import { cn } from '@/lib/utils'

const EVENT_TYPE_LABELS: Record<number, string> = {
  1: 'Earnings',
  2: 'Dividend',
  3: 'Stock Split',
  4: 'AGM',
  5: 'Rights Issue',
}

export function EventsManagement() {
  const [items, setItems] = useState<AdminCorporateEvent[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadEvents = useCallback(
    async (page: number) => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminService.getAdminCorporateEvents(page, pageSize)
        setItems(data.items)
        setTotalCount(data.totalCount)
        setTotalPages(data.totalPages)
      } catch (err) {
        setError('Failed to load corporate events')
        logger.error('Error loading corporate events', { error: err })
      } finally {
        setLoading(false)
      }
    },
    [pageSize]
  )

  useEffect(() => {
    void loadEvents(currentPage)
  }, [currentPage, loadEvents])

  const handleVisibilityChange = useCallback(async (event: AdminCorporateEvent, visible: boolean) => {
    const isDeleted = !visible
    const previous = !!event.isDeleted
    setTogglingId(event.id)
    setItems((rows) => rows.map((e) => (e.id === event.id ? { ...e, isDeleted } : e)))

    try {
      await adminService.setCorporateEventDeleted(event.id, isDeleted)
      toast.success(isDeleted ? 'Event hidden' : 'Event visible')
    } catch (err) {
      setItems((rows) => rows.map((e) => (e.id === event.id ? { ...e, isDeleted: previous } : e)))
      logger.error('Error updating event visibility', { error: err })
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
  if (error && items.length === 0) return <ErrorState message={error} onRetry={() => void loadEvents(currentPage)} />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-5 w-5" />
          <span>Manage corporate event visibility with soft-delete (isDeleted).</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadEvents(currentPage)} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {items.length === 0 && !loading ? (
        <EmptyState icon={CalendarDays} title="No events" description="There are no corporate events on this page." />
      ) : (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead className="w-[90px]">Link</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px] text-right">Visible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((e) => {
                  const hidden = !!e.isDeleted
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="max-w-[280px]">
                        <span className="line-clamp-2 font-medium">{e.title}</span>
                      </TableCell>
                      <TableCell>{e.symbol ?? '—'}</TableCell>
                      <TableCell>{EVENT_TYPE_LABELS[e.eventType] ?? `Type ${e.eventType}`}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(e.eventDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {e.sourceUrl ? (
                          <a
                            href={e.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            Open
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{hidden ? <Badge variant="secondary">Hidden</Badge> : <Badge variant="outline">Live</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={!hidden}
                          disabled={togglingId === e.id}
                          onCheckedChange={(checked) => void handleVisibilityChange(e, checked)}
                          aria-label={hidden ? 'Show event' : 'Hide event'}
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
