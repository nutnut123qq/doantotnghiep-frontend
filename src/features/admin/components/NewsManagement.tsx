import { useCallback, useEffect, useState } from 'react'
import type { News } from '@/features/dashboard/services/newsService'
import { adminService } from '../services/adminService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { Newspaper, RefreshCw, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '@/shared/utils/logger'
import { cn } from '@/lib/utils'

export function NewsManagement() {
  const [items, setItems] = useState<News[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadNews = useCallback(
    async (page: number) => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminService.getAdminNews(page, pageSize)
        setItems(data)
      } catch (err) {
        setError('Failed to load news')
        logger.error('Error loading news', { error: err })
      } finally {
        setLoading(false)
      }
    },
    [pageSize]
  )

  useEffect(() => {
    void loadNews(currentPage)
  }, [currentPage, loadNews])

  const handleVisibilityChange = useCallback(
    async (news: News, visible: boolean) => {
      const isDeleted = !visible
      const prev = !!news.isDeleted
      setTogglingId(news.id)
      setItems((rows) =>
        rows.map((n) => (n.id === news.id ? { ...n, isDeleted } : n))
      )
      try {
        await adminService.setNewsDeleted(news.id, isDeleted)
        toast.success(isDeleted ? 'Article hidden' : 'Article visible')
      } catch (err) {
        setItems((rows) =>
          rows.map((n) => (n.id === news.id ? { ...n, isDeleted: prev } : n))
        )
        logger.error('Error updating news visibility', { error: err })
        toast.error('Failed to update visibility')
      } finally {
        setTogglingId(null)
      }
    },
    []
  )

  const canGoNext = items.length === pageSize
  const canGoPrev = currentPage > 1

  if (loading && items.length === 0) {
    return <LoadingSkeleton />
  }

  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={() => void loadNews(currentPage)} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Newspaper className="h-5 w-5" />
          <span>Toggle visibility for users. Hidden articles stay in the database so crawlers will not re-add the same URL.</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadNews(currentPage)} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {items.length === 0 && !loading ? (
        <EmptyState
          icon={Newspaper}
          title="No news"
          description="There are no news items on this page."
        />
      ) : (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="max-w-[240px]">Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="w-[90px]">Link</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px] text-right">Visible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((n) => {
                  const hidden = !!n.isDeleted
                  return (
                    <TableRow key={n.id}>
                      <TableCell className="max-w-[240px]">
                        <span className="line-clamp-2 font-medium">{n.title}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{n.source}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(n.publishedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {n.url ? (
                          <a
                            href={n.url}
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
                      <TableCell>
                        {hidden ? (
                          <Badge variant="secondary">Hidden</Badge>
                        ) : (
                          <Badge variant="outline">Live</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={!hidden}
                            disabled={togglingId === n.id}
                            onCheckedChange={(checked) => void handleVisibilityChange(n, checked)}
                            aria-label={hidden ? 'Show article' : 'Hide article'}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(canGoPrev || canGoNext) && (
        <Card className="bg-[hsl(var(--surface-1))]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Page {currentPage}</div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!canGoPrev || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!canGoNext || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
