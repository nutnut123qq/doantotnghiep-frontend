import { useState } from 'react'
import { useAlerts } from '../hooks/useAlerts'
import { CreateAlertModal } from './CreateAlertModal'
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
import { Plus, Trash2, Bell } from 'lucide-react'
import { AlertTypeLabels } from '../types/alert.types'
import type { Alert, CreateAlertRequest } from '../types/alert.types'
import { format } from 'date-fns'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { toast } from 'sonner'

export const AlertList = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null)

  const isActiveFilter = filter === 'all' ? undefined : filter === 'active'
  const {
    alerts,
    isLoading,
    error,
    createAlert,
    deleteAlert,
    toggleAlert,
    isCreating,
    isDeleting,
  } = useAlerts(isActiveFilter)

  const handleCreate = async (data: CreateAlertRequest) => {
    try {
      await createAlert(data)
      setIsCreateModalOpen(false)
      toast.success('Alert created successfully')
    } catch {
      toast.error('Failed to create alert')
    }
  }

  const handleDeleteClick = (id: string) => {
    setAlertToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!alertToDelete) return
    try {
      await deleteAlert(alertToDelete)
      toast.success('Alert deleted successfully')
      setAlertToDelete(null)
    } catch {
      toast.error('Failed to delete alert')
    }
  }

  const handleToggle = async (alert: Alert) => {
    try {
      await toggleAlert({ id: alert.id, isActive: !alert.isActive })
    } catch {
      // Error handled by hook
    }
  }

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      greater_than: '>',
      less_than: '<',
      equals: '=',
      percent_change_up: '% ↑',
      percent_change_down: '% ↓',
    }
    return labels[condition] || condition
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Alerts"
          description="Manage your stock market alerts"
          actions={
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Alert</span>
            </Button>
          }
        />

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Filter:</span>
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Your Alerts ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <ErrorState
                message={error instanceof Error ? error.message : 'Failed to load alerts'}
                onRetry={() => window.location.reload()}
              />
            ) : isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[hsl(var(--accent))] border-t-transparent"></div>
              </div>
            ) : alerts.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No alerts found"
                description="Create your first alert to get notified about market changes"
                action={{
                  label: 'Create Alert',
                  onClick: () => setIsCreateModalOpen(true),
                }}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Triggered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.symbol || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {AlertTypeLabels[alert.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getConditionLabel(alert.condition)}
                      </TableCell>
                      <TableCell>
                        {alert.threshold
                          ? alert.threshold.toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={alert.isActive ? 'default' : 'secondary'}
                        >
                          {alert.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(alert.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {alert.triggeredAt
                          ? format(new Date(alert.triggeredAt), 'MMM dd, yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggle(alert)}
                            title={alert.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Bell
                              className={`h-4 w-4 ${
                                alert.isActive
                                  ? 'text-[hsl(var(--positive))]'
                                  : 'text-[hsl(var(--muted))]'
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(alert.id)}
                            disabled={isDeleting}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-[hsl(var(--negative))]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Modal */}
        <CreateAlertModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
          isLoading={isCreating}
        />

        {/* Delete Confirm Dialog */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Alert"
          description="Are you sure you want to delete this alert? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </div>
  )
}
