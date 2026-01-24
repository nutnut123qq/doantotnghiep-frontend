import { useEffect, useState, useCallback, useRef } from 'react'
import { adminService } from '../services/adminService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Layout, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminSharedLayoutInfo } from '@/shared/types/layoutTypes'

type LayoutStatus = 'all' | 'active' | 'expired'

export function SharedLayoutModeration() {
  const [layouts, setLayouts] = useState<AdminSharedLayoutInfo[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ownerIdFilter, setOwnerIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<LayoutStatus>('all')
  const [selectedLayout, setSelectedLayout] = useState<AdminSharedLayoutInfo | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  
  // Applied filter state - tracks the filters that were actually applied
  const [appliedFilters, setAppliedFilters] = useState({
    ownerId: '',
    status: 'all' as LayoutStatus,
  })

  const loadLayouts = useCallback(async (page: number, ownerId: string, status: LayoutStatus) => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllSharedLayouts(
        page,
        pageSize,
        ownerId || undefined,
        status
      )
      setLayouts(data.items)
      setTotalCount(data.totalCount)
    } catch (err) {
      console.error('Error loading shared layouts:', err)
      setError('Failed to load shared layouts')
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    loadLayouts(currentPage, appliedFilters.ownerId, appliedFilters.status)
  }, [currentPage, appliedFilters.ownerId, appliedFilters.status, loadLayouts])

  const applyFilters = useCallback(() => {
    setAppliedFilters({
      ownerId: ownerIdFilter,
      status: statusFilter,
    })
    setCurrentPage(1)
  }, [ownerIdFilter, statusFilter])

  const openDeleteConfirm = (layout: AdminSharedLayoutInfo) => {
    setSelectedLayout(layout)
    setConfirmOpen(true)
  }

  const handleDelete = useCallback(async () => {
    if (!selectedLayout) return
    try {
      await adminService.deleteSharedLayout(selectedLayout.id)
      toast.success('Shared layout deleted')
      setConfirmOpen(false)
      await loadLayouts(currentPage, appliedFilters.ownerId, appliedFilters.status)
    } catch (err) {
      console.error('Error deleting shared layout:', err)
      toast.error('Failed to delete shared layout')
    }
  }, [selectedLayout, currentPage, appliedFilters.ownerId, appliedFilters.status, loadLayouts])

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading && layouts.length === 0) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadLayouts(currentPage, appliedFilters.ownerId, appliedFilters.status)} />
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Shared Layouts</span>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={ownerIdFilter}
              onChange={(e) => setOwnerIdFilter(e.target.value)}
              placeholder="Filter by Owner ID"
              className="w-56"
            />
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as LayoutStatus)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={applyFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Apply
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => loadLayouts(currentPage, appliedFilters.ownerId, appliedFilters.status)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {layouts.length === 0 ? (
          <EmptyState
            icon={Layout}
            title="No shared layouts"
            description="No layouts match the current filters"
          />
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Public</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {layouts.map((layout) => (
                  <TableRow key={layout.id}>
                    <TableCell className="font-mono text-xs">{layout.code}</TableCell>
                    <TableCell className="text-xs">{layout.ownerId}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(layout.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(layout.expiresAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={layout.isExpired ? 'secondary' : 'default'}>
                        {layout.isExpired ? 'Expired' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={layout.isPublic ? 'outline' : 'secondary'}>
                        {layout.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteConfirm(layout)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete shared layout"
        description="Are you sure you want to delete this shared layout? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </Card>
  )
}
