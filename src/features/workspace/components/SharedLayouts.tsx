import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Layout, Plus, Download, Upload, Trash2 } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { workspaceService } from '../services/workspaceService'
import { useWorkspace } from '../hooks/useWorkspace'
import { notify } from '@/shared/utils/notify'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { layoutService } from '@/features/dashboard/services/layoutService'
import { watchlistService } from '@/features/watchlist/services/watchlistService'

interface SharedLayoutsProps {
  workspaceId: string
  canEdit: boolean
}

export const SharedLayouts = ({ workspaceId, canEdit }: SharedLayoutsProps) => {
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>('')
  const [importCode, setImportCode] = useState('')
  const [importFile, setImportFile] = useState<File | null>(null)
  
  // Load workspace to get layouts
  const { data: workspace, isLoading } = useWorkspace(workspaceId)

  // Load user's layouts for selection
  const { data: userLayouts = [] } = useQuery({
    queryKey: ['user-layouts'],
    queryFn: async () => {
      // Get layout from service (returns LayoutConfig)
      const layout = await layoutService.getLayout()
      // Return as array format for selection
      return [{ id: layout.id, name: layout.name || 'My Layout' }]
    },
    enabled: isAddDialogOpen,
  })

  // Remove layout mutation
  const removeLayoutMutation = useMutation({
    mutationFn: (layoutId: string) => workspaceService.removeLayout(workspaceId, layoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
      notify.success('Layout removed from workspace')
    },
    onError: () => {
      notify.error('Failed to remove layout')
    },
  })

  // Add layout mutation
  const addLayoutMutation = useMutation({
    mutationFn: (layoutId: string) => workspaceService.addLayout(workspaceId, layoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
      notify.success('Layout added to workspace')
      setIsAddDialogOpen(false)
      setSelectedLayoutId('')
    },
    onError: () => {
      notify.error('Failed to add layout')
    },
  })

  const handleAdd = () => {
    if (!selectedLayoutId) {
      notify.warning('Please select a layout')
      return
    }
    addLayoutMutation.mutate(selectedLayoutId)
  }

  const handleImport = async () => {
    try {
      let importedLayout
      
      if (importFile) {
        importedLayout = await layoutService.importLayout(importFile)
      } else if (importCode.trim()) {
        importedLayout = await layoutService.importLayoutByCode(importCode.trim())
      } else {
        notify.warning('Please provide either a file or import code')
        return
      }

      // Save imported layout first
      await layoutService.saveLayout(importedLayout)
      
      // Then add to workspace
      await workspaceService.addLayout(workspaceId, importedLayout.id)
      
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
      notify.success('Layout imported and added to workspace')
      setIsImportDialogOpen(false)
      setImportCode('')
      setImportFile(null)
    } catch (error) {
      notify.error('Failed to import layout')
    }
  }

  const handleExport = (layoutId: string) => {
    // Find layout and export
    const workspaceLayout = workspace?.layouts?.find(wl => wl.layout.id === layoutId)
    if (workspaceLayout) {
      const config = workspaceLayout.layout.configuration
      const dataStr = JSON.stringify(JSON.parse(config), null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `layout_${workspaceLayout.layout.name}_${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      notify.success('Layout exported')
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  const layouts = workspace?.layouts || []

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Shared Layouts</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            {canEdit && (
              <Button size="sm" className="flex items-center space-x-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {layouts.length === 0 ? (
          <EmptyState
            icon={Layout}
            title="No shared layouts"
            description="Add or import a layout to share with your team"
          />
        ) : (
          <div className="space-y-3">
            {layouts.map((wl) => {
              const layout = wl.layout
              return (
                <div
                  key={wl.id}
                  className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-semibold text-[hsl(var(--text))]">
                          {layout.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Shared
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(layout.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLayoutMutation.mutate(layout.id)}
                          disabled={removeLayoutMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Add Layout Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Layout to Workspace</DialogTitle>
            <DialogDescription>
              Select a layout from your saved layouts to share with the workspace
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Layout</Label>
              <Select value={selectedLayoutId} onValueChange={setSelectedLayoutId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a layout" />
                </SelectTrigger>
                <SelectContent>
                  {userLayouts.map((layout) => (
                    <SelectItem key={layout.id} value={layout.id}>
                      {layout.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!selectedLayoutId || addLayoutMutation.isPending}>
                {addLayoutMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Layout Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Layout</DialogTitle>
            <DialogDescription>
              Import a layout from file or using a share code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Import Code</Label>
              <Input
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Paste layout share code here"
              />
            </div>
            <div className="text-center text-sm text-[hsl(var(--muted))]">OR</div>
            <div>
              <Label>Import from File</Label>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importCode.trim() && !importFile}>
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
