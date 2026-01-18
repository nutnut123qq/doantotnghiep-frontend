import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/shared/components/PageHeader'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { dataSourceService } from '../services/dataSourceService'
import type { DataSource, DataSourceType } from '@/shared/types/dataSourceTypes'
import {
  DATA_SOURCE_TYPE_LABELS,
  CONNECTION_STATUS_LABELS,
  ConnectionStatus,
} from '@/shared/types/dataSourceTypes'

export function DataSourceManagement() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)

  useEffect(() => {
    loadDataSources()
  }, [])

  const loadDataSources = async () => {
    try {
      setIsLoading(true)
      const sources = await dataSourceService.getAll()
      setDataSources(sources)
    } catch (error) {
      console.error('Error loading data sources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null)

  const handleTestConnection = async (id: string) => {
    try {
      setTestingId(id)
      await dataSourceService.testConnection(id)
      toast.success('Connection test successful')
      await loadDataSources() // Reload to get updated status
    } catch (error) {
      console.error('Error testing connection:', error)
      toast.error('Failed to test connection')
    } finally {
      setTestingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setSourceToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!sourceToDelete) return
    try {
      await dataSourceService.delete(sourceToDelete)
      toast.success('Data source deleted successfully')
      await loadDataSources()
    } catch (error) {
      console.error('Error deleting data source:', error)
      toast.error('Failed to delete data source')
    } finally {
      setDeleteConfirmOpen(false)
      setSourceToDelete(null)
    }
  }

  const handleToggleActive = async (source: DataSource) => {
    try {
      await dataSourceService.update(source.id, { isActive: !source.isActive })
      toast.success(`Data source ${!source.isActive ? 'activated' : 'deactivated'}`)
      await loadDataSources()
    } catch (error) {
      console.error('Error updating data source:', error)
      toast.error('Failed to update data source')
    }
  }

  const groupedSources = dataSources.reduce((acc, source) => {
    if (!acc[source.type]) {
      acc[source.type] = []
    }
    acc[source.type].push(source)
    return acc
  }, {} as Record<DataSourceType, DataSource[]>)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Configuration"
        description="Manage data sources for News, Stock, Financial Reports, and Events"
        actions={
          <Button
            onClick={() => {
              setEditingSource(null)
              setIsModalOpen(true)
            }}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Data Source</span>
          </Button>
        }
      />

      {Object.entries(groupedSources).map(([type, sources]) => (
        <Card key={type} className="bg-[hsl(var(--surface-1))]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[hsl(var(--text))]">
              {DATA_SOURCE_TYPE_LABELS[Number(type) as DataSourceType]} Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <EmptyState
                icon={Settings}
                title="No data sources configured"
                description="Add a data source to get started"
              />
            ) : (
              <div className="space-y-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-sm font-semibold text-[hsl(var(--text))]">{source.name}</h4>
                          <Badge
                            variant="outline"
                            className={cn(
                              source.status === ConnectionStatus.Connected
                                ? 'border-[hsl(var(--positive))] text-[hsl(var(--positive))]'
                                : 'border-[hsl(var(--negative))] text-[hsl(var(--negative))]'
                            )}
                          >
                            {source.status === ConnectionStatus.Connected ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {CONNECTION_STATUS_LABELS[source.status]}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={source.isActive}
                              onCheckedChange={() => handleToggleActive(source)}
                            />
                            <span className="text-xs text-[hsl(var(--muted))]">Active</span>
                          </div>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted))]">{source.url}</p>
                        {source.errorMessage && (
                          <p className="text-xs text-[hsl(var(--negative))] mt-1">{source.errorMessage}</p>
                        )}
                        {source.lastChecked && (
                          <p className="text-xs text-[hsl(var(--muted))] mt-1">
                            Last checked: {new Date(source.lastChecked).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(source.id)}
                          disabled={testingId === source.id}
                        >
                          {testingId === source.id ? 'Testing...' : 'Test'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingSource(source)
                            setIsModalOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Data Source"
        description="Are you sure you want to delete this data source? This action cannot be undone."
      />

      {isModalOpen && (
        <DataSourceModal
          source={editingSource}
          onClose={() => {
            setIsModalOpen(false)
            setEditingSource(null)
          }}
          onSave={async () => {
            await loadDataSources()
            setIsModalOpen(false)
            setEditingSource(null)
          }}
        />
      )}
    </div>
  )
}

interface DataSourceModalProps {
  source: DataSource | null
  onClose: () => void
  onSave: () => void
}

function DataSourceModal({ source, onSave, onClose }: DataSourceModalProps) {
  const [formData, setFormData] = useState({
    name: source?.name || '',
    type: source?.type || 1,
    url: source?.url || '',
    apiKey: source?.apiKey || '',
    isActive: source?.isActive ?? true,
    config: source?.config || '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      if (source) {
        await dataSourceService.update(source.id, formData)
      } else {
        await dataSourceService.create(formData)
      }
      toast.success('Data source saved successfully')
      onSave()
    } catch (error) {
      console.error('Error saving data source:', error)
      toast.error('Failed to save data source')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{source ? 'Edit Data Source' : 'Add Data Source'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type.toString()}
              onValueChange={(value) => setFormData({ ...formData, type: Number(value) })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">News</SelectItem>
                <SelectItem value="2">Stock</SelectItem>
                <SelectItem value="3">Financial Report</SelectItem>
                <SelectItem value="4">Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="apiKey">API Key (Optional)</Label>
            <Input
              id="apiKey"
              type="text"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

