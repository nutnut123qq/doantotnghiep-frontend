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
import {
  PlusIcon,
  TrashIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { AlertTypeLabels } from '../types/alert.types'
import type { Alert, CreateAlertRequest } from '../types/alert.types'
import { format } from 'date-fns'

export const AlertList = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const isActiveFilter = filter === 'all' ? undefined : filter === 'active'
  const {
    alerts,
    isLoading,
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
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this alert?')) {
      try {
        await deleteAlert(id)
      } catch (error) {
        // Error handled by hook
      }
    }
  }

  const handleToggle = async (alert: Alert) => {
    try {
      await toggleAlert({ id: alert.id, isActive: !alert.isActive })
    } catch (error) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Alerts
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your stock market alerts
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Alert</span>
          </Button>
        </div>

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
              <BellIcon className="h-5 w-5" />
              <span>Your Alerts ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BellIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-lg font-medium">No alerts found</p>
                <p className="text-sm mt-2">
                  Create your first alert to get notified about market changes
                </p>
              </div>
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
                            <BellIcon
                              className={`h-4 w-4 ${
                                alert.isActive
                                  ? 'text-green-600'
                                  : 'text-gray-400'
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(alert.id)}
                            disabled={isDeleting}
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4 text-red-600" />
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
      </div>
    </div>
  )
}
