import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Layout, Plus, Download, Upload } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'

interface SharedLayout {
  id: string
  name: string
  description?: string
  createdBy: string
  createdAt: Date
  shareCode?: string
}

interface SharedLayoutsProps {
  workspaceId: string
  canEdit: boolean
}

const MOCK_LAYOUTS: SharedLayout[] = [
  {
    id: '1',
    name: 'Trading Dashboard',
    description: 'Optimized layout for active trading',
    createdBy: 'John Doe',
    createdAt: new Date(),
    shareCode: 'ABC123',
  },
  {
    id: '2',
    name: 'Analysis View',
    description: 'Focus on technical analysis',
    createdBy: 'Jane Smith',
    createdAt: new Date(),
    shareCode: 'XYZ789',
  },
]

export const SharedLayouts = ({ canEdit }: SharedLayoutsProps) => {
  const [layouts] = useState<SharedLayout[]>(MOCK_LAYOUTS)
  const [isLoading] = useState(false)

  const handleImport = () => {
    // TODO: Implement layout import
  }

  const handleExport = (layoutId: string) => {
    // TODO: Implement layout export for layoutId
    console.log('Exporting layout:', layoutId)
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

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
              <Button size="sm" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create</span>
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
            description="Create or import a layout to share with your team"
          />
        ) : (
          <div className="space-y-3">
            {layouts.map((layout) => (
              <div
                key={layout.id}
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
                    {layout.description && (
                      <p className="text-sm text-[hsl(var(--muted))] mb-2">
                        {layout.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-[hsl(var(--muted))]">
                      <span>Created by {layout.createdBy}</span>
                      {layout.shareCode && (
                        <span className="font-mono">Code: {layout.shareCode}</span>
                      )}
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
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
