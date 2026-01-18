import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Layout, Plus, Download, Upload, Trash2 } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { workspaceService } from '../services/workspaceService'
import { useWorkspace } from '../hooks/useWorkspace'
import { toast } from 'sonner'

interface SharedLayoutsProps {
  workspaceId: string
  canEdit: boolean
}

export const SharedLayouts = ({ workspaceId, canEdit }: SharedLayoutsProps) => {
  const queryClient = useQueryClient()
  
  // Load workspace to get layouts
  const { data: workspace, isLoading } = useWorkspace(workspaceId)

  // Remove layout mutation
  const removeLayoutMutation = useMutation({
    mutationFn: (layoutId: string) => workspaceService.removeLayout(workspaceId, layoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
      toast.success('Layout removed from workspace')
    },
    onError: () => {
      toast.error('Failed to remove layout')
    },
  })

  const handleImport = () => {
    // TODO: Implement layout import
    toast.info('Layout import feature coming soon')
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
      toast.success('Layout exported')
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
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            {canEdit && (
              <Button size="sm" className="flex items-center space-x-2" disabled>
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
                      {layout.shareCode && (
                        <div className="flex items-center space-x-4 text-xs text-[hsl(var(--muted))]">
                          <span className="font-mono">Code: {layout.shareCode}</span>
                        </div>
                      )}
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
    </Card>
  )
}
