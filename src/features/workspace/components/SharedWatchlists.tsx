import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Plus, Users, Trash2 } from 'lucide-react'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { workspaceService } from '../services/workspaceService'
import { useWorkspace } from '../hooks/useWorkspace'
import { toast } from 'sonner'

interface SharedWatchlistsProps {
  workspaceId: string
  canEdit: boolean
}

export const SharedWatchlists = ({ workspaceId, canEdit }: SharedWatchlistsProps) => {
  const queryClient = useQueryClient()
  
  // Load workspace to get watchlists
  const { data: workspace, isLoading } = useWorkspace(workspaceId)

  // Remove watchlist mutation
  const removeWatchlistMutation = useMutation({
    mutationFn: (watchlistId: string) => workspaceService.removeWatchlist(workspaceId, watchlistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
      toast.success('Watchlist removed from workspace')
    },
    onError: () => {
      toast.error('Failed to remove watchlist')
    },
  })

  const watchlists = workspace?.watchlists || []

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <Card className="bg-[hsl(var(--surface-1))]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[hsl(var(--text))] flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Shared Watchlists</span>
          </CardTitle>
          {canEdit && (
            <Button size="sm" className="flex items-center space-x-2" disabled>
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {watchlists.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No shared watchlists"
            description="Add a watchlist to share with your team"
          />
        ) : (
          <div className="space-y-3">
            {watchlists.map((ww) => {
              const watchlist = ww.watchlist
              return (
                <div
                  key={ww.id}
                  className="p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] hover:bg-[hsl(var(--surface-3))] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-semibold text-[hsl(var(--text))]">
                          {watchlist.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          Shared
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-[hsl(var(--muted))]">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{watchlist.tickers?.length || 0} stocks</span>
                        </div>
                      </div>
                    </div>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWatchlistMutation.mutate(watchlist.id)}
                        disabled={removeWatchlistMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
